//package vn.edu.fpt.entity;
//
//import jakarta.persistence.*;
//import lombok.*;
//import lombok.experimental.FieldDefaults;
//import lombok.experimental.SuperBuilder;
//
//import java.time.LocalDateTime;
//import java.util.UUID;
//
//@Entity
//@Table(name = "beo_timeline_items", schema = "wedding")
//@Getter
//@Setter
//@SuperBuilder
//@NoArgsConstructor
//@AllArgsConstructor
//@FieldDefaults(level = AccessLevel.PRIVATE)
//public class BeoTimelineItem extends BaseEntity {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.UUID)
//    UUID id;
//
//    @Column(name = "beo_id", nullable = false)
//    UUID beoId;
//
//
//    @Column(name = "at_time", nullable = false)
//    LocalDateTime atTime;
//
//    @Column(nullable = false)
//    String title;
//
//    String description;
//
//    @Column(name = "owner_team")
//    String ownerTeam;
//
//    @Column(name = "sort_order", nullable = false)
//    Integer sortOrder = 1;
//}
//
