package com.pnc.crm.controllers;

import com.pnc.crm.entities.Customer;
import com.pnc.crm.repositories.CustomerRepository;
import com.pnc.crm.service.CustomerService;

import jakarta.validation.Valid;

import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@RestController
@RequestMapping("/customers")
public class CustomerController {

    private final CustomerRepository repository;
    private final CustomerService service;

    public CustomerController(CustomerRepository repository, CustomerService service) {
        this.repository = repository;
        this.service = service;
    }

    @PostMapping
    public Customer addCustomer(@Valid @RequestBody Customer customer) {
        if (customer.idIsNull()) {
            customer.setPublicId(service.generatePublicId());
        }
        return repository.save(customer);
    }

    @GetMapping
    public List<Customer> getAllCustomers() {
        return repository.findAll();
    }

    @GetMapping("/paginated")
    public Page<Customer> list(
            @RequestParam(defaultValue = "ACTIVE") String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return service.pageByStatus(status, page, size);
    }
}
