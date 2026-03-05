package vn.edu.fpt.dto.request.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.edu.fpt.enums.RecordStatus;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserFilterRequest {

    private String email;

    private String fullName;

    private String phone;

    private Integer roleId;

    private Integer locationId;

    private RecordStatus status;

}
