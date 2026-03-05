package vn.edu.fpt.respository;

import vn.edu.fpt.entity.CategoryMenuItem;
import vn.edu.fpt.enums.RecordStatus;

import java.util.Optional;

public interface CategoryMenuItemRepository extends BaseRepository<CategoryMenuItem, Integer>{
    Optional<CategoryMenuItem> findCategoryMenuItemByIdAndStatus(Integer id, RecordStatus status);
}
