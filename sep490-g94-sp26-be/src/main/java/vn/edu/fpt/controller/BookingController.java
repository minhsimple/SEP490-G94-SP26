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
import vn.edu.fpt.dto.request.booking.BookingFilterRequest;
import vn.edu.fpt.dto.request.booking.BookingRequest;
import vn.edu.fpt.dto.request.booking.BookingStatusRequest;
import vn.edu.fpt.dto.response.ApiResponse;
import vn.edu.fpt.dto.response.booking.BookingResponse;
import vn.edu.fpt.service.BookingService;
import vn.edu.fpt.util.enums.Constants;


@RestController
@RequestMapping("/api/v1/booking")
@Tag(name = "Booking")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BookingController {

    BookingService bookingService;

    @Operation(summary = "Tạo mới đặt tiệc")
    @PostMapping("/create")
    public ApiResponse<BookingResponse> createBooking(@RequestBody @Valid BookingRequest request) {
        BookingResponse response = bookingService.createBooking(request);
        return ApiResponse.<BookingResponse>builder()
                .data(response)
                .build();
    }

    @Operation(summary = "Cập nhật đặt tiệc")
    @PutMapping("/update")
    public ApiResponse<BookingResponse> updateBooking(
            @RequestParam Integer bookingId,
            @Valid @RequestBody BookingRequest request) {
        BookingResponse response = bookingService.updateBooking(bookingId, request);
        return ApiResponse.<BookingResponse>builder()
                .data(response)
                .build();
    }

    @Operation(summary = "Xem chi tiết đặt tiệc")
    @GetMapping("/{id}")
    public ApiResponse<BookingResponse> viewDetailBooking(@PathVariable Integer id) {
        BookingResponse response = bookingService.getBookingById(id);
        return ApiResponse.<BookingResponse>builder()
                .data(response)
                .build();
    }

    @Operation(summary = "Tìm kiếm và phân trang đặt tiệc")
    @GetMapping("/search")
    public ApiResponse<SimplePage<BookingResponse>> searchBookings(
            @Valid BookingFilterRequest filter,
            @ParameterObject @PageableDefault(size = Constants.PAGE.DEFAULT_PAGE_SIZE,
                    sort = Constants.SORT.SORT_BY,
                    direction = Sort.Direction.DESC)
            Pageable pageable) {
        return ApiResponse.<SimplePage<BookingResponse>>builder()
                .data(bookingService.searchBookings(pageable, filter))
                .build();
    }

    @Operation(summary = "Cập nhật trạng thái đặt tiệc (DRAFT → CONVERTED/CANCELLED/EXPIRED)")
    @PutMapping("/update-state")
    public ApiResponse<BookingResponse> updateBookingState(
            @Valid @RequestBody BookingStatusRequest request) {
        BookingResponse response = bookingService.updateBookingState(request);
        return ApiResponse.<BookingResponse>builder()
                .data(response)
                .build();
    }

    @Operation(summary = "Thay đổi trạng thái đặt tiệc")
    @PatchMapping("/{id}/change-status")
    public ApiResponse<BookingResponse> changeBookingStatus(@PathVariable Integer id) {
        BookingResponse response = bookingService.changeBookingStatus(id);
        return ApiResponse.<BookingResponse>builder()
                .data(response)
                .build();
    }
}


