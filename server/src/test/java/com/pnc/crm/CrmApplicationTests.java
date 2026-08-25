package com.pnc.crm;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;

@Import({TestcontainersConfiguration.class, TestSecurityConfig.class, TestJwtConfig.class})
@SpringBootTest
class CrmApplicationTests {


	@Test
	void contextLoads() {
	}

}
