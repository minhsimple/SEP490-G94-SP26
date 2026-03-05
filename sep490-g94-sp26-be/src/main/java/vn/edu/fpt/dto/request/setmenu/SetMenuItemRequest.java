package vn.edu.fpt.dto.request.setmenu;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SetMenuItemRequest {

    @NotNull(message = "ID set menu không được để trống")
    private Integer setMenuId;

    @Valid
    private MenuItem menuItem;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MenuItem {
        @NotNull(message = "ID món ăn không được để trống")
        private Integer id;

        @NotNull(message = "Số lượng món ăn không được để trống")
        private Integer quantity;
    }
}
