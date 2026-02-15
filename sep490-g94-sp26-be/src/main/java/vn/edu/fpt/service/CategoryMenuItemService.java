package vn.edu.fpt.service;

import org.springframework.data.domain.Pageable;
import vn.edu.fpt.dto.SimplePage;
import vn.edu.fpt.dto.request.categorymenuitem.CategoryMenuItemFilterRequest;
import vn.edu.fpt.dto.request.categorymenuitem.CategoryMenuItemRequest;
import vn.edu.fpt.dto.response.categorymenuitem.CategoryMenuItemResponse;

public interface CategoryMenuItemService {
    CategoryMenuItemResponse createCategoryMenuItem(CategoryMenuItemRequest categoryMenuItemRequest);
    CategoryMenuItemResponse updateCategoryMenuItem(Integer id, CategoryMenuItemRequest categoryMenuItemRequest);
    CategoryMenuItemResponse getCategoryMenuItemById(Integer id);
    CategoryMenuItemResponse changeStatusCategoryMenuItem(Integer id);
    SimplePage<CategoryMenuItemResponse> getAllCategoryMenuItems(Pageable pageable, CategoryMenuItemFilterRequest filterRequest);
}
