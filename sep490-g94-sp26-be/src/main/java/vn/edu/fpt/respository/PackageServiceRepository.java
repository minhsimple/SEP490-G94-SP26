package vn.edu.fpt.respository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.edu.fpt.entity.PackageService;
import vn.edu.fpt.enums.RecordStatus;

import java.util.List;
import java.util.Optional;

public interface PackageServiceRepository extends JpaRepository<PackageService,PackageService.PackageServiceId> {

    void deleteByPackageId(Integer servicePackageId);

    List<PackageService> findByPackageIdAndStatus(Integer packageId, RecordStatus recordStatus);

    Optional<PackageService> findByServiceIdAndStatus(Integer serviceId, RecordStatus status);


    @Query("""
       UPDATE PackageService s
       SET s.status = :status
       WHERE s.serviceId = :serviceId
       """)
    void updateStatusByServiceId(@Param("serviceId") Integer serviceId,
                                 @Param("status") RecordStatus status);
}
