package vn.edu.fpt.respository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.edu.fpt.entity.SetMenuItem;
import vn.edu.fpt.enums.RecordStatus;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface SetMenuItemRepository extends BaseRepository<SetMenuItem, SetMenuItem.SetMenuItemId>{
    List<SetMenuItem> findAllBySetMenuIdAndStatus(Integer setMenuId, RecordStatus status);
    List<SetMenuItem> findAllBySetMenuIdInAndStatus(Set<Integer> setMenuIds, RecordStatus status);

    @Query("SELECT s FROM SetMenuItem s WHERE s.id = :id AND s.status = :status")
    Optional<SetMenuItem> findByIdAndStatus(@Param("id") SetMenuItem.SetMenuItemId id, @Param("status") RecordStatus status);
}
