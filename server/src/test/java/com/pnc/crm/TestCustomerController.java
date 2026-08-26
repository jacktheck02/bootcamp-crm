package com.pnc.crm;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.pnc.crm.entities.Customer;
import com.pnc.crm.entities.CustomerStatus;
import com.pnc.crm.repositories.CustomerRepository;

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
@Import(TestcontainersConfiguration.class)
class TestCustomerController {

    @Autowired MockMvc mockMvc;

    @Autowired CustomerRepository repository;

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
                .andExpect(jsonPath("$.id").value("CUS-1001"))
                .andExpect(jsonPath("$.publicId").doesNotExist())
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
}
