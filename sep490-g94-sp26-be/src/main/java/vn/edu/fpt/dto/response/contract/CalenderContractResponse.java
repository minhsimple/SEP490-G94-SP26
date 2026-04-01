package vn.edu.fpt.dto.response.contract;

import lombok.*;
import lombok.experimental.FieldDefaults;
import vn.edu.fpt.util.enums.BookingTime;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CalenderContractResponse {
    LocalDateTime startTime;
    LocalDateTime endTime;
    BookingTime bookingTime;
    Integer hallId;
    String hallName;
}
