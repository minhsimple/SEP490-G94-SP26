package vn.edu.fpt.service.impl;

import jakarta.persistence.criteria.Predicate;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.fpt.dto.SimplePage;
import vn.edu.fpt.dto.request.contract.CalenderContractRequest;
import vn.edu.fpt.dto.request.contract.ContractFilterRequest;
import vn.edu.fpt.dto.request.contract.ContractRequest;
import vn.edu.fpt.dto.request.contract.ContractStatusRequest;
import vn.edu.fpt.dto.request.payment.PaymentRequest;
import vn.edu.fpt.dto.request.task.TaskListCreateRequest;
import vn.edu.fpt.dto.request.task.TaskListRequest;
import vn.edu.fpt.dto.response.contract.ContractResponse;
import vn.edu.fpt.dto.response.tablelayout.TableLayoutResponse;
import vn.edu.fpt.entity.Contract;
import vn.edu.fpt.exception.AppException;
import vn.edu.fpt.exception.ERROR_CODE;
import vn.edu.fpt.mapper.ContractMapper;
import vn.edu.fpt.respository.*;
import vn.edu.fpt.service.ContractService;
import vn.edu.fpt.service.InvoiceService;
import vn.edu.fpt.service.TableLayoutService;
import vn.edu.fpt.service.TaskListService;
import vn.edu.fpt.util.StringUtils;
import vn.edu.fpt.util.enums.*;
import vn.edu.fpt.dto.response.contract.CalenderContractResponse;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.time.temporal.ChronoUnit;


@Service
@RequiredArgsConstructor
public class ContractServiceImpl implements ContractService {

    private final ContractRepository bookingRepository;
    private final ContractMapper contractMapper;
    private final CustomerRepository customerRepository;
    private final HallRepository hallRepository;
    private final SetMenuRepository setMenuRepository;
    private final ServicePackageRepository servicePackageRepository;
    private final PaymentServiceImpl paymentServiceImpl;
    private final SetMenuServiceImpl setMenuServiceImpl;
    private final InvoiceService invoiceService;

    private final TableLayoutService tableLayoutService;

    @Transactional
    @Override
    public ContractResponse createContract(ContractRequest request) throws Exception {
        validateContract(request);
        validateNumberOfGuests(request.getHallId(), request.getExpectedGuests());

        Contract booking = contractMapper.toEntity(request);
        booking.setContractNo(generateContractNo());
        booking.setContractState(ContractState.DRAFT);
        booking.setStatus(RecordStatus.active);

        // Tính startTime và endTime từ bookingDate + bookingTime slot
        calculateAndSetTimes(booking, request.getBookingDate(), request.getBookingTime());

        Contract saved = bookingRepository.save(booking);

        TableLayoutResponse tableLayoutResponse = tableLayoutService.createTableLayout(request.getTableLayoutRequest(), saved.getId());
        ContractResponse contractResponse = contractMapper.toResponse(saved);
        contractResponse.setTableLayoutResponse(tableLayoutResponse);

        createPaymentForContract(saved);
        invoiceService.createInvoice(saved.getId());

        return contractResponse;
    }

    @Transactional
    @Override
    public ContractResponse updateContract(Integer id, ContractRequest request) {
        Contract booking = bookingRepository.findById(id)
                .orElseThrow(() -> new AppException(ERROR_CODE.BOOKING_NOT_EXISTED));
        validateUpdateContract(request, id);
        // Nếu hallId hoặc expectedGuests có thay đổi thì validate số lượng khách với sức chứa của hội trường
        if (request.getHallId() != null && request.getExpectedGuests() != null) {
            validateNumberOfGuests(request.getHallId(), request.getExpectedGuests());
        } else if (request.getHallId() != null) {
            validateNumberOfGuests(request.getHallId(), booking.getExpectedGuests());
        } else if (request.getExpectedGuests() != null) {
            validateNumberOfGuests(booking.getHallId(), request.getExpectedGuests());
        }
        contractMapper.updateEntity(booking, request);

        TableLayoutResponse tableLayoutResponse = tableLayoutService.updateTableLayout(request.getTableLayoutRequest(), booking.getId());

        // Tính lại startTime và endTime từ bookingDate + bookingTime slot
        calculateAndSetTimes(booking, request.getBookingDate(), request.getBookingTime());

        Contract saved = bookingRepository.save(booking);
        ContractResponse contractResponse = contractMapper.toResponse(saved);
        contractResponse.setTableLayoutResponse(tableLayoutResponse);
        return contractResponse;
    }

