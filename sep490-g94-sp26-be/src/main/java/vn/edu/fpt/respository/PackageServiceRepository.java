package vn.edu.fpt.respository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.edu.fpt.entity.PackageService;
import vn.edu.fpt.enums.RecordStatus;

import java.util.List;

public interface PackageServiceRepository extends JpaRepository<PackageService,PackageService.PackageServiceId> {

    void deleteByPackageId(Integer servicePackageId);

    List<PackageService> findByPackageIdAndStatus(Integer packageId, RecordStatus recordStatus);
}
