package vn.edu.fpt.respository;

import vn.edu.fpt.entity.SetMenu;
import vn.edu.fpt.util.enums.RecordStatus;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface SetMenuRepository extends BaseRepository<SetMenu, Integer>{
    List<SetMenu> findAllByIdIn(Set<Integer> ids);
    Optional<SetMenu> findSetMenuByIdAndStatus(Integer id, RecordStatus status);
    boolean existsByCodeAndLocationId(String code, Integer locationId);
    boolean existsByCodeAndLocationIdAndIdNot(String code, Integer locationId, Integer id);

    boolean existsByIdAndStatus(Integer id, RecordStatus status);
}
