package vn.edu.fpt.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.Comment;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import vn.edu.fpt.enums.LeadState;

import java.util.UUID;

@Entity
@Table(name = "leads", schema = "wedding")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Lead extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @Column(name = "full_name", nullable = false)
    String fullName;

    String phone;

    String email;

    String source;

    String notes;


    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(
            name = "lead_state",
            //columnDefinition = "lead_state",
            nullable = false
    )
    LeadState leadState ;

    @Column(name = "assigned_sales_id")
    Integer assignedSalesId;

//    @Column(name = "created_from")
//    String createdFrom;

    @Column(name = "location_id")
    @Comment("location id")
    Integer locationId;
}

