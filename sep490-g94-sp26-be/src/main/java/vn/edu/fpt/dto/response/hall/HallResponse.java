package vn.edu.fpt.dto.response.hall;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class HallResponse {
    Integer id;
    String code;
    String name;
    Integer locationId;
    String locationName;
    Integer capacity;
    String notes;
}

