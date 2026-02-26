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
import vn.edu.fpt.dto.request.menuitem.MenuItemFilterRequest;
import vn.edu.fpt.dto.request.menuitem.MenuItemRequest;
import vn.edu.fpt.dto.response.ApiResponse;
import vn.edu.fpt.dto.response.menuitem.MenuItemResponse;
import vn.edu.fpt.enums.Constants;
import vn.edu.fpt.service.MenuItemService;

@RestController
@RequestMapping("/api/v1/menu-item")
@Tag(name = "Menu Item")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MenuItemController {
    private final MenuItemService menuItemService;

    @Operation(summary = "Tạo món ăn mới")
    @PostMapping("/create")
    public ApiResponse<MenuItemResponse> createNewMenuItem(
            @Valid @RequestBody MenuItemRequest menuItemRequest) {
        MenuItemResponse menuItemResponse = menuItemService.createNewMenuItem(menuItemRequest);
        return ApiResponse.<MenuItemResponse>builder()
                .data(menuItemResponse)
                .build();
    }

    @Operation(summary = "Cập nhật món ăn")
    @PutMapping("/update")
    public ApiResponse<MenuItemResponse> updateMenuItem(
            @RequestParam Integer menuItemId,
            @Valid @RequestBody MenuItemRequest menuItemRequest
    ) {
        MenuItemResponse menuItemResponse = menuItemService.updateMenuItem(menuItemId, menuItemRequest);
        return ApiResponse.<MenuItemResponse>builder()
                .data(menuItemResponse)
                .build();
    }

    @Operation(summary = "xem chi tiết món ăn")
    @GetMapping("/{menuItemId}")
    public ApiResponse<MenuItemResponse> viewDetailMenuItem(@PathVariable Integer menuItemId) {
        MenuItemResponse menuItemResponse = menuItemService.getMenuItemById(menuItemId);
        return ApiResponse.<MenuItemResponse>builder()
                .data(menuItemResponse)
                .build();
    }

    @Operation(summary = "Thay đổi trạng thái món ăn")
    @PutMapping("/{menuItemId}/change-status")
    public ApiResponse<MenuItemResponse> changeStatusMenuItem(@PathVariable Integer menuItemId) {
        MenuItemResponse menuItemResponse = menuItemService.changeStatusMenuItem(menuItemId);
        return ApiResponse.<MenuItemResponse>builder()
                .data(menuItemResponse)
                .build();
    }

    @Operation(summary = "Xem danh sách món ăn")
    @GetMapping("/search")
    public ApiResponse<SimplePage<MenuItemResponse>> getAllMenuItems(
            @Valid MenuItemFilterRequest filterRequest,
            @ParameterObject @PageableDefault(size = Constants.PAGE.DEFAULT_PAGE_SIZE,
                    sort = Constants.SORT.SORT_BY,
                    direction = Sort.Direction.DESC
            ) Pageable pageable) {
        return ApiResponse.<SimplePage<MenuItemResponse>>builder()
                .data(menuItemService.getAllMenuItems(pageable, filterRequest))
                .build();
    }
}
