//package vn.edu.fpt.entity;
//
//import jakarta.persistence.*;
//import lombok.*;
//import lombok.experimental.FieldDefaults;
//import lombok.experimental.SuperBuilder;
//import vn.edu.fpt.enums.BookingState;
//
//import java.time.LocalDateTime;
//import java.util.UUID;
//
//@Entity
//@Table(name = "bookings", schema = "wedding")
//@Getter
//@Setter
//@SuperBuilder
//@NoArgsConstructor
//@AllArgsConstructor
//@FieldDefaults(level = AccessLevel.PRIVATE)
//public class Booking extends BaseEntity {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.UUID)
//    UUID id;
//
//    @Column(name = "booking_no", unique = true, nullable = false)
//    String bookingNo;
//
//    @Column(name = "customer_id", nullable = false)
//    UUID customerId;
//
//    @Column(name = "hall_id", nullable = false)
//    UUID hallId;
//
//    @Column(name = "start_time", nullable = false)
//    LocalDateTime startTime;
//
//    @Column(name = "end_time", nullable = false)
//    LocalDateTime endTime;
//
//    @Column(name = "expected_tables")
//    Integer expectedTables;
//
//    @Column(name = "expected_guests")
//    Integer expectedGuests;
//
//    @Column(name = "package_id")
//    UUID packageId;
//
//    @Column(name = "quote_id")
//    UUID quoteId;
//
//    @Enumerated(EnumType.STRING)
//    @Column(name = "booking_state", nullable = false)
//    BookingState bookingState = BookingState.DRAFT;
//
//    @Column(name = "sales_id")
//    UUID salesId;
//
//    @Column(name = "reserved_until")
//    LocalDateTime reservedUntil;
//
//    String notes;
//}
//
