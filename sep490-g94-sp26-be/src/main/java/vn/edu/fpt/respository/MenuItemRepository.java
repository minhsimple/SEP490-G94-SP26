package vn.edu.fpt.respository;

import vn.edu.fpt.entity.MenuItem;
import vn.edu.fpt.enums.RecordStatus;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface MenuItemRepository extends BaseRepository<MenuItem, Integer>{
    Optional<MenuItem> findMenuItemByIdAndStatus(Integer id, RecordStatus recordStatus);

    List<MenuItem> findAllByIdInAndStatus(Set<Integer> ids, RecordStatus recordStatus);
}
