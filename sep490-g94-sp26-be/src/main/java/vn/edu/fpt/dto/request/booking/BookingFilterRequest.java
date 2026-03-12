package vn.edu.fpt.dto.request.booking;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.edu.fpt.util.enums.BookingState;
import vn.edu.fpt.util.enums.BookingTime;
import vn.edu.fpt.util.enums.RecordStatus;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingFilterRequest {
    private String bookingNo;
    private Integer customerId;
    private Integer hallId;
    private LocalDate bookingDateFrom;
    private LocalDate bookingDateTo;
    private BookingTime bookingTime;
    private BookingState bookingState;
    private Integer salesId;
    private String brideName;
    private String groomName;
    private RecordStatus status;
}


