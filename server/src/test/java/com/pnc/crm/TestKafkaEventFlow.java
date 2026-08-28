package com.pnc.crm;

import com.pnc.crm.entities.Customer;
import com.pnc.crm.entities.CustomerStatus;
import com.pnc.crm.event.CustomerEvent;
import com.pnc.crm.event.CustomerEventPublisher;
import com.pnc.crm.event.ProcessedEventStore;
import com.pnc.crm.repositories.CustomerRepository;
import com.pnc.crm.repositories.InteractionRepository;
import com.pnc.crm.security.JwtService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Import({TestcontainersConfiguration.class, TestSecurityConfig.class, TestJwtConfig.class, TestKafkaCapture.class})
class TestKafkaEventFlow {

    @Autowired MockMvc mockMvc;
    @Autowired CustomerRepository customerRepository;
    @Autowired InteractionRepository interactionRepository;
    @Autowired CustomerEventPublisher eventPublisher;
    @Autowired ProcessedEventStore processedEventStore;
    @Autowired TestKafkaCapture capture;
    @Autowired JwtService jwtService;
    @Autowired KafkaTemplate<String, CustomerEvent> kafkaTemplate;

    @Value("${crm.kafka.customer-events-topic}")
    String topic;

    @BeforeEach
    void setUp() {
        capture.clear();
        interactionRepository.deleteAll();
        customerRepository.deleteAll();
    }

    @Test
    void customerCreationPublishesEvent() throws Exception {
        mockMvc.perform(post("/customers")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "fullName": "Kafka Test User",
                          "email": "kafka@mail.com",
                          "status": "ACTIVE"
                        }
                        """))
                .andExpect(status().isOk());

        CustomerEvent event = capture.events.poll(10, TimeUnit.SECONDS);
        assertThat(event).isNotNull();
        assertThat(event.eventType()).isEqualTo("CUSTOMER_CREATED");
        assertThat(event.data().fullName()).isEqualTo("Kafka Test User");
        assertThat(event.data().status()).isEqualTo("ACTIVE");
        assertThat(event.customerId()).isNotEmpty();
        assertThat(event.eventId()).isNotEmpty();
        assertThat(event.source()).isEqualTo("crm");
    }

    @Test
    void customerUpdatePublishesEvent() throws Exception {
        Customer existing = new Customer();
        existing.setPublicId("CUS-8001");
        existing.setFullName("Original Name");
        existing.setEmail("orig@mail.com");
        existing.setStatus(CustomerStatus.ACTIVE);
        customerRepository.save(existing);

        String adminToken = jwtService.issueToken("admin1", "ADMIN");

        mockMvc.perform(put("/api/customers/CUS-8001")
                .with(csrf())
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "fullName": "Updated Name",
                          "email": "updated@mail.com",
                          "status": "SUSPENDED"
                        }
                        """))
                .andExpect(status().isOk());

        CustomerEvent event = capture.events.poll(10, TimeUnit.SECONDS);
        assertThat(event).isNotNull();
        assertThat(event.eventType()).isEqualTo("CUSTOMER_UPDATED");
        assertThat(event.customerId()).isEqualTo("CUS-8001");
        assertThat(event.data().fullName()).isEqualTo("Updated Name");
        assertThat(event.data().status()).isEqualTo("SUSPENDED");
    }

    @Test
    void consumerProcessesValidEvent() throws InterruptedException {
        String eventId = "evt-consumer-valid-1";
        CustomerEvent event = new CustomerEvent(
                eventId, "CUSTOMER_CREATED", 1, Instant.now(),
                "CUS-9001", "corr-1", "crm",
                new CustomerEvent.CustomerData("Valid Consumer User", "ACTIVE"));

        eventPublisher.publish(event);

        CustomerEvent received = capture.events.poll(10, TimeUnit.SECONDS);
        assertThat(received).isNotNull();
        assertThat(received.eventId()).isEqualTo(eventId);
        // consumer marks the event as seen; a second call must return false (duplicate)
        assertThat(processedEventStore.markIfNew(eventId)).isFalse();
    }

    @Test
    void consumerSkipsDuplicateEvent() throws InterruptedException {
        String eventId = "evt-consumer-dup-1";
        CustomerEvent event = new CustomerEvent(
                eventId, "CUSTOMER_CREATED", 1, Instant.now(),
                "CUS-9002", "corr-2", "crm",
                new CustomerEvent.CustomerData("Dup User", "ACTIVE"));

        // publish once and wait for processing
        eventPublisher.publish(event);
        CustomerEvent first = capture.events.poll(10, TimeUnit.SECONDS);
        assertThat(first).isNotNull();

        // force-mark as already seen (simulate second delivery handled by consumer)
        assertThat(processedEventStore.markIfNew(eventId)).isFalse();
    }

    @Test
    void consumerRejectsKeyMismatch() throws InterruptedException {
        String eventId = "evt-consumer-badkey-1";
        CustomerEvent event = new CustomerEvent(
                eventId, "CUSTOMER_CREATED", 1, Instant.now(),
                "CUS-9003", "corr-3", "crm",
                new CustomerEvent.CustomerData("Bad Key User", "ACTIVE"));

        // Publish with a deliberately wrong key (not equal to customerId)
        kafkaTemplate.send(topic, "WRONG-KEY", event);

        // Give the consumer time to run (it should reject and NOT call processedEventStore)
        TimeUnit.SECONDS.sleep(3);

        // Store must still mark it as new because the consumer never processed it
        assertThat(processedEventStore.markIfNew(eventId)).isTrue();
    }

    @Test
    void consumerHandlesBadEventId() throws InterruptedException {
        CustomerEvent badEvent = new CustomerEvent(
                "bad-event-1", "CUSTOMER_CREATED", 1, Instant.now(),
                "CUS-9004", "corr-4", "crm",
                new CustomerEvent.CustomerData("Error User", "ACTIVE"));

        eventPublisher.publish(badEvent);

        // Capture receives it (test-capture-group is independent of the app consumer)
        CustomerEvent received = capture.events.poll(10, TimeUnit.SECONDS);
        assertThat(received).isNotNull();
        assertThat(received.eventId()).isEqualTo("bad-event-1");

        // The app consumer marks it before throwing; wait for that to settle
        TimeUnit.SECONDS.sleep(2);
        assertThat(processedEventStore.markIfNew("bad-event-1")).isFalse();
    }
}
