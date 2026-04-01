package vn.edu.fpt.dto.request.contract;

import vn.edu.fpt.util.enums.BookingTime;

import java.time.LocalDateTime;

public class CalenderContractRequest {
    LocalDateTime startTime;
    LocalDateTime endTime;
    Integer hallId;
}
