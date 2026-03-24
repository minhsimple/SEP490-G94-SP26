package vn.edu.fpt.dto.response.payos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WebhookAcknowledgeResponse {
    private boolean processed;
    private String message;
}

