package vn.edu.fpt.service;

import org.springframework.data.domain.Pageable;
import vn.edu.fpt.dto.SimplePage;
import vn.edu.fpt.dto.request.menuitem.MenuItemFilterRequest;
import vn.edu.fpt.dto.request.menuitem.MenuItemRequest;
import vn.edu.fpt.dto.response.menuitem.MenuItemResponse;

public interface MenuItemService {
    MenuItemResponse createNewMenuItem(MenuItemRequest request);
    MenuItemResponse updateMenuItem(Integer id, MenuItemRequest request);
    MenuItemResponse getMenuItemById(Integer id);
    SimplePage<MenuItemResponse> getAllMenuItems(Pageable pageable, MenuItemFilterRequest filterRequest);
    MenuItemResponse changeStatusMenuItem(Integer id);
}
