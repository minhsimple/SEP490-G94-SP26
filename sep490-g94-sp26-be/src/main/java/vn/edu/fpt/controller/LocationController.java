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
import vn.edu.fpt.dto.request.location.LocationRequest;
import vn.edu.fpt.dto.response.ApiResponse;
import vn.edu.fpt.dto.response.location.LocationResponse;
import vn.edu.fpt.enums.Constants;
import vn.edu.fpt.service.LocationService;

@RestController
@RequestMapping("/api/v1/location")
@Tag(name = "Location")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class LocationController {

    LocationService locationService;

    @Operation(summary = "Tạo địa điểm mới")
    @PostMapping("/create")
    public ApiResponse<LocationResponse> createLocation(@RequestBody @Valid LocationRequest request) {
        LocationResponse response = locationService.createLocation(request);
        return ApiResponse.<LocationResponse>builder()
                .data(response)
                .build();
    }

    @Operation(summary = "Cập nhật địa điểm")
    @PutMapping("/update")
    public ApiResponse<LocationResponse> updateLocation(@RequestParam Integer locationId,
                                                        @RequestBody @Valid LocationRequest request) {
        LocationResponse response = locationService.updateLocation(locationId, request);
        return ApiResponse.<LocationResponse>builder()
                .data(response)
                .build();
    }

    @Operation(summary = "Xem chi tiết địa điểm")
    @GetMapping("/{id}")
    public ApiResponse<LocationResponse> viewDetailLocation(@PathVariable Integer id) {
        LocationResponse response = locationService.getLocationById(id);
        return ApiResponse.<LocationResponse>builder()
                .data(response)
                .build();
    }

    @Operation(summary = "Xem danh sách địa điểm")
    @GetMapping("/search")
    public ApiResponse<SimplePage<LocationResponse>> getAllLocation(
            @Valid LocationRequest filter,
            @ParameterObject @PageableDefault(size = Constants.PAGE.DEFAULT_PAGE_SIZE,
                    sort = Constants.SORT.SORT_BY,
                    direction = Sort.Direction.DESC
            ) Pageable pageable) {
        return ApiResponse.<SimplePage<LocationResponse>>builder()
                .data(locationService.getAllLocations(pageable, filter))
                .build();
    }

    @Operation(summary = "Thay đổi status (bật/tắt) địa điểm")
    @PatchMapping("/{id}/change-status")
    public ApiResponse<LocationResponse> changeLocationStatus(@PathVariable Integer id) {
        LocationResponse response = locationService.changeLocationStatus(id);
        return ApiResponse.<LocationResponse>builder()
                .data(response)
                .build();
    }
}
