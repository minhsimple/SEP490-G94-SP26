package vn.edu.fpt.respository;

import vn.edu.fpt.entity.SetMenu;
import vn.edu.fpt.util.enums.RecordStatus;

import java.util.Optional;

public interface SetMenuRepository extends BaseRepository<SetMenu, Integer>{
    Optional<SetMenu> findSetMenuByIdAndStatus(Integer id, RecordStatus status);
    boolean existsByCodeAndLocationId(String code, Integer locationId);
    boolean existsByCodeAndLocationIdAndIdNot(String code, Integer locationId, Integer id);
}
