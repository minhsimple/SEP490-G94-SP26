package vn.edu.fpt.dto.request.customer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.edu.fpt.enums.RecordStatus;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomersFilterRequest {
    private String fullName;
    private String citizenIdNumber;
    private String phone;
    private String email;
    private String taxCode;
    private String address;
    private String notes;
    private Integer locationId;
    private RecordStatus status;
}
