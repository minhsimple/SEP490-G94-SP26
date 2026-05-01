package vn.edu.fpt.respository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.edu.fpt.entity.Invoice;
import vn.edu.fpt.util.enums.RecordStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface InvoiceRepository extends BaseRepository<Invoice, Integer>{
    Optional<Invoice> findByIdAndStatus(Integer id, RecordStatus status);
    Optional<Invoice> findByContractIdAndStatus(Integer id, RecordStatus status);


//    List<Invoice> findAllByLocationIdInAndCreatedAtBetween(List<Integer> locationIds, LocalDateTime localDateTime, LocalDateTime localDateTime1);

    @Query("""
        SELECT i
        FROM Invoice i
        WHERE i.contractId IN :contractIds
          AND i.createdAt BETWEEN :fromDateTime AND :toDateTime
    """)
    List<Invoice> findAllByContractIdAndCreatedAtBetween(
            @Param("contractIds") Set<Integer> contractIds,
            @Param("fromDateTime") LocalDateTime fromDateTime,
            @Param("toDateTime") LocalDateTime toDateTime
    );
    @Query("""
        SELECT i
        FROM Invoice i
        WHERE i.contractId IN :contractIds
    """)
    List<Invoice> findAllByContractId(
            @Param("contractIds") Set<Integer> contractIds);
}
