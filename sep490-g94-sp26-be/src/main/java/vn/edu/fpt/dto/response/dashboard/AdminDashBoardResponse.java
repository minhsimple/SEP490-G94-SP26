package vn.edu.fpt.dto.response.dashboard;

import lombok.*;
import lombok.experimental.FieldDefaults;
import vn.edu.fpt.entity.Location;

import java.math.BigDecimal;
import java.util.List;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashBoardResponse {

    private String period;
    private Summary summary;
    private List<Center> centers;

    // ================= SUMMARY =================
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Summary {
        private Financial financial;
        private Business business;
        private Operation operation;
        private Customer customer;
    }

    // ================= CENTER =================
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Center {
        private Integer centerId;
        private String centerName;

        private Financial financial;
        private Business business;
        private Operation operation;
        private Customer customer;
    }

    // ================= BLOCKS =================
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Financial {
        private BigDecimal totalRevenue;
        private BigDecimal expectedRevenue;
        private Double collectionRate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Business {
        private Integer newContracts;
        private Integer expiringContracts;
        private Integer liquidatedContracts;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Operation {
        private Integer totalIncidents;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Customer {
        private Integer newCustomers;
        private Integer totalActiveResidents;
    }
}
