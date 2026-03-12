package vn.edu.fpt.respository;

import vn.edu.fpt.entity.Booking;
import vn.edu.fpt.util.enums.BookingState;
import vn.edu.fpt.util.enums.RecordStatus;

import java.util.List;
import java.util.Optional;

public interface BookingRepository extends BaseRepository<Booking, Integer> {

    Optional<Booking> findByIdAndStatus(Integer id, RecordStatus status);

    List<Booking> findAllByStatus(RecordStatus status);

    Optional<Booking> findByBookingNo(String bookingNo);

    Boolean existsByBookingNo(String bookingNo);

    List<Booking> findAllByCustomerId(Integer customerId);

    List<Booking> findAllByHallIdAndBookingState(Integer hallId, BookingState bookingState);
}


