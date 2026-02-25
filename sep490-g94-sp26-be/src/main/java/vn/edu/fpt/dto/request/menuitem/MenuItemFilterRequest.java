package vn.edu.fpt.dto.request.menuitem;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuItemFilterRequest {
    private String code;
    private String name;
    private Integer CategoryMenuItemsId;
    private Integer locationId;
    private BigDecimal upperBoundUnitPrice = BigDecimal.valueOf(Double.MAX_VALUE);
    private BigDecimal lowerBoundUnitPrice = BigDecimal.ZERO;
    private String description;
}
