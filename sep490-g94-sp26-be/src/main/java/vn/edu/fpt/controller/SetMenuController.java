package vn.edu.fpt.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.edu.fpt.dto.request.setmenu.SetMenuRequest;
import vn.edu.fpt.dto.response.ApiResponse;
import vn.edu.fpt.dto.response.setmenu.SetMenuResponse;
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
}
