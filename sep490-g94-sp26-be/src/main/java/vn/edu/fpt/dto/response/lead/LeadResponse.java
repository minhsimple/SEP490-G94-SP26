package vn.edu.fpt.dto.response.lead;

import lombok.*;
import lombok.experimental.FieldDefaults;
import vn.edu.fpt.util.enums.LeadState;
import vn.edu.fpt.util.enums.RecordStatus;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LeadResponse {

    Integer id;

    String fullName;

    String phone;

    String email;

    String source;

    String notes;

    LeadState leadState;

    Integer assignedSalesId;

    Integer locationId;

    String locationName;

    String address;

    RecordStatus status;

}
