package com.pnc.crm.event;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
public class CustomerEventPublisher {

    private final KafkaTemplate<String, CustomerEvent> kafkaTemplate;
    private final String topic;

    public CustomerEventPublisher(
            KafkaTemplate<String, CustomerEvent> kafkaTemplate,
            @Value("${crm.kafka.customer-events-topic}") String topic) {
        this.kafkaTemplate = kafkaTemplate;
        this.topic = topic;
    }

    public void publish(CustomerEvent event) {
        // send with key = event.customerId() to ensure partitioning by customer
        String key = event.customerId();
        kafkaTemplate.send(topic, key, event);
    }
}