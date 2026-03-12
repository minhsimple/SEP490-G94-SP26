package vn.edu.fpt.service.impl;

import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.fpt.dto.SimplePage;
import vn.edu.fpt.dto.request.booking.BookingFilterRequest;
import vn.edu.fpt.dto.request.booking.BookingRequest;
import vn.edu.fpt.dto.request.booking.BookingStatusRequest;
import vn.edu.fpt.dto.response.booking.BookingResponse;
import vn.edu.fpt.entity.Booking;
import vn.edu.fpt.exception.AppException;
import vn.edu.fpt.exception.ERROR_CODE;
import vn.edu.fpt.mapper.BookingMapper;
import vn.edu.fpt.respository.BookingRepository;
import vn.edu.fpt.respository.CustomerRepository;
import vn.edu.fpt.respository.HallRepository;
import vn.edu.fpt.respository.SetMenuRepository;
import vn.edu.fpt.service.BookingService;
import vn.edu.fpt.util.StringUtils;
import vn.edu.fpt.util.enums.BookingState;
import vn.edu.fpt.util.enums.BookingTime;
import vn.edu.fpt.util.enums.RecordStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final BookingMapper bookingMapper;
    private final CustomerRepository customerRepository;
    private final HallRepository hallRepository;
    private final SetMenuRepository setMenuRepository;

    @Transactional
    @Override
    public BookingResponse createBooking(BookingRequest request) {
        if (request == null) {
            throw new AppException(ERROR_CODE.INVALID_REQUEST);
        }
        if(!customerRepository.existsByIdAndStatus(request.getCustomerId(), RecordStatus.active)) {
            throw new AppException(ERROR_CODE.CUSTOMER_NOT_EXISTED);
        }
        if(!hallRepository.existsByIdAndStatus(request.getHallId(), RecordStatus.active)) {
            throw new AppException(ERROR_CODE.HALL_NOT_EXISTED);
        }
        if(!setMenuRepository.existsByIdAndStatus(request.getSetMenuId(), RecordStatus.active)) {
            throw new AppException(ERROR_CODE.SET_MENU_NOT_EXISTED);
        }

        Booking booking = bookingMapper.toEntity(request);
        booking.setBookingNo(generateBookingNo());
        booking.setBookingState(BookingState.DRAFT);
        booking.setStatus(RecordStatus.active);

        // Tính startTime và endTime từ bookingDate + bookingTime slot
        calculateAndSetTimes(booking, request.getBookingDate(), request.getBookingTime());

        Booking saved = bookingRepository.save(booking);
        return bookingMapper.toResponse(saved);
    }

    @Transactional
    @Override
    public BookingResponse updateBooking(Integer id, BookingRequest request) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new AppException(ERROR_CODE.BOOKING_NOT_EXISTED));

        bookingMapper.updateEntity(booking, request);

        // Tính lại startTime và endTime từ bookingDate + bookingTime slot
        calculateAndSetTimes(booking, request.getBookingDate(), request.getBookingTime());

        Booking saved = bookingRepository.save(booking);
        return bookingMapper.toResponse(saved);
    }

    @Override
    public BookingResponse getBookingById(Integer id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new AppException(ERROR_CODE.BOOKING_NOT_EXISTED));

        return bookingMapper.toResponse(booking);
    }

    @Override
    public SimplePage<BookingResponse> searchBookings(Pageable pageable, BookingFilterRequest filter) {
        Specification<Booking> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter != null) {
                if (!StringUtils.isNullOrEmptyOrBlank(filter.getBookingNo())) {
                    predicates.add(cb.like(cb.lower(root.get("bookingNo")),
                            "%" + filter.getBookingNo().toLowerCase() + "%"));
                }

                if (filter.getCustomerId() != null) {
                    predicates.add(cb.equal(root.get("customerId"), filter.getCustomerId()));
                }

                if (filter.getHallId() != null) {
                    predicates.add(cb.equal(root.get("hallId"), filter.getHallId()));
                }

                if (filter.getBookingDateFrom() != null) {
                    LocalDateTime from = filter.getBookingDateFrom().atStartOfDay();
                    predicates.add(cb.greaterThanOrEqualTo(root.get("startTime"), from));
                }

                if (filter.getBookingDateTo() != null) {
                    LocalDateTime to = filter.getBookingDateTo().atTime(23, 59, 59);
                    predicates.add(cb.lessThanOrEqualTo(root.get("startTime"), to));
                }

                if (filter.getBookingTime() != null) {
                    predicates.add(cb.equal(root.get("bookingTime"), filter.getBookingTime()));
                }

                if (filter.getBookingState() != null) {
                    predicates.add(cb.equal(root.get("bookingState"), filter.getBookingState()));
                }

                if (filter.getSalesId() != null) {
                    predicates.add(cb.equal(root.get("salesId"), filter.getSalesId()));
                }

                if (!StringUtils.isNullOrEmptyOrBlank(filter.getBrideName())) {
                    predicates.add(cb.like(cb.lower(root.get("brideName")),
                            "%" + filter.getBrideName().toLowerCase() + "%"));
                }

                if (!StringUtils.isNullOrEmptyOrBlank(filter.getGroomName())) {
                    predicates.add(cb.like(cb.lower(root.get("groomName")),
                            "%" + filter.getGroomName().toLowerCase() + "%"));
                }

                if (filter.getStatus() != null) {
                    predicates.add(cb.equal(root.get("status"), filter.getStatus()));
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Booking> page = bookingRepository.findAll(spec, pageable);
        List<BookingResponse> responses = page.getContent().stream()
                .map(bookingMapper::toResponse)
                .toList();

        return new SimplePage<>(responses, page.getTotalElements(), pageable);
    }

    @Transactional
    @Override
    public BookingResponse changeBookingStatus(Integer id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new AppException(ERROR_CODE.BOOKING_NOT_EXISTED));

        if (booking.getStatus() == RecordStatus.active) {
            booking.setStatus(RecordStatus.inactive);
        } else {
            booking.setStatus(RecordStatus.active);
        }

        Booking saved = bookingRepository.save(booking);
        return bookingMapper.toResponse(saved);
    }

    /**
     * Tính startTime và endTime từ bookingDate + BookingTime slot
     * SLOT_1: Sáng  06:00 - 12:00
     * SLOT_2: Chiều 12:00 - 18:00
     * SLOT_3: Cả ngày 06:00 - 18:00
     */
    private void calculateAndSetTimes(Booking booking, LocalDate bookingDate, BookingTime bookingTime) {
        LocalDateTime startTime = bookingDate.atTime(bookingTime.getStartHour(), bookingTime.getStartMinute());
        LocalDateTime endTime = bookingDate.atTime(bookingTime.getEndHour(), bookingTime.getEndMinute());
        booking.setStartTime(startTime);
        booking.setEndTime(endTime);
        booking.setBookingTime(bookingTime);
    }

    @Transactional
    @Override
    public BookingResponse updateBookingState(BookingStatusRequest request) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new AppException(ERROR_CODE.BOOKING_NOT_EXISTED));

        validateStateTransition(booking.getBookingState(), request.getBookingState());

        booking.setBookingState(request.getBookingState());
        Booking saved = bookingRepository.save(booking);
        return bookingMapper.toResponse(saved);
    }

    /**
     * Validate chuyển trạng thái booking:
     * DRAFT     → CONVERTED, CANCELLED, EXPIRED
     * CONVERTED → (không cho chuyển)
     * CANCELLED → (không cho chuyển)
     * EXPIRED   → (không cho chuyển)
     */
    private void validateStateTransition(BookingState currentState, BookingState newState) {
        if (currentState == newState) {
            return;
        }

        boolean valid = switch (currentState) {
            case DRAFT -> newState == BookingState.CONVERTED
                    || newState == BookingState.CANCELLED
                    || newState == BookingState.EXPIRED;
            case CONVERTED, CANCELLED, EXPIRED -> false;
        };

        if (!valid) {
            throw new AppException(ERROR_CODE.BOOKING_INVALID_STATE_TRANSITION);
        }
    }

    private String generateBookingNo() {
        String prefix = "BK";
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String random = String.valueOf((int) (Math.random() * 9000) + 1000);
        return prefix + timestamp + random;
    }
}


