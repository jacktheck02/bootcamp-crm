package com.pnc.crm.repositories;

import com.pnc.crm.entities.Customer;
import com.pnc.crm.entities.Interaction;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InteractionRepository extends JpaRepository<Interaction, Long> {
    List<Interaction> findByCustomerOrderByCreatedAtDesc(Customer customer);
}
