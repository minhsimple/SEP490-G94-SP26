package vn.edu.fpt.dto.response.customer;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CustomerResponse {
    Integer id;

    String fullName;

    String citizenIdNumber;

    String phone;

    String email;

    String taxCode;

    String address;

    String notes;

    Integer locationId;

    String locationName;
}
