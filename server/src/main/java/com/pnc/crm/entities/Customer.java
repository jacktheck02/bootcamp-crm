package com.pnc.crm.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

@Entity
@Table(name = "customers")
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @JsonIgnore
    private UUID id;

    // Public-facing customer id like "CUS-1001". Stored separately and unique.
    @Column(name = "public_id", unique = true)
    private String publicId;

    @NotNull @Column(name = "full_name", nullable = false) private String fullName;
    @NotNull @Email @Column(name = "email", nullable = false) private String email;

    private String phone;

    @NotNull
    @Enumerated(EnumType.STRING)
    private CustomerStatus status;

    public Customer() {}

    public Customer(String name, String email, CustomerStatus status) {
        this.fullName = name;
        this.email = email;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    @JsonProperty("id")
    public String getPublicId() {
        return publicId;
    }

    public void setPublicId(String publicId) {
        this.publicId = publicId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public CustomerStatus getStatus() {
        return status;
    }

    public void setStatus(CustomerStatus status) {
        this.status = status;
    }
}
