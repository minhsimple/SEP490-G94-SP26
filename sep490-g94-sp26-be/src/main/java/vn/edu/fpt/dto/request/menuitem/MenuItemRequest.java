package vn.edu.fpt.dto.request.menuitem;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuItemRequest {

    @NotBlank(message = "Mã món ăn không được để trống")
    String code;

    @NotBlank(message = "Tên món ăn không được để trống")
    String name;

    @NotNull(message = "Danh mục món ăn không được để trống")
    Integer categoryMenuItemsId;

    @NotNull(message = "Chi nhánh không được để trống")
    Integer locationId;

    @NotNull(message = "Đơn giá không được để trống")
    BigDecimal unitPrice;

    String description;
}
