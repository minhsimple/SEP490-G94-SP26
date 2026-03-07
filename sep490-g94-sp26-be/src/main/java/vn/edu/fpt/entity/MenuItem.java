package vn.edu.fpt.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "menu_items", schema = "wedding")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MenuItem extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @Column(unique = true, nullable = false)
    String code;

    @Column(nullable = false)
    String name;

    @Column(name = "category_menu_items_id", nullable = false)
    Integer categoryMenuItemsId;

    @Column(name = "location_id", nullable = false)
    Integer locationId;

    @Column(name = "unit_price", nullable = false, precision = 12, scale = 2)
    BigDecimal unitPrice = BigDecimal.ZERO;

    @Column(name = "unit")
    String unit;

    String description;

    @Column(name = "image_orig_key")
    String imageOrigKey;

    @Column(name = "image_thumb_key")
    String imageThumbKey;

    @Column(name = "image_medium_key")
    String imageMediumKey;

    @Column(name = "image_large_key")
    String imageLargeKey;
}

