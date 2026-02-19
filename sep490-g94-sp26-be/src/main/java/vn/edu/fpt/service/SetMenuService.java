package vn.edu.fpt.service;

import vn.edu.fpt.dto.request.setmenu.SetMenuRequest;
import vn.edu.fpt.dto.response.setmenu.SetMenuResponse;

public interface SetMenuService {
    SetMenuResponse createNewSetMenu(SetMenuRequest setMenuRequest);
}
