package vn.edu.fpt.dto.response.location;

import lombok.*;
import lombok.experimental.FieldDefaults;
import vn.edu.fpt.util.enums.RecordStatus;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LocationResponse {

    private Integer id;

    private String code;

    private String name;

    private String address;

    private String notes;

    RecordStatus status;
}
