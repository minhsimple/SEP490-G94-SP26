package vn.edu.fpt.dto.request.hall;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HallFilterRequest {
    private String code;
    private String name;
    private Integer locationId;
    private Integer minCapacity;
    private Integer maxCapacity;
    private String notes;
}

