package vn.edu.fpt.dto.response.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SaleDashBoardResponse {
    Integer customersInChargeCount;

    Integer totalContracts;
    Integer activeContracts;
    Integer filteredContractsCount;
    Integer participatedContractsCount;

    BigDecimal totalContractValue;
    BigDecimal filteredRevenue;
    BigDecimal averageContractValue;
    BigDecimal totalCollectedAmount;
    BigDecimal remainingAmountToCollect;

    Integer canceledCount;
    Integer liquidatedCount;
    Integer activeCount;

}
