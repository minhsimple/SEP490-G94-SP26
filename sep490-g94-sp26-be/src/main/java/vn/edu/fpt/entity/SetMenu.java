package vn.edu.fpt.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Entity
@Table(name = "set_menus", schema = "wedding")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SetMenu extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @Column(unique = true, nullable = false)
    String code;

    @Column(nullable = false)
    String name;

    String description;

    @Column(name = "location_id", nullable = false)
    Integer locationId;

    @Column(name = "image_orig_key")
    String imageOrigKey;

    @Column(name = "image_thumb_key")
    String imageThumbKey;

    @Column(name = "image_medium_key")
    String imageMediumKey;

    @Column(name = "image_large_key")
    String imageLargeKey;
}

