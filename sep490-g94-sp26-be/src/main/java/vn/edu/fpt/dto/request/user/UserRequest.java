package vn.edu.fpt.dto.request.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class UserRequest {

    @Email(message = "Email không hợp lệ")
    @NotBlank(message = "Email không được để trống")
    private String email;

    @NotBlank(message = "Full name không được để trống")
    private String fullName;

    @Pattern(regexp = "^(0[0-9]{9})$", message = "Số điện thoại không hợp lệ")
    private String phone;

    @NotNull(message = "chức vụ không được để trống")
    private Integer roleId;

    @NotNull(message = "Địa điểm không được null")
    private Integer locationId;

    private String password;
}
