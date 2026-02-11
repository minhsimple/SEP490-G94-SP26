package vn.edu.fpt.respository;

import org.springframework.data.jpa.repository.Query;
import vn.edu.fpt.entity.Lead;
import vn.edu.fpt.entity.Location;
import vn.edu.fpt.enums.RecordStatus;

import java.util.List;

public interface LocationRepository extends BaseRepository<Location, Integer> {
    @Query("SELECT l FROM Location l WHERE l.status = 'ACTIVE'")
    List<Location> getAllActive();

    List<Location> findAllByStatus(RecordStatus status);

    Location findByIdAndStatus(Integer id, RecordStatus status);
}
