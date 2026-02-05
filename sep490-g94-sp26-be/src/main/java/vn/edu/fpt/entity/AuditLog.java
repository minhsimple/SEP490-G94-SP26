package vn.edu.fpt.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.Map;

@Entity
@Table(name = "audit_logs", schema = "wedding")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AuditLog extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "actor_user_id")
    Integer actorUserId;

    @ManyToOne
    @JoinColumn(name = "actor_user_id", insertable = false, updatable = false)
    User actorUser;

    @Column(nullable = false)
    String action;

    @Column(name = "entity_type", nullable = false)
    String entityType;

    @Column(name = "entity_id")
    Integer entityId;

    @JdbcTypeCode(SqlTypes.JSON)
    Map<String, Object> changes;
}

