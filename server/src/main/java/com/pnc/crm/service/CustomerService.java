package com.pnc.crm.service;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pnc.crm.event.CustomerEvent;
import com.pnc.crm.event.CustomerEventPublisher;
import com.pnc.crm.repositories.CustomerRepository;
import com.pnc.crm.entities.Customer;
import com.pnc.crm.entities.CustomerStatus;

@Service
public class CustomerService {

    private final CustomerRepository repository;
    private final CustomerEventPublisher eventPublisher;

    public CustomerService(CustomerRepository repository, CustomerEventPublisher eventPublisher) {
        this.repository = repository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public Customer create(Customer input, String correlationId) {
        var entity = new Customer();
        entity.setPublicId(input.publicIdIsNull() ? generatePublicId() : input.getPublicId());
        entity.setFullName(input.getFullName());
        entity.setEmail(input.getEmail());
        entity.setPhone(input.getPhone());
        entity.setStatus(input.getStatus());

        Customer saved = repository.save(entity);
        publishEvent("CUSTOMER_CREATED", saved, correlationId);
        return saved;
    }

    @Transactional
    public Customer update(Customer existing, Customer input, String correlationId) {
        existing.setFullName(input.getFullName());
        existing.setEmail(input.getEmail());
        existing.setPhone(input.getPhone());
        existing.setStatus(input.getStatus());

        Customer saved = repository.save(existing);
        publishEvent("CUSTOMER_UPDATED", saved, correlationId);
        return saved;
    }

    @Transactional(readOnly = true)
    public Page<Customer> pageByStatus(String status, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by("id").descending());
        var customerStatus = CustomerStatus.valueOf(status.toUpperCase());
        return repository.findByStatus(customerStatus, pageable);
    }

    public String generatePublicId() {
        long count = repository.count() + 1;
        return "CUS-" + (1000 + count);
    }

    private void publishEvent(String eventType, Customer customer, String correlationId) {
        String eventCorrelationId = correlationId == null || correlationId.isBlank()
                ? UUID.randomUUID().toString()
                : correlationId;

        CustomerEvent event = new CustomerEvent(
                UUID.randomUUID().toString(),
                eventType,
                1,
                null,
                customer.getPublicId(),
                eventCorrelationId,
                "crm-api",
                new CustomerEvent.CustomerData(customer.getFullName(), customer.getStatus().name()));
        eventPublisher.publish(event);
    }
}
