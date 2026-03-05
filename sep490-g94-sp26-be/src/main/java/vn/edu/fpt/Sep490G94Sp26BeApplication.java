package vn.edu.fpt;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing(auditorAwareRef = "auditorAwareImpl")
public class Sep490G94Sp26BeApplication {

	public static void main(String[] args) {
		SpringApplication.run(Sep490G94Sp26BeApplication.class, args);
	}

}
