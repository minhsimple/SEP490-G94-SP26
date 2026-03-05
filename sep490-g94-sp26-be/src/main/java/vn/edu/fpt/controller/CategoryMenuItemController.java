package vn.edu.fpt.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;
import vn.edu.fpt.dto.SimplePage;
import vn.edu.fpt.dto.request.categorymenuitem.CategoryMenuItemFilterRequest;
import vn.edu.fpt.dto.request.categorymenuitem.CategoryMenuItemRequest;
import vn.edu.fpt.dto.response.ApiResponse;
import vn.edu.fpt.dto.response.categorymenuitem.CategoryMenuItemResponse;
import vn.edu.fpt.enums.Constants;
import vn.edu.fpt.service.CategoryMenuItemService;

@RestController
@RequestMapping("/api/v1/category-menu-item")
@Tag(name = "Category Menu Item")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CategoryMenuItemController {

    CategoryMenuItemService categoryMenuItemService;

    @Operation(summary = "Tạo danh mục sản phẩm mới")
    @PostMapping("/create")
    public ApiResponse<CategoryMenuItemResponse> createNewCategoryMenuItem(
            @Valid @RequestBody CategoryMenuItemRequest categoryMenuItemRequest) {
        CategoryMenuItemResponse categoryMenuItemResponse = categoryMenuItemService
                .createCategoryMenuItem(categoryMenuItemRequest);
        return ApiResponse.<CategoryMenuItemResponse>builder()
                .data(categoryMenuItemResponse)
                .build();
    }

    @Operation(summary = "cập nhật danh mục món ăn")
    @PutMapping("/update")
    public ApiResponse<CategoryMenuItemResponse> updateCategoryMenuItem(
            @RequestParam Integer id,
            @Valid @RequestBody CategoryMenuItemRequest categoryMenuItemRequest
    ) {
        CategoryMenuItemResponse categoryMenuItemResponse = categoryMenuItemService
                .updateCategoryMenuItem(id, categoryMenuItemRequest);
        return ApiResponse.<CategoryMenuItemResponse>builder()
                .data(categoryMenuItemResponse)
                .build();
    }

    @Operation(summary = "Xem chi tiết danh mục món ăn")
    @GetMapping("/{id}")
    public ApiResponse<CategoryMenuItemResponse> viewDetailCategoryMenuItem(@PathVariable Integer id) {
        CategoryMenuItemResponse categoryMenuItemResponse = categoryMenuItemService
                .getCategoryMenuItemById(id);
        return ApiResponse.<CategoryMenuItemResponse>builder()
                .data(categoryMenuItemResponse)
                .build();
    }

    @Operation(summary = "Xem danh sách danh mục món ăn")
    @GetMapping("/search")
    public ApiResponse<SimplePage<CategoryMenuItemResponse>> getAllCategoryMenuItems(
            @Valid CategoryMenuItemFilterRequest filterRequest,
            @ParameterObject @PageableDefault(size = Constants.PAGE.DEFAULT_PAGE_SIZE,
            sort = Constants.SORT.SORT_BY,
            direction = Sort.Direction.DESC)
            Pageable pageable) {
        return ApiResponse.<SimplePage<CategoryMenuItemResponse>>builder()
                .data(categoryMenuItemService.getAllCategoryMenuItems(pageable, filterRequest))
                .build();
    }

    @Operation(summary = "Thay đổi trạng thái của danh mục món ăn")
    @PutMapping("/{id}/change-status")
    public ApiResponse<CategoryMenuItemResponse> changeStatusCategoryMenuItem(@PathVariable Integer id) {
        CategoryMenuItemResponse categoryMenuItemResponse = categoryMenuItemService
                .changeStatusCategoryMenuItem(id);
        return ApiResponse.<CategoryMenuItemResponse>builder()
                .data(categoryMenuItemResponse)
                .build();
    }
}
