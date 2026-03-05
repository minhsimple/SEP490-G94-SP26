package vn.edu.fpt.dto.request.setmenu;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SetMenuItemUpdateRequest {
    @NotNull(message = "ID set menu không được để trống")
    private Integer setMenuId;

    @NotNull(message = "ID món ăn không được để trống")
    private Integer menuItemId;

    @NotNull(message = "Số lượng món ăn không được để trống")
    private Integer quantity;
}
