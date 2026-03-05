package vn.edu.fpt.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import vn.edu.fpt.enums.RecordStatus;

import java.time.LocalDateTime;
import java.util.UUID;

@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@MappedSuperclass
@FieldDefaults(level = AccessLevel.PRIVATE)
public abstract class BaseEntity {

    @Column(name = "created_at", nullable = false)
    LocalDateTime createdAt;

    @CreatedBy
    @Column(name = "created_by")
    String createdBy;

    @Column(name = "updated_at", nullable = false)
    LocalDateTime updatedAt;

    @LastModifiedBy
    @Column(name = "updated_by")
    String updatedBy;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    private RecordStatus status;

    @PrePersist
    private void prePersist() {
        if (createdAt == null) {
            setCreatedAt(LocalDateTime.now());
        }
        if (updatedAt == null) {
            setUpdatedAt(createdAt);
        }
        if (status == null) {
            setStatus(RecordStatus.active);
        }
    }

    @PreUpdate
    private void preUpdate() {
        setUpdatedAt(LocalDateTime.now());
    }

}