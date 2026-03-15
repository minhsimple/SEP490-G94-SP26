package vn.edu.fpt.dto.request.booking;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.edu.fpt.util.enums.BookingTime;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingRequest {

    @NotNull(message = "Mã khách hàng không được để trống")
    Integer customerId;

    @NotNull(message = "Mã hội trường không được để trống")
    Integer hallId;

    @NotNull(message = "Ngày đặt tiệc không được để trống")
    LocalDate bookingDate;

    @NotNull(message = "Khung giờ đặt tiệc không được để trống")
    BookingTime bookingTime;

    Integer expectedTables;

    Integer expectedGuests;

    Integer packageId;

    Integer setMenuId;

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
}
