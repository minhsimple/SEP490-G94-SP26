package vn.edu.fpt.respository;

import vn.edu.fpt.entity.Hall;
import vn.edu.fpt.enums.RecordStatus;

import java.util.List;
import java.util.Optional;

public interface HallRepository extends BaseRepository<Hall, Integer> {
    List<Hall> findAllByStatus(RecordStatus status);

    Optional<Hall> findByIdAndStatus(Integer id, RecordStatus status);

    Boolean existsByCodeAndStatus(String code, RecordStatus status);

    Boolean existsByCodeAndStatusAndIdNot(String code, RecordStatus status, Integer id);
}

