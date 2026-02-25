package vn.edu.fpt.dto.request.customer;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerUpdateRequest {
    String fullName;

    String citizenIdNumber;

    @Pattern(regexp = "^(0|\\+84)[0-9]{9,10}$",
            message = "Số điện thoại không hợp lệ")
    String phone;

    @Email(message = "Email không đúng định dạng")
    String email;

    String taxCode;

    String address;

    String notes;

    Integer locationId;
}
