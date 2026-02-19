package vn.edu.fpt.dto.response.setmenu;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SetMenuResponse {
    Integer id;
    String code;
    String name;
    String description;
    Location location;
    BigDecimal setPrice;
    Map<String, List<MenuItem>> menuItemsByCategory;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class MenuItem {
        Integer id;
        String code;
        String name;
        BigDecimal unitPrice;
        String description;
        Integer quantity;
        Integer courseOrder;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class Location {
        Integer id;
        String name;
    }
}
