package vn.edu.fpt.dto.request.lead;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;
import vn.edu.fpt.enums.LeadState;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeadRequest {
    @NotBlank(message = "Họ tên không được để trống")
    String fullName;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^(0|\\+84)[0-9]{9,10}$",
            message = "Số điện thoại không hợp lệ")
    String phone;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    String email;

    String source;

    String notes;

    LeadState state;

//    String createdFrom;

    Integer locationId;
}
