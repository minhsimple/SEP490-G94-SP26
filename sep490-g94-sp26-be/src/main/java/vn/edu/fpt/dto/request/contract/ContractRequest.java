package vn.edu.fpt.dto.request.contract;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.edu.fpt.dto.request.customer.CustomerRequest;
import vn.edu.fpt.util.enums.BookingTime;
import vn.edu.fpt.util.enums.TableLayoutEnum;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

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

    @NotNull(message = "Thông tin bố trí bàn không được để trống")
    @Valid
    TableLayoutRequest tableLayoutRequest;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TableLayoutRequest {
        @Valid
        @NotEmpty(message = "Danh sách bố trí bàn không được để trống")
        List<TableLayoutDetailRequest> tableLayoutDetailRequestList;

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class TableLayoutDetailRequest {
            @NotNull(message = "Khu vực bàn không được để trống")
            TableLayoutEnum tableLayoutEnum;

            @NotBlank(message = "Tên nhóm không được để trống")
            String groupName;

            @NotNull(message = "Số lượng bàn không được để trống")
            Integer numberOfTables;
        }
    }
}
