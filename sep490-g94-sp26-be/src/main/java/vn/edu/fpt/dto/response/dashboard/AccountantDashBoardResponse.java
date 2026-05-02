package vn.edu.fpt.dto.response.dashboard;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountantDashBoardResponse {
    LocalDate fromDate;
    LocalDate toDate;

    Integer locationId;
    String locationName;

    CashFlow cashFlow;
    Invoice invoice;
    PendingAction pendingAction;
    PaymentMethod paymentMethod;


    // ===== CASH FLOW =====
    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class CashFlow {
        BigDecimal totalExpectedRevenue;   // Tổng doanh thu dự kiến
        BigDecimal totalCollectedAmount;   // Tổng tiền đã thu
        BigDecimal totalOutstandingDebt;   // Tổng nợ còn lại
        BigDecimal totalRefundedAmount;    // Tổng tiền đã hoàn
    }

    // ===== INVOICE =====
    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class Invoice {
        Integer totalUnpaid;         // Chưa thanh toán
        Integer totalPartiallyPaid;  // Thanh toán 1 phần
        Integer totalPaid;           // Đã thanh toán
    }

    // ===== PENDING ACTION =====
    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class PendingAction {
        Integer pendingPaymentsCount;     // Số payment đang chờ
        BigDecimal pendingPaymentsAmount; // Tổng tiền đang chờ
    }

    // ===== PAYMENT METHOD =====
    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class PaymentMethod {
        BigDecimal totalCash;           // Tiền mặt
        BigDecimal totalBankTransfer;   // Chuyển khoản
    }
}

