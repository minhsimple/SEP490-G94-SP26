package vn.edu.fpt.service;

import org.springframework.data.domain.Pageable;
import vn.edu.fpt.dto.SimplePage;
import vn.edu.fpt.dto.request.booking.BookingFilterRequest;
import vn.edu.fpt.dto.request.booking.BookingRequest;
import vn.edu.fpt.dto.request.booking.BookingStatusRequest;
import vn.edu.fpt.dto.response.booking.BookingResponse;

public interface BookingService {

    BookingResponse createBooking(BookingRequest request);

    BookingResponse updateBooking(Integer id, BookingRequest request);

    BookingResponse getBookingById(Integer id);

    SimplePage<BookingResponse> searchBookings(Pageable pageable, BookingFilterRequest filter);

    BookingResponse changeBookingStatus(Integer id);

    BookingResponse updateBookingState(BookingStatusRequest request);
}


