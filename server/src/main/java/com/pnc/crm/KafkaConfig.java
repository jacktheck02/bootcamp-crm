package com.pnc.crm;

import com.pnc.crm.event.CustomerEvent;

import org.apache.kafka.common.serialization.StringDeserializer;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.boot.kafka.autoconfigure.KafkaProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;
import org.springframework.kafka.support.serializer.JacksonJsonDeserializer;
import org.springframework.kafka.support.serializer.JacksonJsonSerializer;

import tools.jackson.databind.json.JsonMapper;

/**
 * Kafka producer and consumer configuration.
 *
 * <p>Both {@link JacksonJsonSerializer} and {@link JacksonJsonDeserializer} are wired
 * with the Spring Boot auto-configured {@link JsonMapper}, which already has the
 * {@code JavaTimeModule} registered so that {@code java.time.Instant} fields on
 * {@link CustomerEvent} are handled correctly.
 */
@Configuration
public class KafkaConfig {

    @Bean
    public ProducerFactory<String, CustomerEvent> kafkaProducerFactory(
            KafkaProperties properties, JsonMapper jsonMapper) {
        JacksonJsonSerializer<CustomerEvent> serializer = new JacksonJsonSerializer<>(jsonMapper);
        serializer.setAddTypeInfo(false);
        return new DefaultKafkaProducerFactory<>(
                properties.buildProducerProperties(),
                new StringSerializer(),
                serializer);
    }

    @Bean
    public KafkaTemplate<String, CustomerEvent> kafkaTemplate(
            ProducerFactory<String, CustomerEvent> kafkaProducerFactory) {
        return new KafkaTemplate<>(kafkaProducerFactory);
    }

    @Bean
    public ConsumerFactory<String, CustomerEvent> kafkaConsumerFactory(
            KafkaProperties properties, JsonMapper jsonMapper) {
        JacksonJsonDeserializer<CustomerEvent> deserializer =
                new JacksonJsonDeserializer<>(CustomerEvent.class, jsonMapper);
        deserializer.addTrustedPackages("com.pnc.crm.event");
        deserializer.setRemoveTypeHeaders(true);
        return new DefaultKafkaConsumerFactory<>(
                properties.buildConsumerProperties(),
                new StringDeserializer(),
                deserializer);
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, CustomerEvent> kafkaListenerContainerFactory(
            ConsumerFactory<String, CustomerEvent> kafkaConsumerFactory) {
        ConcurrentKafkaListenerContainerFactory<String, CustomerEvent> factory =
                new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(kafkaConsumerFactory);
        return factory;
    }
}
