package vn.edu.fpt.dto.request.contract;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CalenderContractRequest {
    LocalDateTime startTime;
    LocalDateTime endTime;
    Integer hallId;
}
