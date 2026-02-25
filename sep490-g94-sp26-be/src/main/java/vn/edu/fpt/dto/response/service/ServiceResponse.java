package vn.edu.fpt.dto.response.service;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ServiceResponse {

    Integer id;

    String code;

    String name;

    String description;

    String unit;

    BigDecimal basePrice = BigDecimal.ZERO;

    Integer locationId;
}
