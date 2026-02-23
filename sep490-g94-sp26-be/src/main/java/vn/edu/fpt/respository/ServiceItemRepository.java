package vn.edu.fpt.respository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.edu.fpt.entity.Services;
import vn.edu.fpt.enums.RecordStatus;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface ServiceItemRepository extends BaseRepository<Services,Integer> {
    boolean existsByCodeAndStatus(String code, RecordStatus status);

    Optional<Services> findByIdAndStatus(Integer id, RecordStatus status);

    Optional<Services> findByCodeAndStatus(String code, RecordStatus status);

    @Query("SELECT COALESCE(SUM(s.basePrice), 0) FROM Services s WHERE s.id IN :serviceIds AND s.status = :status")
    BigDecimal sumPriceByServiceIds(@Param("serviceIds") List<Integer> serviceIds, @Param("status") RecordStatus status);

    boolean existsByIdAndStatus(Integer serviceId, RecordStatus recordStatus);

    List<Services> findAllByIdInAndStatus(List<Integer> serviceIds, RecordStatus recordStatus);
}
