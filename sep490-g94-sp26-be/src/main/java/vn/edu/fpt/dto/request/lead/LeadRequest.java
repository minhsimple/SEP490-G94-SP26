package vn.edu.fpt.dto.request.lead;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import vn.edu.fpt.enums.LeadState;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeadRequest {
    @NotBlank(message = "Họ tên không được để trống")
    String fullName;

    String phone;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    String email;

    String source;

    String notes;

    Integer assignedSalesId;

    LeadState state;

//    String createdFrom;

    Integer locationId;
}
