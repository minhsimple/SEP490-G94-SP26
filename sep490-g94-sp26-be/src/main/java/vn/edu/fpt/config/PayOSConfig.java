package vn.edu.fpt.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;
import vn.payos.PayOS;

@Configuration
@EnableConfigurationProperties(PayOSProperties.class)
@RequiredArgsConstructor
public class PayOSConfig {

    private final PayOSProperties payOSProperties;

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper();
    }

    @Bean
    public PayOS payOS() {
        return new PayOS(
                payOSProperties.getClientId(),
                payOSProperties.getApiKey(),
                payOSProperties.getChecksumKey()
        );
    }
}

