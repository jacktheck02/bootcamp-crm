package com.pnc.crm.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pnc.crm.repositories.CustomerRepository;
import com.pnc.crm.entities.Customer;
import com.pnc.crm.entities.CustomerStatus;

@Service
public class CustomerService {

    private final CustomerRepository repository;

    public CustomerService(CustomerRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public Customer create(String publicId, String fullName, String email, CustomerStatus status) {
        var entity = new Customer();
        entity.setPublicId(generatePublicId());
        entity.setFullName(fullName);
        entity.setEmail(email);
        entity.setStatus(status);
        return repository.save(entity);
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
}
