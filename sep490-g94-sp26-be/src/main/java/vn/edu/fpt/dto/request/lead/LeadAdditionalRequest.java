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
    @NotBlank(message = "Số CMND/CCCD không đc để trống")
    String citizenIdNumber;

    @NotBlank(message = "Mã số thuế không đc để trống")
    String taxCode;

    @NotBlank(message = "Địa chỉ không đc để trống")
    String address;
}
