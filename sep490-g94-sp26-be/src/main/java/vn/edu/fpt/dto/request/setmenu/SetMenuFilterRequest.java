package vn.edu.fpt.dto.request.setmenu;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SetMenuFilterRequest {
    private String code;
    private String name;
    private String description;
    private Integer locationId;
    private BigDecimal lowerBoundSetPrice;
    private BigDecimal upperBoundSetPrice;
}
