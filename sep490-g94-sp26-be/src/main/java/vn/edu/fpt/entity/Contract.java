package vn.edu.fpt.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import vn.edu.fpt.util.enums.ContractState;
import vn.edu.fpt.util.enums.BookingTime;
import java.time.LocalDateTime;

@Entity
@Table(name = "contracts", schema = "wedding")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Contract extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @Column(name = "contract_no", unique = true, nullable = false)
    String contractNo;

    @Column(name = "customer_id", nullable = false)
    Integer customerId;

    @Column(name = "hall_id", nullable = false)
    Integer hallId;

    @Column(name = "start_time", nullable = false)
    LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    LocalDateTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "booking_time", nullable = false)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    BookingTime bookingTime;

    @Column(name = "expected_tables")
    Integer expectedTables;

    @Column(name = "expected_guests")
    Integer expectedGuests;

    @Column(name = "package_id")
    Integer packageId;

    @Column(name = "set_menu_id")
    Integer setMenuId;


    @Enumerated(EnumType.STRING)
    @Column(name = "contract_state", nullable = false)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    ContractState contractState = ContractState.DRAFT;

    @Column(name = "sales_id")
    Integer salesId;

    @Column(name = "reserved_until")
    LocalDateTime reservedUntil;

    @Column(name = "notes")
    String notes;

    @Column(name = "bride_name")
    String brideName;

    @Column(name = "bride_age")
    Integer brideAge;

    @Column(name = "groom_name")
    String groomName;

    @Column(name = "groom_age")
    Integer groomAge;

    @Column(name = "bride_father_name")
    String brideFatherName;

    @Column(name = "bride_mother_name")
    String brideMotherName;

    @Column(name = "groom_father_name")
    String groomFatherName;

    @Column(name = "groom_mother_name")
    String groomMotherName;

    @Column(name = "assign_coordinator_id")
    Integer assignCoordinatorId;

    @Column(name = "payment_percentage")
    private Integer paymentPercent;
}

