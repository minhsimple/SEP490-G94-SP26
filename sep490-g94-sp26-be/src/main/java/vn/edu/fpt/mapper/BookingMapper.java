package vn.edu.fpt.mapper;

import org.mapstruct.*;
import vn.edu.fpt.dto.request.booking.BookingRequest;
import vn.edu.fpt.dto.response.booking.BookingResponse;
import vn.edu.fpt.entity.Booking;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Mapper(
        componentModel = "spring",
        builder = @Builder(disableBuilder = true)
)
public interface BookingMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "bookingNo", ignore = true)
    @Mapping(target = "bookingState", ignore = true)
    @Mapping(target = "startTime", ignore = true)
    @Mapping(target = "endTime", ignore = true)
    Booking toEntity(BookingRequest request);

    @Mapping(target = "bookingDate", source = "startTime", qualifiedByName = "toLocalDate")
    BookingResponse toResponse(Booking booking);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "bookingNo", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "bookingState", ignore = true)
    @Mapping(target = "startTime", ignore = true)
    @Mapping(target = "endTime", ignore = true)
    void updateEntity(@MappingTarget Booking booking, BookingRequest request);

    @Named("toLocalDate")
    default LocalDate toLocalDate(LocalDateTime dateTime) {
        return dateTime != null ? dateTime.toLocalDate() : null;
    }
}

