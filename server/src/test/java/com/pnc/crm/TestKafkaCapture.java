package com.pnc.crm;

import com.pnc.crm.event.CustomerEvent;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

import java.util.concurrent.LinkedBlockingQueue;

/** Test-only component that taps the customer-events topic into a blocking queue. */
@Component
class TestKafkaCapture {

    final LinkedBlockingQueue<CustomerEvent> events = new LinkedBlockingQueue<>();

    @KafkaListener(topics = "${crm.kafka.customer-events-topic}", groupId = "test-capture-group")
    void onEvent(@Payload CustomerEvent event) {
        events.add(event);
    }

    void clear() {
        events.clear();
    }
}
