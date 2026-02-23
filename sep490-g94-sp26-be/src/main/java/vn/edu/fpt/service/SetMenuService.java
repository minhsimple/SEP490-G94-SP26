package vn.edu.fpt.service;

import org.springframework.data.domain.Pageable;
import vn.edu.fpt.dto.SimplePage;
import vn.edu.fpt.dto.request.setmenu.SetMenuFilterRequest;
import vn.edu.fpt.dto.request.setmenu.SetMenuRequest;
import vn.edu.fpt.dto.response.setmenu.SetMenuResponse;

public interface SetMenuService {
    SetMenuResponse createNewSetMenu(SetMenuRequest setMenuRequest);
    SetMenuResponse getSetMenuById(Integer id);
    SimplePage<SetMenuResponse> getAllSetMenu(Pageable pageable, SetMenuFilterRequest filterRequest);
    SetMenuResponse changeStatusSetMenu(Integer id);
    SetMenuResponse removeMenuItemFromSetMenu(Integer setMenuId, Integer menuItemId);
}
