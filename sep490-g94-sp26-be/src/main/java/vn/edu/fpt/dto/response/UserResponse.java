package vn.edu.fpt.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserResponse {
    private Integer id;
    private String email;
    private String fullName;
    private String phone;
    private Integer roleId;
    private Integer locationId;

}
