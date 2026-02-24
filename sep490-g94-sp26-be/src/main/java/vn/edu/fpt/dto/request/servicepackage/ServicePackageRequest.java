package vn.edu.fpt.dto.request.servicepackage;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServicePackageRequest {

    @NotNull(message = "Tên mã dịch vụ không được để trống")
    String code;

    @NotNull(message = "Tên dịch vụ không được để trống")
    String name;

    String description;

    Integer locationId;

    List<ServiceItemRequest> serviceList;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ServiceItemRequest {

        @NotNull(message = "ID dịch vụ không được để trống")
        Integer serviceId;

        @NotNull(message = "Số lượng dịch vu không được để trống")
        BigDecimal qty;
    }


}
