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
public class CustomerRequest {
    @NotBlank(message = "Họ tên không đc để trống")
    String fullName;

    @NotBlank(message = "Số CMND/CCCD không đc để trống")
    String citizenIdNumber;

    @NotBlank(message = "Số điện thoại không đc để trống")
    @Pattern(regexp = "^(0|\\+84)[0-9]{9,10}$",
            message = "Số điện thoại không hợp lệ")
    String phone;

    @Email(message = "Email không đúng định dạng")
    String email;

    @NotBlank(message = "Mã số thuế không đc để trống")
    String taxCode;

    @NotBlank(message = "Địa chỉ không đc để trống")
    String address;

    String notes;

    @NotNull(message = "Vui lòng chọn chi nhánh trung tâm")
    Integer locationId;
}
