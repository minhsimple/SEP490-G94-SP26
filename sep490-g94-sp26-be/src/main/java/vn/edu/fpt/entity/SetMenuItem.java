//package vn.edu.fpt.entity;
//
//import jakarta.persistence.*;
//import lombok.*;
//import lombok.experimental.FieldDefaults;
//import lombok.experimental.SuperBuilder;
//
//import java.io.Serializable;
//import java.util.UUID;
//
//@Entity
//@Table(name = "set_menu_items", schema = "wedding")
//@Getter
//@Setter
//@SuperBuilder
//@NoArgsConstructor
//@AllArgsConstructor
//@FieldDefaults(level = AccessLevel.PRIVATE)
//@IdClass(SetMenuItem.SetMenuItemId.class)
//public class SetMenuItem extends BaseEntity {
//
//    @Id
//    @Column(name = "set_menu_id")
//    UUID setMenuId;
//
//    @Id
//    @Column(name = "menu_item_id")
//    UUID menuItemId;
//
//
//    @Column(name = "course_order", nullable = false)
//    Integer courseOrder = 1;
//
//    @Data
//    @NoArgsConstructor
//    @AllArgsConstructor
//    public static class SetMenuItemId implements Serializable {
//        UUID setMenuId;
//        UUID menuItemId;
//    }
//}
//
