package vn.edu.fpt.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;
import vn.edu.fpt.util.enums.RecordStatus;

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
    private RecordStatus status;;

}
