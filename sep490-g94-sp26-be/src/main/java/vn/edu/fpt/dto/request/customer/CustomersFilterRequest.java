package vn.edu.fpt.dto.request.customer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomersFilterRequest {
    String fullName;
    String citizenIdNumber;
    String phone;
    String email;
    String taxCode;
    String address;
    String notes;
    Integer locationId;
}
