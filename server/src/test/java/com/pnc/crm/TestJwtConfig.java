package com.pnc.crm;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;

import com.pnc.crm.security.JwtService;

@TestConfiguration
public class TestJwtConfig {

    @Bean
    public JwtService jwtService() {
        return new JwtService("test-secret");
    }
}
