package vn.edu.fpt.dto.request.service;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Comment;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceRequest {
    @NotBlank(message = "Mã dịch vụ không được để trống")
    String code;

    @NotBlank(message = "Tên dịch vụ không được để trống")
    String name;

    String description;

    String unit;

    BigDecimal basePrice = BigDecimal.ZERO;

    Integer locationId;
}
