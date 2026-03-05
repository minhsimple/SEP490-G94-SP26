package vn.edu.fpt.dto.request.lead;

import lombok.*;
import vn.edu.fpt.util.enums.LeadState;
import vn.edu.fpt.util.enums.RecordStatus;

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

    RecordStatus status;
}
