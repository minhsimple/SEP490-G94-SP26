package vn.edu.fpt.dto.response.setmenu;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SetMenuItemResponse {
    Integer setMenuId;
    String setMenuName;
    Integer menuItemId;
    String menuItemName;
    String menuItemCode;
    BigDecimal menuItemUnitPrice;
    String menuItemDescription;
    Integer quantity;
}
