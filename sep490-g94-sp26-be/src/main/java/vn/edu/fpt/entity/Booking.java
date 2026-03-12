package vn.edu.fpt.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;
import vn.edu.fpt.util.enums.BookingState;
import vn.edu.fpt.util.enums.BookingTime;

import java.time.LocalDateTime;

@Entity
@Table(name = "bookings", schema = "wedding")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Booking extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @Column(name = "booking_no", unique = true, nullable = false)
    String bookingNo;

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
    @Column(name = "booking_state", nullable = false)
    BookingState bookingState = BookingState.DRAFT;

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
}

