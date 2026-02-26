package vn.edu.fpt.respository;

import vn.edu.fpt.entity.SetMenu;
import vn.edu.fpt.enums.RecordStatus;

import java.util.Optional;

public interface SetMenuRepository extends BaseRepository<SetMenu, Integer>{
    Optional<SetMenu> findSetMenuByIdAndStatus(Integer id, RecordStatus status);
}
