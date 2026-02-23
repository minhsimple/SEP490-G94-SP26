package vn.edu.fpt.dto.request.servicepackage;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServicePackageFilterRequest {
    String code;

    String name;

    String description;

    BigDecimal basePrice = BigDecimal.ZERO;

    Integer locationId;

    private BigDecimal lowerBoundSetPrice;
    private BigDecimal upperBoundSetPrice;
}
