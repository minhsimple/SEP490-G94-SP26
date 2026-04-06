package vn.edu.fpt.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;
import vn.edu.fpt.dto.request.tablelayout.TableLayoutRequest;
import vn.edu.fpt.dto.response.ApiResponse;
import vn.edu.fpt.dto.response.tablelayout.TableLayoutResponse;
import vn.edu.fpt.service.TableLayoutService;

@RestController
@RequestMapping("/api/v1/table-layout")
@Tag(name = "Table Layout")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TableLayoutController {
    TableLayoutService tableLayoutService;

    @Operation(summary = "Tạo mới table layout")
    @PostMapping("/create")
    public ApiResponse<TableLayoutResponse> createTableLayout(
            @Valid @RequestBody TableLayoutRequest tableLayoutRequest) {
        TableLayoutResponse tableLayoutResponse = tableLayoutService.createTableLayout(tableLayoutRequest);
        return ApiResponse.<TableLayoutResponse>builder()
                .data(tableLayoutResponse)
                .build();
    }

    @Operation(summary = "Cập nhật table layout")
    @PutMapping("/update")
    public ApiResponse<TableLayoutResponse> updateTableLayout(
            @Valid @RequestBody TableLayoutRequest tableLayoutRequest) {
        TableLayoutResponse tableLayoutResponse = tableLayoutService.updateTableLayout(tableLayoutRequest);
        return ApiResponse.<TableLayoutResponse>builder()
                .data(tableLayoutResponse)
                .build();
    }

    @Operation(summary = "Xem chi tiết table layout theo ID của hợp đồng")
    @GetMapping("/{id}")
    public ApiResponse<TableLayoutResponse> getTableLayoutByContractId(@PathVariable Integer id) {
        TableLayoutResponse tableLayoutResponse = tableLayoutService.getTableLayoutByContractId(id);
        return ApiResponse.<TableLayoutResponse>builder()
                .data(tableLayoutResponse)
                .build();
    }
}
