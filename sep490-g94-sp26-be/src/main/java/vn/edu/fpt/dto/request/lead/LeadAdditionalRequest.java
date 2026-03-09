package vn.edu.fpt.dto.request.lead;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeadAdditionalRequest {
    @NotBlank(message = "Địa chỉ không đc để trống")
    String address;
}
