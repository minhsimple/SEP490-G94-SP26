package vn.edu.fpt.respository;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
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

public interface LeadRepository extends BaseRepository<Lead,Integer>{

    Optional<Lead> findByIdAndStatus(Integer id, RecordStatus status);

    Page<Lead> findAllByStatus(RecordStatus status, Pageable pageable);

    @Query("""
    SELECT l FROM Lead l
    WHERE (:full_name IS NULL OR LOWER(l.fullName) LIKE LOWER(CONCAT('%', :full_name, '%')))
      AND (:phone IS NULL OR LOWER(l.phone) LIKE LOWER(CONCAT('%', :phone, '%')))
      AND (:email IS NULL OR LOWER(l.email) LIKE LOWER(CONCAT('%', :email, '%')))
      AND (:source IS NULL OR LOWER(l.source) LIKE LOWER(CONCAT('%', :source, '%')))
      AND (:notes IS NULL OR LOWER(l.notes) LIKE LOWER(CONCAT('%', :notes, '%')))
      AND (:assigned_sale_id IS NULL OR l.assignedSalesId = :assigned_sale_id)
      AND (:location_id IS NULL OR l.locationId = :location_id)
      AND (:lead_state IS NULL OR l.leadState = :lead_state)
      AND (:status IS NULL OR l.status = :status)
""")
    Page<Lead> filterLeadsByStatus(
            @Param("full_name") String fullName,
            @Param("phone") String phone,
            @Param("email") String email,
            @Param("source") String source,
            @Param("notes") String notes,
            @Param("assigned_sale_id") Integer assignedSalesId,
            @Param("location_id") Integer locationId,
            @Param("lead_state") LeadState leadState,
            @Param("status") RecordStatus status,
            Pageable pageable
    );


//    @NotBlank(message = "Họ tên không được để trống")
//    String fullName;
//
//    String phone;
//
//    @NotBlank(message = "Email không được để trống")
//    @Email(message = "Email không đúng định dạng")
//    String email;
//
//    String source;
//
//    String notes;
//
//    Integer assignedSalesId;
//
////    String createdFrom;
//
//    Integer locationId;
}