    public void validateContract(ContractRequest request) {
        if (request == null) {
            throw new AppException(ERROR_CODE.INVALID_REQUEST);
        }
        if (request.getCustomerId() != null &&
                !customerRepository.existsByIdAndStatus(request.getCustomerId(), RecordStatus.active)) {
            throw new AppException(ERROR_CODE.CUSTOMER_NOT_EXISTED);
        }
        if (request.getHallId() != null &&
                !hallRepository.existsByIdAndStatus(request.getHallId(), RecordStatus.active)) {
            throw new AppException(ERROR_CODE.HALL_NOT_EXISTED);
        }
        if (request.getSetMenuId() != null &&
                !setMenuRepository.existsByIdAndStatus(request.getSetMenuId(), RecordStatus.active)) {
            throw new AppException(ERROR_CODE.SET_MENU_NOT_EXISTED);
        }
        if (request.getBookingDate() != null) {
            validateBookingDateAdvance(request.getBookingDate());
        }
        if (request.getBookingTime() != null && request.getBookingDate() != null) {
            LocalDateTime startTime = calculateStartTime(request.getBookingDate(), request.getBookingTime());
            LocalDateTime endTime = calculateEndTime(request.getBookingDate(), request.getBookingTime());
            if (bookingRepository.existsByStartTimeAndEndTimeAndContractStateAndHallId(startTime, endTime, ContractState.ACTIVE, request.getHallId())) {
                throw new AppException(ERROR_CODE.WEDDING_TIME_CONFLICT);
            }
        }
    }

    public void validateUpdateContract(ContractRequest request, Integer bookingId) {
        if (request == null) {
            throw new AppException(ERROR_CODE.INVALID_REQUEST);
        }
        if (request.getCustomerId() != null &&
                !customerRepository.existsByIdAndStatus(request.getCustomerId(), RecordStatus.active)) {
            throw new AppException(ERROR_CODE.CUSTOMER_NOT_EXISTED);
        }
        if (request.getHallId() != null &&
                !hallRepository.existsByIdAndStatus(request.getHallId(), RecordStatus.active)) {
            throw new AppException(ERROR_CODE.HALL_NOT_EXISTED);
        }
        if (request.getSetMenuId() != null &&
                !setMenuRepository.existsByIdAndStatus(request.getSetMenuId(), RecordStatus.active)) {
            throw new AppException(ERROR_CODE.SET_MENU_NOT_EXISTED);
        }
        if (request.getBookingTime() != null && request.getBookingDate() != null) {
            LocalDateTime startTime = calculateStartTime(request.getBookingDate(), request.getBookingTime());
            LocalDateTime endTime = calculateEndTime(request.getBookingDate(), request.getBookingTime());
            if (bookingRepository.existsByStartTimeAndEndTimeAndContractStateAndHallIdAndIdNot(startTime, endTime, ContractState.ACTIVE, request.getHallId(), bookingId)) {
                throw new AppException(ERROR_CODE.WEDDING_TIME_CONFLICT);
            }
        }
    }

    public void validateNumberOfGuests(Integer hallId, Integer numberOfGuests) {
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

        TableLayoutResponse tableLayoutResponse = tableLayoutService.getTableLayoutByContractId(id);
        ContractResponse contractResponse = contractMapper.toResponse(booking);
        contractResponse.setTableLayoutResponse(tableLayoutResponse);
        return contractResponse;
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
                    predicates.add(cb.lessThanOrEqualTo(root.get("endTime"), to));
                }

                if (filter.getBookingTime() != null) {
                    predicates.add(cb.equal(root.get("bookingTime"), filter.getBookingTime()));
                }

                if (filter.getContractState() != null) {
                    predicates.add(cb.equal(root.get("contractState"), filter.getContractState()));
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
                .map(contract -> {
                    TableLayoutResponse tableLayoutResponse = tableLayoutService.getTableLayoutByContractId(contract.getId());
                    ContractResponse contractResponse = contractMapper.toResponse(contract);
                    contractResponse.setTableLayoutResponse(tableLayoutResponse);
                    return contractResponse;
                })
                .toList();

        return new SimplePage<>(responses, page.getTotalElements(), pageable);
    }

