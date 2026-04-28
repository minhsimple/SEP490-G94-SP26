package vn.edu.fpt.respository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.edu.fpt.entity.Invoice;
import vn.edu.fpt.util.enums.RecordStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface InvoiceRepository extends BaseRepository<Invoice, Integer>{
    Optional<Invoice> findByIdAndStatus(Integer id, RecordStatus status);
    Optional<Invoice> findByContractIdAndStatus(Integer id, RecordStatus status);


//    List<Invoice> findAllByLocationIdInAndCreatedAtBetween(List<Integer> locationIds, LocalDateTime localDateTime, LocalDateTime localDateTime1);

    @Query("""
        SELECT i
        FROM Invoice i
        JOIN Hall h
        WHERE h.locationId IN :locationIds
          AND i.createdAt BETWEEN :fromDateTime AND :toDateTime
    """)
    List<Invoice> findAllByLocationIdsAndCreatedAtBetween(
            @Param("locationIds") List<Integer> locationIds,
            @Param("fromDateTime") LocalDateTime fromDateTime,
            @Param("toDateTime") LocalDateTime toDateTime
    );
}
