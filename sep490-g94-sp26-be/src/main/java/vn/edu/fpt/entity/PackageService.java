package vn.edu.fpt.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "package_services", schema = "wedding")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@IdClass(PackageService.PackageServiceId.class)
public class PackageService extends BaseEntity {

    @Id
    @Column(name = "package_id")
    Integer packageId;

    @Id
    @Column(name = "service_id")
    Integer serviceId;

    @Column(nullable = false, precision = 12, scale = 2)
    BigDecimal qty = BigDecimal.ONE;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PackageServiceId implements Serializable {
        Integer packageId;
        Integer serviceId;
    }
}

