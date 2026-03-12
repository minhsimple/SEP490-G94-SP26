package vn.edu.fpt.respository;

import org.springframework.data.jpa.repository.Query;
import vn.edu.fpt.entity.Location;
import vn.edu.fpt.util.enums.RecordStatus;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface LocationRepository extends BaseRepository<Location, Integer> {
    @Query("SELECT l FROM Location l WHERE l.status = 'ACTIVE'")
    List<Location> getAllActive();

    List<Location> findAllByStatus(RecordStatus status);

    List<Location> findAllByIdIn(Set<Integer> ids);

    Optional<Location> findByIdAndStatus(Integer id, RecordStatus status);

    Boolean existsByCodeAndStatus(String code, RecordStatus status);

    Boolean existsByCode(String code);

    Boolean existsByCodeAndStatusAndIdNot(String code, RecordStatus status, Integer id);

    Boolean existsByIdAndStatus(Integer id, RecordStatus status);

}
