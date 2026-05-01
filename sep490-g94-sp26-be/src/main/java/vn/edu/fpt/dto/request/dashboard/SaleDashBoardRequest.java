package vn.edu.fpt.dto.request.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SaleDashBoardRequest {

    LocalDate fromDate;
    LocalDate toDate;
}
