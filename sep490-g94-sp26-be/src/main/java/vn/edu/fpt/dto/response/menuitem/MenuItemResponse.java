package vn.edu.fpt.dto.response.menuitem;

import lombok.*;
import lombok.experimental.FieldDefaults;
import vn.edu.fpt.util.enums.RecordStatus;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MenuItemResponse {
    Integer id;
    String code;
    String name;
    CategoryMenuItem categoryMenuItem;
    Location location;
    String description;
    String unitPrice;
    String unit;
    RecordStatus status;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class CategoryMenuItem {
        Integer id;
        String name;
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
