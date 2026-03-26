package vn.edu.fpt.respository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.edu.fpt.entity.Payment;
import vn.edu.fpt.util.enums.PaymentState;
import vn.edu.fpt.util.enums.RecordStatus;

import java.util.Optional;
import java.util.UUID;

public interface PaymentRepository extends BaseRepository<Payment, Integer> {

    Optional<Payment> findByIdAndStatus(Integer id, RecordStatus status);

    Page<Payment> findAllByStatus(RecordStatus status, Pageable pageable);

    Page<Payment> findByContractIdAndStatus(Integer contractId, RecordStatus status, Pageable pageable);

    @Query("""
            SELECT p FROM Payment p
            WHERE (p.contractId = :contractId OR :contractId IS NULL)
              AND (p.paymentState = :paymentState OR :paymentState IS NULL)
              AND (p.status = :status OR :status IS NULL)
            ORDER BY p.createdAt DESC
            """)
    Page<Payment> filterPayments(
            @Param("contractId") Integer contractId,
            @Param("paymentState") PaymentState paymentState,
            @Param("status") RecordStatus status,
            Pageable pageable
    );
}

