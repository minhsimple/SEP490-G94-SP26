package vn.edu.fpt.dto.response.booking;

import lombok.*;
import lombok.experimental.FieldDefaults;
import vn.edu.fpt.util.enums.BookingState;
import vn.edu.fpt.util.enums.BookingTime;
import vn.edu.fpt.util.enums.RecordStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookingResponse {
    Integer id;
    String bookingNo;
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
    BookingState bookingState;
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
}


