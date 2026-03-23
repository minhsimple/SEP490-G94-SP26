package vn.edu.fpt.config;

import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "payos")
public class PayOSProperties {
    private String clientId;
    private String apiKey;
    private String checksumKey;

    private String baseUrl;
    private String createPaymentPath = "/v2/payment-requests";
    private String returnUrl;
    private String cancelUrl;
}

