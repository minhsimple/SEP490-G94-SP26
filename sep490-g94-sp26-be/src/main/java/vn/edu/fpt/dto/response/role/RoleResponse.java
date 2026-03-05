package vn.edu.fpt.dto.response.role;

import lombok.*;
import lombok.experimental.FieldDefaults;
import vn.edu.fpt.util.enums.RecordStatus;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoleResponse {

    Integer id;

    String code;

    String name;

    RecordStatus status;
}
