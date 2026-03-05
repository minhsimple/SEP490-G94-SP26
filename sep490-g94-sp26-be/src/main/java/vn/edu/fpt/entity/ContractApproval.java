//package vn.edu.fpt.entity;
//
//import jakarta.persistence.*;
//import lombok.*;
//import lombok.experimental.FieldDefaults;
//import lombok.experimental.SuperBuilder;
//import vn.edu.fpt.enums.ApprovalState;
//
//import java.time.LocalDateTime;
//import java.util.UUID;
//
//@Entity
//@Table(name = "contract_approvals", schema = "wedding")
//@Getter
//@Setter
//@SuperBuilder
//@NoArgsConstructor
//@AllArgsConstructor
//@FieldDefaults(level = AccessLevel.PRIVATE)
//public class ContractApproval extends BaseEntity {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.UUID)
//    UUID id;
//
//    @Column(name = "contract_id", nullable = false)
//    UUID contractId;
//
//    @Column(name = "requested_by")
//    UUID requestedBy;
//
//    @Column(name = "approver_id")
//    UUID approverId;
//
//
//    @Enumerated(EnumType.STRING)
//    @Column(name = "approval_state", nullable = false)
//    ApprovalState approvalState = ApprovalState.PENDING;
//
//    String comment;
//
//    @Column(name = "decided_at")
//    LocalDateTime decidedAt;
//}
//
