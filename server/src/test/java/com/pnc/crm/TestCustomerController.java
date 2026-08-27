package com.pnc.crm;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.pnc.crm.entities.Customer;
import com.pnc.crm.entities.CustomerStatus;
import com.pnc.crm.repositories.CustomerRepository;
import com.pnc.crm.security.JwtService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

@SpringBootTest
@AutoConfigureMockMvc
@Import({TestcontainersConfiguration.class, TestSecurityConfig.class, TestJwtConfig.class})
class TestCustomerController {

    @Autowired MockMvc mockMvc;

    @Autowired CustomerRepository repository;
    @Autowired JwtService jwtService;


    @BeforeEach
    void cleanDatabase() {
        repository.deleteAll();
    }

    @Test
    void createAndListCustomers()
            throws Exception { // Throws Exception in tests is not a code smell as its use case is
        // for testing.
        mockMvc.perform(
                        post("/customers")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        """
                                        {
                                          "fullName": "Amina Khan",
                                          "email": "amina@mail.com",
                                          "status": "ACTIVE"
                                        }
                                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.fullName").value("Amina Khan"));

        mockMvc.perform(get("/customers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));

        List<Customer> customers = repository.findAll();
        Customer c = customers.get(0);
        assertEquals(1, customers.size());
        assertEquals("Amina Khan", c.getFullName());
        assertEquals("amina@mail.com", c.getEmail());
        assertEquals(CustomerStatus.ACTIVE, c.getStatus());
    }

    @Test
    void rejectsInvalidEmail() throws Exception {
        mockMvc.perform(
                        post("/customers")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        """
                                        {
                                          "fullName": "Bad Email",
                                          "email": "not-an-email",
                                          "status": "PROSPECT"
                                        }
                                        """))
                .andExpect(status().isBadRequest());

        assertEquals(0, repository.findAll().size());
    }

    @Test
    void agentCannotChangeCustomerStatus() throws Exception {
        Customer existing = new Customer();
        existing.setPublicId("CUS-2001");
        existing.setFullName("Amina Khan");
        existing.setEmail("amina@mail.com");
        existing.setPhone("555-0101");
        existing.setStatus(CustomerStatus.ACTIVE);
        repository.save(existing);

        String agentToken = jwtService.issueToken("agent1", "AGENT");

        mockMvc.perform(
                        put("/api/customers/CUS-2001")
                                .header("Authorization", "Bearer " + agentToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        """
                                        {
                                          "fullName": "Amina Khan Updated",
                                          "email": "amina.updated@mail.com",
                                          "phone": "555-0109",
                                          "status": "SUSPENDED"
                                        }
                                        """))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Only admins can change customer status"));

        Customer persisted = repository.findByPublicId("CUS-2001").orElseThrow();
        assertEquals(CustomerStatus.ACTIVE, persisted.getStatus());
    }

    @Test
    void adminCanChangeCustomerStatus() throws Exception {
        Customer existing = new Customer();
        existing.setPublicId("CUS-2002");
        existing.setFullName("Ravi Singh");
        existing.setEmail("ravi@mail.com");
        existing.setPhone("555-0201");
        existing.setStatus(CustomerStatus.PROSPECT);
        repository.save(existing);

        String adminToken = jwtService.issueToken("admin1", "ADMIN");

        mockMvc.perform(
                        put("/api/customers/CUS-2002")
                                .header("Authorization", "Bearer " + adminToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        """
                                        {
                                          "fullName": "Ravi Singh Updated",
                                          "email": "ravi.updated@mail.com",
                                          "phone": "555-0209",
                                          "status": "ACTIVE"
                                        }
                                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACTIVE"));

        Customer persisted = repository.findByPublicId("CUS-2002").orElseThrow();
        assertEquals(CustomerStatus.ACTIVE, persisted.getStatus());
    }
}
