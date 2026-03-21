package vn.edu.fpt.service.impl;

import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.fpt.dto.SimplePage;
import vn.edu.fpt.dto.request.contract.ContractFilterRequest;
import vn.edu.fpt.dto.request.contract.ContractRequest;
import vn.edu.fpt.dto.request.contract.ContractStatusRequest;
import vn.edu.fpt.dto.response.contract.ContractResponse;
import vn.edu.fpt.entity.Contract;
import vn.edu.fpt.exception.AppException;
import vn.edu.fpt.exception.ERROR_CODE;
import vn.edu.fpt.mapper.ContractMapper;
import vn.edu.fpt.respository.ContractRepository;
import vn.edu.fpt.respository.CustomerRepository;
import vn.edu.fpt.respository.HallRepository;
import vn.edu.fpt.respository.SetMenuRepository;
import vn.edu.fpt.service.ContractService;
import vn.edu.fpt.util.StringUtils;
import vn.edu.fpt.util.enums.BookingTime;
import vn.edu.fpt.util.enums.ContractState;
import vn.edu.fpt.util.enums.RecordStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ContractServiceImpl implements ContractService {

    private final ContractRepository bookingRepository;
    private final ContractMapper contractMapper;
    private final CustomerRepository customerRepository;
    private final HallRepository hallRepository;
    private final SetMenuRepository setMenuRepository;

    @Transactional
    @Override
    public ContractResponse createContract(ContractRequest request) {
        validateContract(request);
        validateNumberOfGuests(request.getHallId(), request.getExpectedGuests());

        Contract booking = contractMapper.toEntity(request);
        booking.setContractNo(generateContractNo());
        booking.setContractState(ContractState.DRAFT);
        booking.setStatus(RecordStatus.active);

        // Tính startTime và endTime từ bookingDate + bookingTime slot
        calculateAndSetTimes(booking, request.getBookingDate(), request.getBookingTime());

        Contract saved = bookingRepository.save(booking);
        return contractMapper.toResponse(saved);
    }

    @Transactional
    @Override
    public ContractResponse updateContract(Integer id, ContractRequest request) {
        Contract booking = bookingRepository.findById(id)
                .orElseThrow(() -> new AppException(ERROR_CODE.BOOKING_NOT_EXISTED));
        validateContract(request);
        // Nếu hallId hoặc expectedGuests có thay đổi thì validate số lượng khách với sức chứa của hội trường
        if(request.getHallId() != null && request.getExpectedGuests() != null) {
            validateNumberOfGuests(request.getHallId(), request.getExpectedGuests());
        } else if(request.getHallId() != null) {
            validateNumberOfGuests(request.getHallId(), booking.getExpectedGuests());
        } else if(request.getExpectedGuests() != null) {
            validateNumberOfGuests(booking.getHallId(), request.getExpectedGuests());
        }
        contractMapper.updateEntity(booking, request);

        // Tính lại startTime và endTime từ bookingDate + bookingTime slot
        calculateAndSetTimes(booking, request.getBookingDate(), request.getBookingTime());

        Contract saved = bookingRepository.save(booking);
        return contractMapper.toResponse(saved);
    }

    public void validateContract(ContractRequest request){
        if (request == null) {
            throw new AppException(ERROR_CODE.INVALID_REQUEST);
        }
        if (request.getCustomerId() != null &&
                !customerRepository.existsByIdAndStatus(request.getCustomerId(), RecordStatus.active)) {
            throw new AppException(ERROR_CODE.CUSTOMER_NOT_EXISTED);
        }
        if(request.getHallId() != null &&
                !hallRepository.existsByIdAndStatus(request.getHallId(), RecordStatus.active)) {
            throw new AppException(ERROR_CODE.HALL_NOT_EXISTED);
        }
        if(request.getSetMenuId() != null &&
                !setMenuRepository.existsByIdAndStatus(request.getSetMenuId(), RecordStatus.active)) {
            throw new AppException(ERROR_CODE.SET_MENU_NOT_EXISTED);
        }
        if(request.getBookingTime() != null && request.getBookingDate() != null) {
            LocalDateTime startTime = calculateStartTime(request.getBookingDate(), request.getBookingTime());
            LocalDateTime endTime = calculateEndTime(request.getBookingDate(), request.getBookingTime());
            if(bookingRepository.existsByStartTimeAndEndTimeAndContractStateAndHallId(startTime, endTime, ContractState.ACTIVE, request.getHallId())) {
                throw new AppException(ERROR_CODE.WEDDING_TIME_CONFLICT);
            }
        }
    }
    public void validateNumberOfGuests(Integer hallId, Integer numberOfGuests){
        Integer hallCapacity = hallRepository.findById(hallId)
                .orElseThrow(() -> new AppException(ERROR_CODE.HALL_NOT_EXISTED))
                .getCapacity();
        if (numberOfGuests > (hallCapacity - hallCapacity / 10) || numberOfGuests <= 0) {
            throw new AppException(ERROR_CODE.BOOKING_INVALID_NUMBER_OF_GUESTS);
        }
    }

    @Override
    public ContractResponse getContractById(Integer id) {
        Contract booking = bookingRepository.findById(id)
                .orElseThrow(() -> new AppException(ERROR_CODE.BOOKING_NOT_EXISTED));

        return contractMapper.toResponse(booking);
    }

    @Override
    public SimplePage<ContractResponse> searchContracts(Pageable pageable, ContractFilterRequest filter) {
        Specification<Contract> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter != null) {
                if (!StringUtils.isNullOrEmptyOrBlank(filter.getContractNo())) {
                    predicates.add(cb.like(cb.lower(root.get("bookingNo")),
                            "%" + filter.getContractNo().toLowerCase() + "%"));
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

                if (filter.getContractState() != null) {
                    predicates.add(cb.equal(root.get("bookingState"), filter.getContractState()));
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

        Page<Contract> page = bookingRepository.findAll(spec, pageable);
        List<ContractResponse> responses = page.getContent().stream()
                .map(contractMapper::toResponse)
                .toList();

        return new SimplePage<>(responses, page.getTotalElements(), pageable);
    }

    @Transactional
    @Override
    public ContractResponse changeContractStatus(Integer id) {
        Contract booking = bookingRepository.findById(id)
                .orElseThrow(() -> new AppException(ERROR_CODE.BOOKING_NOT_EXISTED));

        if (booking.getStatus() == RecordStatus.active) {
            booking.setStatus(RecordStatus.inactive);
        } else {
            booking.setStatus(RecordStatus.active);
        }

        Contract saved = bookingRepository.save(booking);
        return contractMapper.toResponse(saved);
    }

    /**
     * Tính startTime và endTime từ bookingDate + ContractTime slot
     * SLOT_1: Sáng  06:00 - 12:00
     * SLOT_2: Chiều 12:00 - 18:00
     * SLOT_3: Cả ngày 06:00 - 18:00
     */
    private void calculateAndSetTimes(Contract booking, LocalDate bookingDate, BookingTime bookingTime) {
        LocalDateTime startTime = bookingDate.atTime(bookingTime.getStartHour(), bookingTime.getStartMinute());
        LocalDateTime endTime = bookingDate.atTime(bookingTime.getEndHour(), bookingTime.getEndMinute());
        booking.setStartTime(startTime);
        booking.setEndTime(endTime);
        booking.setBookingTime(bookingTime);
    }
    private LocalDateTime calculateEndTime(LocalDate bookingDate, BookingTime bookingTime) {
        return bookingDate.atTime(bookingTime.getEndHour(), bookingTime.getEndMinute());
    }
    private LocalDateTime calculateStartTime(LocalDate bookingDate, BookingTime bookingTime) {
        return bookingDate.atTime(bookingTime.getStartHour(), bookingTime.getStartMinute());
    }

    @Transactional
    @Override
    public ContractResponse updateContractState(ContractStatusRequest request) {
        Contract booking = bookingRepository.findById(request.getContractId())
                .orElseThrow(() -> new AppException(ERROR_CODE.BOOKING_NOT_EXISTED));

        validateStateTransition(booking.getContractState(), request.getContractState());
        if(request.getContractState().equals(ContractState.CANCELLED)){
            booking.setStatus(RecordStatus.inactive);
        }
        booking.setContractState(request.getContractState());
        Contract saved = bookingRepository.save(booking);
        return contractMapper.toResponse(saved);
    }

    /**
     * Validate chuyển trạng thái contract:
     * DRAFT     → CONVERTED, CANCELLED, EXPIRED
     * CONVERTED → (không cho chuyển)
     * CANCELLED → (không cho chuyển)
     * EXPIRED   → (không cho chuyển)
     */
    private void validateStateTransition(ContractState currentState, ContractState newState) {
        if (currentState == newState) {
            return;
        }

        boolean valid = switch (currentState) {
            case DRAFT -> newState == ContractState.ACTIVE
                    || newState == ContractState.CANCELLED
                    || newState == ContractState.LIQUIDATED;
            case ACTIVE -> false;
            case CANCELLED -> false;
            case LIQUIDATED -> false;
        };

        if (!valid) {
            throw new AppException(ERROR_CODE.BOOKING_INVALID_STATE_TRANSITION);
        }
    }

    private String generateContractNo() {
        String prefix = "BK";
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String random = String.valueOf((int) (Math.random() * 9000) + 1000);
        return prefix + timestamp + random;
    }
}


