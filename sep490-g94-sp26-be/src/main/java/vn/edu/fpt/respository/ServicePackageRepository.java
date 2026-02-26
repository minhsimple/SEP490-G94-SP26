package vn.edu.fpt.respository;

import jakarta.validation.constraints.NotNull;
import vn.edu.fpt.entity.ServicePackage;
import vn.edu.fpt.entity.Services;
import vn.edu.fpt.enums.RecordStatus;

import java.util.Optional;

public interface ServicePackageRepository extends BaseRepository<ServicePackage, Integer> {
    boolean existsByCodeAndStatus( String code, RecordStatus recordStatus);

    Optional<ServicePackage> findByIdAndStatus(Integer id, RecordStatus status);

    boolean existsByCodeAndStatusAndIdNot( String code, RecordStatus recordStatus, Integer id);
}
