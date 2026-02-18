package vn.edu.fpt.respository;

import vn.edu.fpt.entity.MenuItem;
import vn.edu.fpt.enums.RecordStatus;

import java.util.Optional;

public interface MenuItemRepository extends BaseRepository<MenuItem, Integer>{
    Optional<MenuItem> findMenuItemByIdAndStatus(Integer id, RecordStatus recordStatus);
}
