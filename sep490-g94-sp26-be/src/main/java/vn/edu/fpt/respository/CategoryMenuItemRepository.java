package vn.edu.fpt.respository;

import vn.edu.fpt.entity.CategoryMenuItem;
import vn.edu.fpt.util.enums.RecordStatus;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface CategoryMenuItemRepository extends BaseRepository<CategoryMenuItem, Integer>{
    Optional<CategoryMenuItem> findCategoryMenuItemByIdAndStatus(Integer id, RecordStatus status);
    List<CategoryMenuItem> findAllByIdIn(Set<Integer> ids);
}
