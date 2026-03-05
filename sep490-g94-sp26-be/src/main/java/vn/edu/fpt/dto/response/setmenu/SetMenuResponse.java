package vn.edu.fpt.dto.response.setmenu;

import lombok.*;
import lombok.experimental.FieldDefaults;
import vn.edu.fpt.util.enums.RecordStatus;

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
    RecordStatus status;
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
        String unit;
        String description;
        Integer quantity;
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
