package com.pnc.crm.repositories;

import com.pnc.crm.entities.Customer;
import com.pnc.crm.entities.CustomerStatus;

import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByPublicId(String publicId);
    boolean existsByEmail(String email);
    Page<Customer> findByStatus(CustomerStatus status, Pageable pageable);
}
