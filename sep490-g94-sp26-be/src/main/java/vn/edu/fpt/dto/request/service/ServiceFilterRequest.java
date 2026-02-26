package vn.edu.fpt.dto.request.service;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceFilterRequest {
    String code;

    String name;

    String description;

    String unit;

    BigDecimal lowerBoundItemPrice;
    BigDecimal upperBoundItemPrice;

    Integer locationId;
}
