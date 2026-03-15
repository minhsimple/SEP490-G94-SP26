package vn.edu.fpt.dto.request.booking;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.edu.fpt.util.enums.BookingState;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingStatusRequest {

    @NotNull(message = "Mã đặt tiệc không được để trống")
    Integer bookingId;

    @NotNull(message = "Trạng thái đặt tiệc không được để trống")
    BookingState bookingState;
}
