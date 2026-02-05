package vn.edu.fpt.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;
import vn.edu.fpt.enums.BookingState;

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

    @ManyToOne
    @JoinColumn(name = "customer_id", insertable = false, updatable = false)
    Customer customer;

    @Column(name = "hall_id", nullable = false)
    Integer hallId;

    @ManyToOne
    @JoinColumn(name = "hall_id", insertable = false, updatable = false)
    Hall hall;

    @Column(name = "start_time", nullable = false)
    LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    LocalDateTime endTime;

    @Column(name = "expected_tables")
    Integer expectedTables;

    @Column(name = "expected_guests")
    Integer expectedGuests;

    @Column(name = "package_id")
    Integer packageId;

    @ManyToOne
    @JoinColumn(name = "package_id", insertable = false, updatable = false)
    ServicePackage servicePackage;

    @Column(name = "quote_id")
    Integer quoteId;

    @ManyToOne
    @JoinColumn(name = "quote_id", insertable = false, updatable = false)
    Quotation quotation;

    @Enumerated(EnumType.STRING)
    @Column(name = "booking_state", nullable = false)
    BookingState bookingState = BookingState.DRAFT;

    @Column(name = "sales_id")
    Integer salesId;

    @ManyToOne
    @JoinColumn(name = "sales_id", insertable = false, updatable = false)
    User sales;

    @Column(name = "reserved_until")
    LocalDateTime reservedUntil;

    String notes;
}

