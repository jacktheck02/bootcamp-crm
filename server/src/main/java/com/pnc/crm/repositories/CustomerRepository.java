package com.pnc.crm.repositories;

import com.pnc.crm.entities.Customer;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CustomerRepository extends JpaRepository<Customer, UUID> {
    Optional<Customer> findByCustomerId(String customerId);
}
