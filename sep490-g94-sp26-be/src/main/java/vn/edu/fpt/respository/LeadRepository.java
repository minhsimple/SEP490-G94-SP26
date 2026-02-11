package vn.edu.fpt.respository;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.edu.fpt.entity.Lead;
import vn.edu.fpt.entity.User;
import vn.edu.fpt.enums.LeadState;
import vn.edu.fpt.enums.RecordStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;
import java.util.UUID;

public interface LeadRepository extends BaseRepository<Lead, Integer>, JpaSpecificationExecutor<Lead> {

    Optional<Lead> findByIdAndStatus(Integer id, RecordStatus status);

    Page<Lead> findAllByStatus(RecordStatus status, Pageable pageable);

    @Query("""
            SELECT l FROM Lead l
            WHERE (COALESCE(:fullName, '') = '' OR l.fullName ILIKE CONCAT('%', :fullName, '%'))
              AND (COALESCE(:phone, '') = '' OR l.phone ILIKE CONCAT('%', :phone, '%'))
              AND (COALESCE(:email, '') = '' OR l.email ILIKE CONCAT('%', :email, '%'))
              AND (COALESCE(:source, '') = '' OR l.source ILIKE CONCAT('%', :source, '%'))
              AND (COALESCE(:notes, '') = '' OR l.notes ILIKE CONCAT('%', :notes, '%'))
              AND (:assignedSalesId IS NULL OR l.assignedSalesId = :assignedSalesId)
              AND (:locationId IS NULL OR l.locationId = :locationId)
              AND (:leadState IS NULL OR l.leadState = :leadState)
              AND (:status IS NULL OR l.status = :status)
            ORDER BY l.updatedAt DESC
            """)
    Page<Lead> filterLeadByStatus(
            @Param("fullName") String fullName,
            @Param("phone") String phone,
            @Param("email") String email,
            @Param("source") String source,
            @Param("notes") String notes,
            @Param("assignedSalesId") Integer assignedSalesId,
            @Param("locationId") Integer locationId,
            @Param("leadState") LeadState leadState,
            @Param("status") RecordStatus status,
            Pageable pageable
    );


}

