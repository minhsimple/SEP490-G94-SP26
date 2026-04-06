package vn.edu.fpt.dto.request.tablelayout;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.edu.fpt.util.enums.TableLayoutEnum;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TableLayoutRequest {
    @NotNull(message = "ID hợp đồng không được để trống")
    Integer contractId;

    @Valid
    @NotEmpty(message = "Danh sách bố trí bàn không được để trống")
    List<TableLayoutDetailRequest> tableLayoutDetailRequestList;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TableLayoutDetailRequest {
        @NotNull(message = "Khu vực bàn không được để trống")
        TableLayoutEnum tableLayoutEnum;

        @NotBlank(message = "Tên nhóm không được để trống")
        String groupName;

        @NotNull(message = "Số lượng bàn không được để trống")
        Integer numberOfTables;
    }
}
