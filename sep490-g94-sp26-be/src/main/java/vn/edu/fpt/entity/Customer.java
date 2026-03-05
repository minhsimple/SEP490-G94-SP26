package vn.edu.fpt.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "customers", schema = "wedding")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Customer extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @Column(name = "full_name", nullable = false)
    String fullName;

    @Column(name = "citizen_id_number", nullable = false, length = 50)
    String citizenIdNumber;

    @Column(name = "phone", nullable = false)
    String phone;

    String email;

    @Column(name = "tax_code")
    String taxCode;

    String address;

    String notes;

    @Column(name = "location_id")
    Integer locationId;
}

