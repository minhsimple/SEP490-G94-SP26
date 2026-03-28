package vn.edu.fpt.respository;

import vn.edu.fpt.entity.ServicePackage;
import vn.edu.fpt.util.enums.RecordStatus;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface ServicePackageRepository extends BaseRepository<ServicePackage, Integer> {
    List<ServicePackage> findAllByIdIn(Set<Integer> ids);

    boolean existsByCodeAndStatus( String code, RecordStatus recordStatus);

    boolean existsByCode( String code);

    Optional<ServicePackage> findByIdAndStatus(Integer id, RecordStatus status);

    boolean existsByCodeAndStatusAndIdNot( String code, RecordStatus recordStatus, Integer id);
}
