package vn.edu.fpt.dto.request.categorymenuitem;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.edu.fpt.enums.RecordStatus;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryMenuItemFilterRequest {
    private String name;
    private String description;
    private RecordStatus status;
}
