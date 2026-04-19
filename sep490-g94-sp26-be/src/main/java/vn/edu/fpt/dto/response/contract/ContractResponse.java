package vn.edu.fpt.dto.response.contract;

import lombok.*;
import lombok.experimental.FieldDefaults;
import vn.edu.fpt.dto.response.customer.CustomerResponse;
import vn.edu.fpt.dto.response.tablelayout.TableLayoutResponse;
import vn.edu.fpt.util.enums.BookingTime;
import vn.edu.fpt.util.enums.ContractState;
import vn.edu.fpt.util.enums.RecordStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ContractResponse {
    CustomerResponse customerResponse;

    Integer id;
    String contractNo;
    Integer customerId;
    Integer hallId;
    LocalDate bookingDate;
    BookingTime bookingTime;
    LocalDateTime startTime;
    LocalDateTime endTime;
    Integer expectedTables;
    Integer expectedGuests;
    Integer packageId;
    Integer setMenuId;
    ContractState contractState;
    Integer salesId;
    LocalDateTime reservedUntil;
    String notes;
    String brideName;
    Integer brideAge;
    String groomName;
    Integer groomAge;
    String brideFatherName;
    String brideMotherName;
    String groomFatherName;
    String groomMotherName;
    RecordStatus status;
    Integer assignCoordinatorId;
    String assignCoordinatorName;
    LocalDateTime createdAt;
    TableLayoutResponse tableLayoutResponse;
}


