package vn.edu.fpt.dto.request.categorymenuitem;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryMenuItemRequest {
    @NotBlank(message = "Tên không đc để trống")
    private String name;

    private String description;
}
