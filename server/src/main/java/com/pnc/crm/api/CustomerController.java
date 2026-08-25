package com.pnc.crm.controllers;

import com.pnc.crm.entities.Customer;
import com.pnc.crm.repositories.CustomerRepository;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/customers")
public class CustomerController {

    private final CustomerRepository repository;

    public CustomerController(CustomerRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public Customer addCustomer(@Valid @RequestBody Customer customer) {
        return repository.save(customer);
    }

    @GetMapping
    public List<Customer> getAllCustomers() {
        return repository.findAll();
    }
}
