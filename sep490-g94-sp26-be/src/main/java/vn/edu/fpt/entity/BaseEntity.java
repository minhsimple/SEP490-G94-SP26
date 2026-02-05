package vn.edu.fpt.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;
import vn.edu.fpt.enums.RecordStatus;

import java.time.LocalDateTime;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@MappedSuperclass
@FieldDefaults(level = AccessLevel.PRIVATE)
public abstract class BaseEntity {

    @Column(name = "created_at", nullable = false)
    LocalDateTime createdAt;

    @Column(name = "created_by")
    Integer createdBy;

    @Column(name = "updated_at", nullable = false)
    LocalDateTime updatedAt;

    @Column(name = "updated_by")
    Integer updatedBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    RecordStatus status = RecordStatus.ACTIVE;

    @PrePersist
    private void prePersist() {
        if (createdAt == null) {
            setCreatedAt(LocalDateTime.now());
        }
        if (updatedAt == null) {
            setUpdatedAt(createdAt);
        }
        if (status == null) {
            setStatus(RecordStatus.ACTIVE);
        }
    }

    @PreUpdate
    private void preUpdate() {
        setUpdatedAt(LocalDateTime.now());
    }

}