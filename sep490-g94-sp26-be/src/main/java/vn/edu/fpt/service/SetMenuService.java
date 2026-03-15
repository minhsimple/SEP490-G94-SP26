package vn.edu.fpt.service;

import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;
import vn.edu.fpt.dto.SimplePage;
import vn.edu.fpt.dto.request.setmenu.SetMenuFilterRequest;
import vn.edu.fpt.dto.request.setmenu.SetMenuRequest;
import vn.edu.fpt.dto.response.setmenu.SetMenuResponse;

public interface SetMenuService {
    SetMenuResponse createNewSetMenu(SetMenuRequest setMenuRequest, MultipartFile imageFile) throws Exception;
    SetMenuResponse getSetMenuById(Integer id) throws Exception;
    SimplePage<SetMenuResponse> getAllSetMenu(Pageable pageable, SetMenuFilterRequest filterRequest);
    SetMenuResponse changeStatusSetMenu(Integer id) throws Exception;
    SetMenuResponse updateSetMenu(Integer setMenuId, SetMenuRequest setMenuRequest, MultipartFile imageFile) throws Exception;
}
