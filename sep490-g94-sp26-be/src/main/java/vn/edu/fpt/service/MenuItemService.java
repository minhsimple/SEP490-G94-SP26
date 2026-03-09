package vn.edu.fpt.service;

import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;
import vn.edu.fpt.dto.SimplePage;
import vn.edu.fpt.dto.request.menuitem.MenuItemFilterRequest;
import vn.edu.fpt.dto.request.menuitem.MenuItemRequest;
import vn.edu.fpt.dto.response.menuitem.MenuItemResponse;

public interface MenuItemService {
    MenuItemResponse createNewMenuItem(MenuItemRequest request, MultipartFile imageFile) throws Exception;
    MenuItemResponse updateMenuItem(Integer id, MenuItemRequest request, MultipartFile imageFile) throws Exception;
    MenuItemResponse getMenuItemById(Integer id) throws Exception;
    SimplePage<MenuItemResponse> getAllMenuItems(Pageable pageable, MenuItemFilterRequest filterRequest);
    MenuItemResponse changeStatusMenuItem(Integer id) throws Exception;
}
