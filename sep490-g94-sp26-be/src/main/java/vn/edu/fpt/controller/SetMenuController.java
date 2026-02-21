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
import vn.edu.fpt.dto.request.setmenu.SetMenuFilterRequest;
import vn.edu.fpt.dto.request.setmenu.SetMenuRequest;
import vn.edu.fpt.dto.response.ApiResponse;
import vn.edu.fpt.dto.response.setmenu.SetMenuResponse;
import vn.edu.fpt.enums.Constants;
import vn.edu.fpt.service.SetMenuService;

@RestController
@RequestMapping("/api/v1/set-menu")
@Tag(name = "Set Menu")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SetMenuController {
    SetMenuService setMenuService;

    @Operation(summary = "Tạo set menu mới")
    @PostMapping("/create")
    public ApiResponse<SetMenuResponse> createNewSetMenu(@Valid @RequestBody SetMenuRequest setMenuRequest) {
        SetMenuResponse setMenuResponse = setMenuService.createNewSetMenu(setMenuRequest);
        return ApiResponse.<SetMenuResponse>builder()
                .data(setMenuResponse)
                .build();
    }

    @Operation(summary = "Xem chi tiết set menu")
    @GetMapping("/{setMenuId}")
    public ApiResponse<SetMenuResponse> viewDetailSetMenu(@PathVariable Integer setMenuId) {
        SetMenuResponse setMenuResponse = setMenuService.getSetMenuById(setMenuId);
        return ApiResponse.<SetMenuResponse>builder()
                .data(setMenuResponse)
                .build();
    }

    @Operation(summary = "Xem danh sách set menu")
    @GetMapping("/search")
    public ApiResponse<SimplePage<SetMenuResponse>> getAllSetMenus(
            @Valid SetMenuFilterRequest filterRequest,
            @ParameterObject @PageableDefault(size = Constants.PAGE.DEFAULT_PAGE_SIZE,
                    sort = Constants.SORT.SORT_BY,
                    direction = Sort.Direction.DESC)
            Pageable pageable) {
        return ApiResponse.<SimplePage<SetMenuResponse>>builder()
                .data(setMenuService.getAllSetMenu(pageable, filterRequest))
                .build();
    }
}
