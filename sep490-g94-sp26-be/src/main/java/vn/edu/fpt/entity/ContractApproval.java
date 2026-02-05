package vn.edu.fpt.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;
import vn.edu.fpt.enums.ApprovalState;

import java.time.LocalDateTime;

@Entity
@Table(name = "contract_approvals", schema = "wedding")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ContractApproval extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @Column(name = "contract_id", nullable = false)
    Integer contractId;

    @ManyToOne
    @JoinColumn(name = "contract_id", insertable = false, updatable = false)
    Contract contract;

    @Column(name = "requested_by")
    Integer requestedBy;

    @ManyToOne
    @JoinColumn(name = "requested_by", insertable = false, updatable = false)
    User requester;

    @Column(name = "approver_id")
    Integer approverId;

    @ManyToOne
    @JoinColumn(name = "approver_id", insertable = false, updatable = false)
    User approver;

    @Enumerated(EnumType.STRING)
    @Column(name = "approval_state", nullable = false)
    ApprovalState approvalState = ApprovalState.PENDING;

    String comment;

    @Column(name = "decided_at")
    LocalDateTime decidedAt;
}

