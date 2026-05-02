package vn.edu.fpt.dto.request.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountantDashBoardRequest {
    LocalDate fromDate;
    LocalDate toDate;
    List<Integer> locationIds;
}
