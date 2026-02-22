package vn.edu.fpt.entity;

//import jakarta.persistence.*;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.Comment;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "services", schema = "wedding")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Service extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @Column(unique = true, nullable = false)
    String code;

    @Column(nullable = false)
    String name;

    String description;

    @Column(nullable = false)
    String unit = "package";

    @Column(name = "base_price", nullable = false, precision = 12, scale = 2)
    BigDecimal basePrice = BigDecimal.ZERO;

    @Column(name = "location_id")
    @Comment("location id")
    Integer locationId;
}

