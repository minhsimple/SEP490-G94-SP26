package vn.edu.fpt.dto.request.setmenu;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SetMenuRequest {
    @NotBlank(message = "Mã set menu không được để trống")
    private String code;

    @NotBlank(message = "Tên set menu không được để trống")
    private String name;

    private String description;

    @NotNull(message = "Chi nhánh không được để trống")
    private Integer locationId;

    private List<MenuItem> menuItems;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MenuItem {
        @NotNull(message = "ID món ăn không được để trống")
        private Integer id;

        @NotNull(message = "Số lượng món ăn không được để trống")
        private Integer quantity;

        @NotNull(message = "Thứ tự món ăn không được để trống")
        private Integer courseOrder;
    }
}
