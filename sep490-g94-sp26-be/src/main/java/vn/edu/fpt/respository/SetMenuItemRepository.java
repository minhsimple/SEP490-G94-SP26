package vn.edu.fpt.respository;

import vn.edu.fpt.entity.SetMenuItem;

import java.util.List;
import java.util.Set;

public interface SetMenuItemRepository extends BaseRepository<SetMenuItem, SetMenuItem.SetMenuItemId>{
    List<SetMenuItem> findAllBySetMenuId(Integer setMenuId);
    List<SetMenuItem> findAllBySetMenuIdIn(Set<Integer> setMenuIds);
}
