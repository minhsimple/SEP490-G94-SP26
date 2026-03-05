package vn.edu.fpt.dto.request.hall;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.edu.fpt.enums.RecordStatus;

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
    private RecordStatus status;
}

