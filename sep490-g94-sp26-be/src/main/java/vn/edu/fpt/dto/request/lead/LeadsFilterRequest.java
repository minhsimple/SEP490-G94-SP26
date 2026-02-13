package vn.edu.fpt.dto.request.lead;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import vn.edu.fpt.enums.LeadState;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeadsFilterRequest {

    String fullName;

    String phone;

    String email;

    String source;

    String notes;

    Integer assignedSalesId;

    LeadState state;

//    String createdFrom;

    Integer locationId;
}
