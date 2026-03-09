package vn.edu.fpt.dto.response.customer;

import lombok.*;
import lombok.experimental.FieldDefaults;
import vn.edu.fpt.util.enums.RecordStatus;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CustomerResponse {
    Integer id;

    String fullName;

    String phone;

    String email;

    String address;

    String notes;

    Integer locationId;

    String locationName;

    RecordStatus status;
}
