package com.pnc.crm.repositories;

import com.pnc.crm.entities.Customer;
import com.pnc.crm.entities.Interaction;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface InteractionRepository extends JpaRepository<Interaction, UUID> {
    List<Interaction> findByCustomerOrderByCreatedAtDesc(Customer customer);
}
