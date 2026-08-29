package com.pnc.crm;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.pnc.crm.event.CustomerEvent;
import com.pnc.crm.event.ProcessedEventStore;
import com.pnc.crm.repositories.CustomerRepository;
import com.pnc.crm.repositories.InteractionRepository;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.apache.kafka.clients.consumer.Consumer;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.support.serializer.JsonDeserializer;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.kafka.KafkaContainer;

@SpringBootTest
@AutoConfigureMockMvc
@Import({TestcontainersConfiguration.class, TestSecurityConfig.class, TestJwtConfig.class})
class TestCustomerKafkaIntegration {

    @Autowired MockMvc mockMvc;
    @Autowired CustomerRepository customerRepository;
    @Autowired InteractionRepository interactionRepository;
    @Autowired ProcessedEventStore processedEventStore;
    @Autowired KafkaContainer kafkaContainer;

    private static final String CUSTOMER_EVENTS_TOPIC = "customer-events";

    @BeforeEach
    void cleanDatabase() {
        interactionRepository.deleteAll();
        customerRepository.deleteAll();
    }

    @Test
    void creatingCustomerPublishesAndListenerProcessesKafkaEvent() throws Exception {
        String correlationId = "it-corr-" + UUID.randomUUID();

        mockMvc.perform(
                        post("/customers")
                                .with(csrf())
                                .header("X-Correlation-Id", correlationId)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        """
                                        {
                                          "fullName": "Kafka Test",
                                          "email": "kafka-test@mail.com",
                                          "status": "ACTIVE"
                                        }
                                        """))
                .andExpect(status().isOk());

        ConsumerRecord<String, CustomerEvent> matchingRecord = pollForCustomerCreatedEvent(correlationId);
        assertNotNull(matchingRecord, "Expected a CUSTOMER_CREATED event to be published");
        assertNotNull(matchingRecord.value());
        assertEquals(matchingRecord.key(), matchingRecord.value().customerId());
        assertEquals("CUSTOMER_CREATED", matchingRecord.value().eventType());
        assertEquals(correlationId, matchingRecord.value().correlationId());
        assertNotNull(matchingRecord.value().eventId());
        assertNotNull(matchingRecord.value().data());
        assertEquals("Kafka Test", matchingRecord.value().data().fullName());
        assertEquals("ACTIVE", matchingRecord.value().data().status());

        waitForListenerToProcess(matchingRecord.value().eventId());
        assertTrue(processedEventStore.hasSeen(matchingRecord.value().eventId()));
    }

    private ConsumerRecord<String, CustomerEvent> pollForCustomerCreatedEvent(String correlationId) {
        Map<String, Object> props = Map.of(
        ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, kafkaContainer.getBootstrapServers(),
                ConsumerConfig.GROUP_ID_CONFIG, "kafka-it-" + UUID.randomUUID(),
                ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest",
                ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class,
                ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, JsonDeserializer.class,
                JsonDeserializer.TRUSTED_PACKAGES, "com.pnc.crm.event",
                JsonDeserializer.VALUE_DEFAULT_TYPE, CustomerEvent.class.getName(),
                JsonDeserializer.USE_TYPE_INFO_HEADERS, false);

        DefaultKafkaConsumerFactory<String, CustomerEvent> factory = new DefaultKafkaConsumerFactory<>(props);
        try (Consumer<String, CustomerEvent> consumer = factory.createConsumer()) {
            consumer.subscribe(List.of(CUSTOMER_EVENTS_TOPIC));
            Instant deadline = Instant.now().plusSeconds(10);
            while (Instant.now().isBefore(deadline)) {
                ConsumerRecords<String, CustomerEvent> records = consumer.poll(Duration.ofMillis(250));
                for (ConsumerRecord<String, CustomerEvent> record : records) {
                    CustomerEvent event = record.value();
                    if (event != null
                            && correlationId.equals(event.correlationId())
                            && "CUSTOMER_CREATED".equals(event.eventType())) {
                        return record;
                    }
                }
            }
            return null;
        }
    }

    private void waitForListenerToProcess(String eventId) throws InterruptedException {
        Instant deadline = Instant.now().plusSeconds(10);
        while (Instant.now().isBefore(deadline)) {
            if (processedEventStore.hasSeen(eventId)) {
                return;
            }
            Thread.sleep(100);
        }
    }
}
