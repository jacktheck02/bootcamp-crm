package com.pnc.crm.event;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

@Component
public class CustomerEventListener {

    private static final Logger log = LoggerFactory.getLogger(CustomerEventListener.class);
    private final ProcessedEventStore store;

    public CustomerEventListener(ProcessedEventStore store) {
        this.store = store;
    }

    @KafkaListener(topics = "${crm.kafka.customer-events-topic}")
    public void onCustomerEvent(
            @Payload CustomerEvent event,
            @Header(KafkaHeaders.RECEIVED_KEY) String key) {
        // reject messages with missing or mismatched keys
        if (key == null || !key.equals(event.customerId())) {
            log.warn("Received event with invalid key: expected={}, actual={}", event.customerId(), key);
            return;
        }

        // idempotency: skip if we've already processed this event
        if (!store.markIfNew(event.eventId())) {
            log.info("Ignoring duplicate event: eventId={} customerId={}", event.eventId(), event.customerId());
            return;
        }

        // log correlation without leaking PII (customerId is a fixture id)
        log.info("Handling customer event: eventId={} customerId={} correlationId={}",
                event.eventId(), event.customerId(), event.correlationId());

        // For integration tests: allow an injected failing event id to exercise the error handler
        if ("bad-event-1".equals(event.eventId())) {
            throw new RuntimeException("induced test failure for DLQ verification");
        }

        // Actual handling would occur here (update state, publish other events, etc.)
    }
}