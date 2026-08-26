package com.pnc.crm.controllers;

import com.pnc.crm.entities.Customer;
import com.pnc.crm.entities.Interaction;
import com.pnc.crm.repositories.CustomerRepository;
import com.pnc.crm.repositories.InteractionRepository;

import com.pnc.crm.service.CustomerService;
import jakarta.validation.Valid;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/customers")
public class CustomerController {

    private final CustomerRepository repository;
    private final InteractionRepository interactionRepository;
    private final CustomerService service;

    public CustomerController(CustomerRepository repository, InteractionRepository interactionRepository, CustomerService service) {
        this.repository = repository;
        this.interactionRepository = interactionRepository;
        this.service = service;
    }

    @PostMapping
    public Customer addCustomer(@Valid @RequestBody Customer customer) {
        // If client didn't supply a public-facing customer ID, generate the next one starting at 1001.
        if (customer.getPublicId() == null || customer.getPublicId().trim().isEmpty()) {
            List<Customer> all = repository.findAll();
            int max = 0;
            for (Customer c : all) {
                String cid = c.getPublicId();
                if (cid == null) continue;
                String digits = cid.replaceAll("\\D", "");
                if (digits.isEmpty()) continue;
                try {
                    int n = Integer.parseInt(digits);
                    if (n > max) max = n;
                } catch (NumberFormatException ignored) {}
            }
            int next = (max == 0) ? 1001 : (max + 1);
            customer.setPublicId("CUS-" + next);
        }

        return repository.save(customer);
    }

    @GetMapping
    public List<Customer> getAllCustomers(@RequestParam(name = "q", required = false) String q) {
        List<Customer> all = repository.findAll();

        if (q == null || q.trim().isEmpty()) {
            return all;
        }

        String normalized = q.trim().toLowerCase();

        return all.stream()
                .filter(c -> {
                    String id = c.getPublicId() != null ? c.getPublicId() : "";
                    return id.toLowerCase().contains(normalized)
                            || (c.getFullName() != null && c.getFullName().toLowerCase().contains(normalized))
                            || (c.getEmail() != null && c.getEmail().toLowerCase().contains(normalized));
                })
                .collect(Collectors.toList());
    }

    @GetMapping("/paginated")
    public Page<Customer> list(
            @RequestParam(defaultValue = "ACTIVE") String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return service.pageByStatus(status, page, size);
    }

    @GetMapping("/{id}")
    public Customer getCustomer(@PathVariable("id") String id) {
        return repository.findByPublicId(id).orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
    }

    @PutMapping("/{id}")
    public Customer updateCustomer(@PathVariable("id") String id, @Valid @RequestBody Customer input) {
        Customer existing = repository.findByPublicId(id).orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        existing.setFullName(input.getFullName());
        existing.setEmail(input.getEmail());
        existing.setPhone(input.getPhone());
        existing.setStatus(input.getStatus());

        return repository.save(existing);
    }

    @GetMapping("/{id}/interactions")
    public List<Interaction> getInteractions(@PathVariable("id") String id) {
        Customer customer = repository.findByPublicId(id).orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        return interactionRepository.findByCustomerOrderByCreatedAtDesc(customer);
    }

    @PostMapping("/{id}/interactions")
    @ResponseStatus(HttpStatus.CREATED)
    public Interaction createInteraction(@PathVariable("id") String id, @RequestBody Interaction input) {
        Customer customer = repository.findByPublicId(id).orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        Interaction interaction = new Interaction();
        interaction.setCustomer(customer);
        interaction.setType(input.getType());
        interaction.setSummary(input.getSummary());
        interaction.setCreatedAt(OffsetDateTime.now());

        return interactionRepository.save(interaction);
    }

    static class ResourceNotFoundException extends RuntimeException {
        ResourceNotFoundException(String message) {
            super(message);
        }
    }

    @GetMapping("/paginated")
    public Page<Customer> list(
            @RequestParam(defaultValue = "ACTIVE") String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return service.pageByStatus(status, page, size);
    }
}
