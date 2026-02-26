package vn.edu.fpt.dto.response.servicepackage;

import lombok.*;
import lombok.experimental.FieldDefaults;
import vn.edu.fpt.entity.PackageService;
import vn.edu.fpt.entity.Services;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ServicePackageResponse {
    Integer id;
    String code;
    String name;
    String description;
    BigDecimal basePrice;
    Integer locationId;
    List<PackageService> ServiceResponseList;
}
