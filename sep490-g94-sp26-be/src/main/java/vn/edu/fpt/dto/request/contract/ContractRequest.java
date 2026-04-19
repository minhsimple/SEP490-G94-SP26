package vn.edu.fpt.dto.request.contract;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.edu.fpt.dto.request.customer.CustomerRequest;
import vn.edu.fpt.util.enums.BookingTime;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContractRequest {

    Integer customerId;

    @Valid
    @NotNull(message = "Thông tin khách hàng không đợc để trống")
    CustomerRequest customerRequest;

    @NotNull(message = "Mã hội trường không được để trống")
    Integer hallId;

    @NotNull(message = "Ngày đặt tiệc không được để trống")
    LocalDate bookingDate;

    @NotNull(message = "Khung giờ tiệc không được để trống")
    BookingTime bookingTime;

    Integer expectedTables;

    Integer expectedGuests;

    Integer assignCoordinatorId;

    Integer packageId;

    Integer setMenuId;

    Integer salesId;

    LocalDateTime reservedUntil;

    String notes;

    @NotNull(message = "Tên cô dâu không được để trống")
    String brideName;

    Integer brideAge;

    @NotNull(message = "Tên chú rể không được để trống")
    String groomName;

    Integer groomAge;

    String brideFatherName;

    String brideMotherName;

    String groomFatherName;

    String groomMotherName;

    Integer PaymentPercentage;

}
