package vn.edu.fpt.dto.request.contract;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.edu.fpt.util.enums.BookingTime;
import vn.edu.fpt.util.enums.ContractState;
import vn.edu.fpt.util.enums.RecordStatus;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContractFilterRequest {
    private String contractNo;
    private Integer customerId;
    private Integer hallId;
    private LocalDate bookingDateFrom;
    private LocalDate bookingDateTo;
    private BookingTime bookingTime;
    private ContractState contractState;
    private Integer salesId;
    private String brideName;
    private String groomName;
    private RecordStatus status;
}