    @Transactional
    @Override
    public ContractResponse changeContractStatus(Integer id) {
        Contract booking = bookingRepository.findById(id)
                .orElseThrow(() -> new AppException(ERROR_CODE.BOOKING_NOT_EXISTED));
        TableLayoutResponse tableLayoutResponse = tableLayoutService.getTableLayoutByContractId(id);

        if (booking.getStatus() == RecordStatus.active) {
            booking.setStatus(RecordStatus.inactive);
        } else {
            booking.setStatus(RecordStatus.active);
        }

        Contract saved = bookingRepository.save(booking);
        ContractResponse contractResponse = contractMapper.toResponse(saved);
        contractResponse.setTableLayoutResponse(tableLayoutResponse);
        return contractResponse;
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
        TableLayoutResponse tableLayoutResponse = tableLayoutService.getTableLayoutByContractId(request.getContractId());

        validateStateTransition(booking.getContractState(), request.getContractState());
        if (request.getContractState().equals(ContractState.CANCELLED)) {
            booking.setStatus(RecordStatus.inactive);
        }
        booking.setContractState(request.getContractState());
        Contract saved = bookingRepository.save(booking);

        // Auto-create TaskList khi contract state = ACTIVE

        ContractResponse contractResponse = contractMapper.toResponse(saved);
        contractResponse.setTableLayoutResponse(tableLayoutResponse);

        return contractResponse;
    }

    @Override
    public List<CalenderContractResponse> getAllTimeTable(CalenderContractRequest request) {
        return bookingRepository.getCalendarFromContract(request.getHallId(),
                request.getStartTime(), request.getEndTime(), request.getLocationId());
    }

    // tạo 3 payment mới với thông tin từ contract
    // payment đầu tiên: 40% tổng tiền, trạng thái PENDING
    // payment thứ 2:  30% tổng tiền, trạng thái PENDING
    // payment thứ 3: 30% tổng tiền +  penalty (nếu có) với số tiền phạt, trạng thái PENDING
    public void createPaymentForContract(Contract contract) throws Exception {
        BigDecimal totalAmount = getTotalAmountForContract(contract);

        BigDecimal firstAmount = totalAmount.multiply(BigDecimal.valueOf(0.4));
        BigDecimal secondAmount = totalAmount.multiply(BigDecimal.valueOf(0.6));

        PaymentRequest request1 = PaymentRequest.builder()
                .contractId(contract.getId())
                .amount(firstAmount)
                .method(PaymentMethod.BANK_TRANSFER)
                .paymentState(PaymentState.PENDING)
                .note("Thanh toán đợt 1 - 40%")
                .build();

        PaymentRequest request2 = PaymentRequest.builder()
                .contractId(contract.getId())
                .amount(secondAmount)
                .method(PaymentMethod.BANK_TRANSFER)
                .paymentState(PaymentState.PENDING)
                .note("Thanh toán đợt 2 - 60% + chi phí phát sinh (nếu có)")
                .build();

        paymentServiceImpl.createPayment(request1);
        paymentServiceImpl.createPayment(request2);

    }

    public BigDecimal getTotalAmountForContract(Contract contract) throws Exception {
        BigDecimal setMenuPrice = setMenuServiceImpl.getSetMenuById(contract.getSetMenuId()).getSetPrice();
        BigDecimal servicePrice = servicePackageRepository.findByIdAndStatus(contract.getPackageId(), RecordStatus.active)
                .orElseThrow(() -> new AppException(ERROR_CODE.SERVICE_PACKAGE_NOT_FOUND))
                .getBasePrice();
        BigDecimal totalPrice = setMenuPrice.multiply(BigDecimal.valueOf(contract.getExpectedTables()));
        BigDecimal hallPrice = hallRepository.findByIdAndStatus(contract.getHallId(), RecordStatus.active)
                .orElseThrow(() -> new AppException(ERROR_CODE.HALL_NOT_EXISTED))
                .getBasePrice();
        return totalPrice.add(servicePrice).add(hallPrice);
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

    /**
     * Validate ngày cưới phải đặt trước 3 tháng từ ngày hiện tại
     */
    private void validateBookingDateAdvance(LocalDate bookingDate) {
        LocalDate today = LocalDate.now();
        LocalDate threeMonthsLater = today.plus(3, ChronoUnit.MONTHS);

        if (bookingDate.isBefore(threeMonthsLater)) {
            throw new AppException(ERROR_CODE.BOOKING_DATE_TOO_FAR);
        }
    }

    private String generateContractNo() {
        String prefix = "BK";
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String random = String.valueOf((int) (Math.random() * 9000) + 1000);
        return prefix + timestamp + random;
    }
}


