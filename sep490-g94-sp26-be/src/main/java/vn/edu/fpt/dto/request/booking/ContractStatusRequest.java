package vn.edu.fpt.dto.request.booking;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.edu.fpt.util.enums.ContractState;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContractStatusRequest {

    @NotNull(message = "Mã hợp đồng không được để trống")
    Integer contractId;

    @NotNull(message = "Trạng thái hợp đồng không được để trống")
    ContractState contractState;
}
