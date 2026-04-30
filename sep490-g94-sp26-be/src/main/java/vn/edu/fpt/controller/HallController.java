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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import vn.edu.fpt.dto.SimplePage;
import vn.edu.fpt.dto.request.hall.HallFilterRequest;
import vn.edu.fpt.dto.request.hall.HallRequest;
import vn.edu.fpt.dto.response.ApiResponse;
import vn.edu.fpt.dto.response.hall.HallResponse;
import vn.edu.fpt.util.enums.Constants;
import vn.edu.fpt.service.HallService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/hall")
@Tag(name = "Hall")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class HallController {

    HallService hallService;
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Tạo hội trường mới")
    @PostMapping("/create")
    public ApiResponse<HallResponse> createHall(
            @RequestPart("request") @Valid HallRequest request,
            @RequestPart("imageFiles") List<MultipartFile> imageFiles) throws Exception {
        HallResponse response = hallService.createHall(request, imageFiles);
        return ApiResponse.<HallResponse>builder()
                .data(response)
                .build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cập nhật hội trường")
    @PutMapping("/update")
    public ApiResponse<HallResponse> updateHall(
            @RequestParam Integer hallId,
            @Valid @RequestPart("request")  HallRequest request,
            @RequestPart(value = "imageFiles", required = false) List<MultipartFile> imageFiles) throws Exception {
        HallResponse response = hallService.updateHall(hallId, request, imageFiles);
        return ApiResponse.<HallResponse>builder()
                .data(response)
                .build();
    }

    @Operation(summary = "Xem chi tiết hội trường")
    @GetMapping("/{id}")
    public ApiResponse<HallResponse> viewDetailHall(@PathVariable Integer id) {
        HallResponse response = hallService.getHallById(id);
        return ApiResponse.<HallResponse>builder()
                .data(response)
                .build();
    }

    @Operation(summary = "Tìm kiếm và phân trang hội trường")
    @GetMapping("/search")
    public ApiResponse<SimplePage<HallResponse>> searchHalls(
            @Valid HallFilterRequest filter,
            @ParameterObject @PageableDefault(size = Constants.PAGE.DEFAULT_PAGE_SIZE,
                    sort = Constants.SORT.SORT_BY,
                    direction = Sort.Direction.DESC)
            Pageable pageable) {
        return ApiResponse.<SimplePage<HallResponse>>builder()
                .data(hallService.searchHalls(pageable, filter))
                .build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Thay đổi trạng thái hội trường")
    @PatchMapping("/{id}/change-status")
    public ApiResponse<HallResponse> changeHallStatus(@PathVariable Integer id) {
        HallResponse response = hallService.changeHallStatus(id);
        return ApiResponse.<HallResponse>builder()
                .data(response)
                .build();
    }
}
