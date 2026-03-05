package vn.edu.fpt.dto.request.role;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.edu.fpt.util.enums.RecordStatus;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleRequest {
    String code;

    String name;

    RecordStatus status;
}
