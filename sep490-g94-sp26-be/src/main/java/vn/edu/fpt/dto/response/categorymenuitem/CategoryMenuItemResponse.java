package vn.edu.fpt.dto.response.categorymenuitem;

import lombok.*;
import lombok.experimental.FieldDefaults;
import vn.edu.fpt.util.enums.RecordStatus;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CategoryMenuItemResponse {
    Integer id;
    String name;
    String description;
    RecordStatus status;
}
