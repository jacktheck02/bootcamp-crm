package com.pnc.crm;

import com.pnc.crm.entities.Customer;
import com.pnc.crm.entities.CustomerStatus;
import com.pnc.crm.repositories.CustomerRepository;

import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;
import org.testcontainers.kafka.KafkaContainer;
import org.testcontainers.postgresql.PostgreSQLContainer;
import org.testcontainers.utility.DockerImageName;

import java.util.List;

@TestConfiguration(proxyBeanMethods = false)
class TestcontainersConfiguration {

    @Bean
    @ServiceConnection
    KafkaContainer kafkaContainer() {
        return new KafkaContainer(DockerImageName.parse("apache/kafka:3.9.1"));
    }

    @Bean
    @ServiceConnection
    PostgreSQLContainer postgresContainer() {
        return new PostgreSQLContainer(DockerImageName.parse("postgres:16"));
    }

    @Bean
    ApplicationRunner seedCustomers(CustomerRepository repository) {
        return args -> {
            try {
                if (repository.count() > 0) {
                    return;
                }
            } catch (Exception e) {
                // Tables don't exist yet (e.g., Flyway disabled in tests)
                return;
            }
            try {
                repository.saveAll(
                        List.of(
                                new Customer("Amina Khan", "amina@mail.com", CustomerStatus.ACTIVE),
                                new Customer("Ravi Singh", "ravi@mail.com", CustomerStatus.PROSPECT)));
            } catch (Exception e) {
                // Gracefully handle if seeding fails
            }
        };
    }
}
