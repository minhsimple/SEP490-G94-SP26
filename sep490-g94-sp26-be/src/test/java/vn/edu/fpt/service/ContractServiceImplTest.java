package vn.edu.fpt.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.*;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.web.multipart.MultipartFile;
import vn.edu.fpt.dto.request.contract.ContractFilterRequest;
import vn.edu.fpt.dto.request.contract.ContractRequest;
import vn.edu.fpt.dto.request.contract.ContractStatusRequest;
import vn.edu.fpt.dto.request.customer.CustomerRequest;
import vn.edu.fpt.dto.response.contract.ContractResponse;
import vn.edu.fpt.dto.response.customer.CustomerResponse;
import vn.edu.fpt.dto.response.invoice.InvoiceResponse;
import vn.edu.fpt.entity.*;
import vn.edu.fpt.exception.AppException;
import vn.edu.fpt.exception.ERROR_CODE;
import vn.edu.fpt.mapper.ContractMapper;
import vn.edu.fpt.respository.*;
import vn.edu.fpt.util.enums.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("Contract Service Tests")
class ContractServiceImplTest {

    @MockitoBean
    private ContractRepository bookingRepository;

    @MockitoBean
    private ContractMapper contractMapper;

    @MockitoBean
    private CustomerRepository customerRepository;

    @MockitoBean
    private HallRepository hallRepository;

    @MockitoBean
    private SetMenuRepository setMenuRepository;

    @MockitoBean
    private ServicePackageRepository servicePackageRepository;

    @MockitoBean
    private CustomerService customerService;

    @MockitoBean
    private PaymentService paymentService;

    @MockitoBean
    private SetMenuService setMenuService;

    @MockitoBean
    private InvoiceService invoiceService;

    @MockitoBean
    private TasksRepository tasksRepository;

    @MockitoBean
    private TaskListRepository taskListRepository;

    @MockitoBean
    private InvoiceRepository invoiceRepository;

    @Autowired
    private ContractService contractService;

    private ContractRequest contractRequest;
    private Contract contract;
    private CustomerRequest customerRequest;
    private CustomerResponse customerResponse;
    private Hall hall;
    private LocalDate bookingDate;

    @BeforeEach
    void setUp() {
        bookingDate = LocalDate.now().plusMonths(4);

        // Setup Customer Request
        customerRequest = new CustomerRequest();
        customerRequest.setFullName("Nguyễn Văn A");
        customerRequest.setCitizenIdNumber("123456789");
        customerRequest.setPhone("0912345678");
        customerRequest.setEmail("customer@example.com");
        customerRequest.setAddress("123 Main St");
        customerRequest.setLocationId(1);
        customerRequest.setNotes("Test customer");

        // Setup Customer Response
        customerResponse = new CustomerResponse();
        customerResponse.setId(1);
        customerResponse.setFullName("Nguyễn Văn A");
        customerResponse.setCitizenIdNumber("123456789");
        customerResponse.setPhone("0912345678");
        customerResponse.setEmail("customer@example.com");
        customerResponse.setAddress("123 Main St");
        customerResponse.setLocationId(1);
        customerResponse.setNotes("Test customer");
        customerResponse.setStatus(RecordStatus.active);

        // Setup Hall
        hall = new Hall();
        hall.setId(1);
        hall.setName("Hall A");
        hall.setCapacity(500);
        hall.setBasePrice(BigDecimal.valueOf(5000000));
        hall.setStatus(RecordStatus.active);
        hall.setLocationId(1);

        // Setup Contract Request
        contractRequest = new ContractRequest();
        contractRequest.setCustomerId(1);
        contractRequest.setCustomerRequest(customerRequest);
        contractRequest.setHallId(1);
        contractRequest.setBookingDate(bookingDate);
        contractRequest.setBookingTime(BookingTime.SLOT_1);
        contractRequest.setExpectedTables(10);
        contractRequest.setExpectedGuests(100);
        contractRequest.setAssignCoordinatorId(1);
        contractRequest.setPackageId(1);
        contractRequest.setSetMenuId(1);
        contractRequest.setSalesId(1);
        contractRequest.setPaymentPercent(50);
        contractRequest.setBrideName("Bride Name");
        contractRequest.setBrideAge(25);
        contractRequest.setGroomName("Groom Name");
        contractRequest.setGroomAge(28);

        // Setup Contract Entity
        contract = new Contract();
        contract.setId(1);
        contract.setContractNo("CH-20260426120000001");
        contract.setCustomerId(1);
        contract.setHallId(1);
        contract.setExpectedTables(10);
        contract.setExpectedGuests(100);
        contract.setBookingTime(BookingTime.SLOT_1);
        contract.setStartTime(bookingDate.atTime(6, 0));
        contract.setEndTime(bookingDate.atTime(12, 0));
        contract.setContractState(ContractState.DRAFT);
        contract.setStatus(RecordStatus.active);
        contract.setPaymentPercent(50);
        contract.setBrideName("Bride Name");
        contract.setBrideAge(25);
        contract.setGroomName("Groom Name");
        contract.setGroomAge(28);
        contract.setPackageId(1);
        contract.setSetMenuId(1);
        contract.setSalesId(1);
    }

    @Test
    @DisplayName("Create contract successfully with new customer")
    void testCreateContract_Success() throws Exception {
        // Arrange
        List<MultipartFile> imageFiles = new ArrayList<>();

        when(customerService.createCustomer(any(CustomerRequest.class), anyList()))
                .thenReturn(customerResponse);
        when(hallRepository.findById(1))
                .thenReturn(Optional.of(hall));
        when(hallRepository.existsByIdAndStatus(1, RecordStatus.active))
                .thenReturn(true);
        when(bookingRepository.save(any(Contract.class)))
                .thenReturn(contract);
        when(contractMapper.toResponse(contract))
                .thenReturn(buildContractResponse(contract));
        when(invoiceService.createInvoice(1))
                .thenReturn(null);

        ContractResponse response = contractService.createContract(contractRequest, imageFiles);

        assertNotNull(response);
        assertEquals(1, response.getId());
        assertEquals("NPS-202603162220331228", response.getContractNo());
        assertEquals(ContractState.DRAFT, response.getContractState());
        verify(bookingRepository, times(1)).save(any(Contract.class));
    }

    @Test
    @DisplayName("Create contract - Invalid payment percent")
    void testCreateContract_InvalidPaymentPercent() {
        // Arrange
        contractRequest.setPaymentPercent(0);
        List<MultipartFile> imageFiles = new ArrayList<>();

        // Act & Assert
        AppException exception = assertThrows(AppException.class,
                () -> contractService.createContract(contractRequest, imageFiles));
        assertEquals(ERROR_CODE.BOOKING_INVALID_PAYMENT_PERCENT, exception.getErrorCode());
    }

    @Test
    @DisplayName("Create contract - Hall not found")
    void testCreateContract_HallNotFound() {
        // Arrange
        contractRequest.setHallId(999);
        List<MultipartFile> imageFiles = new ArrayList<>();

        when(hallRepository.existsByIdAndStatus(999, RecordStatus.active))
                .thenReturn(false);

        // Act & Assert
        AppException exception = assertThrows(AppException.class,
                () -> contractService.createContract(contractRequest, imageFiles));
        assertEquals(ERROR_CODE.HALL_NOT_EXISTED, exception.getErrorCode());
    }

    @Test
    @DisplayName("Create contract - Invalid number of guests")
    void testCreateContract_InvalidNumberOfGuests() {
        // Arrange
        contractRequest.setExpectedGuests(600); // Vượt quá sức chứa
        List<MultipartFile> imageFiles = new ArrayList<>();

        when(hallRepository.existsByIdAndStatus(1, RecordStatus.active))
                .thenReturn(true);
        when(hallRepository.findById(1))
                .thenReturn(Optional.of(hall));

        // Act & Assert
        AppException exception = assertThrows(AppException.class,
                () -> contractService.createContract(contractRequest, imageFiles));
        assertEquals(ERROR_CODE.BOOKING_INVALID_NUMBER_OF_GUESTS, exception.getErrorCode());
    }

    @Test
    @DisplayName("Create contract - Invalid number of tables")
    void testCreateContract_InvalidNumberOfTables() {
        // Arrange
        contractRequest.setExpectedTables(5); // Quá ít bàn
        contractRequest.setExpectedGuests(100);
        List<MultipartFile> imageFiles = new ArrayList<>();

        when(hallRepository.existsByIdAndStatus(1, RecordStatus.active))
                .thenReturn(true);
        when(hallRepository.findById(1))
                .thenReturn(Optional.of(hall));

        // Act & Assert
        AppException exception = assertThrows(AppException.class,
                () -> contractService.createContract(contractRequest, imageFiles));
        assertEquals(ERROR_CODE.BOOKING_INVALID_NUMBER_OF_TABLE, exception.getErrorCode());
    }

    @Test
    @DisplayName("Create contract - Booking date too close")
    void testCreateContract_BookingDateTooClose() {
        // Arrange
        contractRequest.setBookingDate(LocalDate.now().plusMonths(2)); // Chỉ 2 tháng
        List<MultipartFile> imageFiles = new ArrayList<>();

        when(hallRepository.existsByIdAndStatus(1, RecordStatus.active))
                .thenReturn(true);

        // Act & Assert
        AppException exception = assertThrows(AppException.class,
                () -> contractService.createContract(contractRequest, imageFiles));
        assertEquals(ERROR_CODE.BOOKING_DATE_TOO_FAR, exception.getErrorCode());
    }

    @Test
    @DisplayName("Update contract successfully")
    void testUpdateContract_Success() throws Exception {
        // Arrange
        ContractRequest updateRequest = new ContractRequest();
        updateRequest.setCustomerId(1);
        updateRequest.setCustomerRequest(customerRequest);
        updateRequest.setHallId(1);
        updateRequest.setBookingDate(bookingDate.plusDays(1));
        updateRequest.setBookingTime(BookingTime.SLOT_2);
        updateRequest.setExpectedTables(12);
        updateRequest.setExpectedGuests(120);

        List<MultipartFile> imageFiles = new ArrayList<>();

        when(bookingRepository.findById(1))
                .thenReturn(Optional.of(contract));
        when(customerService.updateCustomer(anyInt(), any(), anyList()))
                .thenReturn(customerResponse);
        when(hallRepository.existsByIdAndStatus(1, RecordStatus.active))
                .thenReturn(true);
        when(hallRepository.findById(1))
                .thenReturn(Optional.of(hall));
        when(invoiceService.updateInvoiceWhenUpdatingContract(any(), any()))
                .thenReturn(new Invoice.InvoiceData());
        when(bookingRepository.save(any(Contract.class)))
                .thenReturn(contract);
        when(contractMapper.toResponse(contract))
                .thenReturn(buildContractResponse(contract));

        // Act
        ContractResponse response = contractService.updateContract(1, updateRequest, imageFiles);

        // Assert
        assertNotNull(response);
        verify(bookingRepository, times(1)).save(any(Contract.class));
    }

    @Test
    @DisplayName("Get contract by ID successfully")
    void testGetContractById_Success() {
        // Arrange
        Invoice invoice = new Invoice();
        invoice.setId(1);
        invoice.setContractId(1);
        invoice.setStatus(RecordStatus.active);
        invoice.setData(new Invoice.InvoiceData());

        when(bookingRepository.findById(1))
                .thenReturn(Optional.of(contract));
        when(invoiceRepository.findByContractIdAndStatus(1, RecordStatus.active))
                .thenReturn(Optional.of(invoice));
        when(customerService.getCustomerById(1))
                .thenReturn(customerResponse);
        when(contractMapper.toResponse(contract))
                .thenReturn(buildContractResponse(contract));

        // Act
        ContractResponse response = contractService.getContractById(1);

        // Assert
        assertNotNull(response);
        assertEquals(1, response.getId());
        verify(bookingRepository, times(1)).findById(1);
    }

    @Test
    @DisplayName("Get contract by ID - Contract not found")
    void testGetContractById_NotFound() {
        // Arrange
        when(bookingRepository.findById(999))
                .thenReturn(Optional.empty());

        // Act & Assert
        AppException exception = assertThrows(AppException.class,
                () -> contractService.getContractById(999));
        assertEquals(ERROR_CODE.BOOKING_NOT_EXISTED, exception.getErrorCode());
    }

    @Test
    @DisplayName("Search contracts successfully")
    void testSearchContracts_Success() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        ContractFilterRequest filterRequest = new ContractFilterRequest();
        filterRequest.setContractState(ContractState.DRAFT);

        Invoice invoice = new Invoice();
        invoice.setData(new Invoice.InvoiceData());

        Page<Contract> page = new PageImpl<>(List.of(contract), pageable, 1);

        when(bookingRepository.findAll((Example<Contract>) any(), eq(pageable)))
                .thenReturn(page);
        when(invoiceRepository.findByContractIdAndStatus(1, RecordStatus.active))
                .thenReturn(Optional.of(invoice));
        when(customerService.getCustomerById(1))
                .thenReturn(customerResponse);
        when(contractMapper.toResponse(contract))
                .thenReturn(buildContractResponse(contract));

        // Act
        var response = contractService.searchContracts(pageable, filterRequest);

        // Assert
        assertNotNull(response);
        assertEquals(1, response.getContent().size());
    }

    @Test
    @DisplayName("Update contract state to ACTIVE successfully")
    void testUpdateContractState_ToActive_Success() {
        // Arrange
        ContractStatusRequest statusRequest = new ContractStatusRequest();
        statusRequest.setContractId(1);
        statusRequest.setContractState(ContractState.ACTIVE);

        Invoice invoice = new Invoice();
        invoice.setData(new Invoice.InvoiceData());

        when(bookingRepository.findById(1))
                .thenReturn(Optional.of(contract));
        when(invoiceRepository.findByContractIdAndStatus(1, RecordStatus.active))
                .thenReturn(Optional.of(invoice));
        when(customerService.getCustomerById(1))
                .thenReturn(customerResponse);
        when(bookingRepository.save(any(Contract.class)))
                .thenReturn(contract);
        when(contractMapper.toResponse(contract))
                .thenReturn(buildContractResponse(contract));

        // Act
        ContractResponse response = contractService.updateContractState(statusRequest);

        // Assert
        assertNotNull(response);
        verify(bookingRepository, times(1)).save(any(Contract.class));
    }

    @Test
    @DisplayName("Update contract state to LIQUIDATED successfully")
    void testUpdateContractState_ToLiquidated_Success() {
        // Arrange
        contract.setContractState(ContractState.ACTIVE);

        ContractStatusRequest statusRequest = new ContractStatusRequest();
        statusRequest.setContractId(1);
        statusRequest.setContractState(ContractState.LIQUIDATED);

        Invoice invoice = new Invoice();
        invoice.setData(new Invoice.InvoiceData());

        TaskList taskList = new TaskList();
        taskList.setId(1);

        when(bookingRepository.findById(1))
                .thenReturn(Optional.of(contract));
        when(invoiceRepository.findByContractIdAndStatus(1, RecordStatus.active))
                .thenReturn(Optional.of(invoice));
        when(customerService.getCustomerById(1))
                .thenReturn(customerResponse);
        when(taskListRepository.findTaskListByContractIdAndStatus(1, RecordStatus.active))
                .thenReturn(Optional.of(taskList));
        when(tasksRepository.existsByTaskListIdAndStatusAndState(1, RecordStatus.active, TaskState.NOT_COMPLETED))
                .thenReturn(false);
        when(bookingRepository.save(any(Contract.class)))
                .thenReturn(contract);
        when(contractMapper.toResponse(contract))
                .thenReturn(buildContractResponse(contract));

        // Act
        ContractResponse response = contractService.updateContractState(statusRequest);

        // Assert
        assertNotNull(response);
        verify(bookingRepository, times(1)).save(any(Contract.class));
    }

    @Test
    @DisplayName("Update contract state - Invalid state transition")
    void testUpdateContractState_InvalidTransition() {
        // Arrange
        contract.setContractState(ContractState.CANCELLED);

        ContractStatusRequest statusRequest = new ContractStatusRequest();
        statusRequest.setContractId(1);
        statusRequest.setContractState(ContractState.ACTIVE);

        Invoice invoice = new Invoice();
        invoice.setData(new Invoice.InvoiceData());

        when(bookingRepository.findById(1))
                .thenReturn(Optional.of(contract));
        when(invoiceRepository.findByContractIdAndStatus(1, RecordStatus.active))
                .thenReturn(Optional.of(invoice));
        when(customerService.getCustomerById(1))
                .thenReturn(customerResponse);

        // Act & Assert
        AppException exception = assertThrows(AppException.class,
                () -> contractService.updateContractState(statusRequest));
        assertEquals(ERROR_CODE.BOOKING_INVALID_STATE_TRANSITION, exception.getErrorCode());
    }

    @Test
    @DisplayName("Change contract status successfully")
    void testChangeContractStatus_Success() {
        // Arrange
        Invoice invoice = new Invoice();
        invoice.setData(new Invoice.InvoiceData());

        when(bookingRepository.findById(1))
                .thenReturn(Optional.of(contract));
        when(invoiceRepository.findByContractIdAndStatus(1, RecordStatus.active))
                .thenReturn(Optional.of(invoice));
        when(customerService.getCustomerById(1))
                .thenReturn(customerResponse);
        when(bookingRepository.save(any(Contract.class)))
                .thenReturn(contract);
        when(contractMapper.toResponse(contract))
                .thenReturn(buildContractResponse(contract));

        // Act
        ContractResponse response = contractService.changeContractStatus(1);

        // Assert
        assertNotNull(response);
        verify(bookingRepository, times(1)).save(any(Contract.class));
    }

    // Helper methods
    private ContractResponse buildContractResponse(Contract contract) {
        return ContractResponse.builder()
                .id(contract.getId())
                .contractNo(contract.getContractNo())
                .customerId(contract.getCustomerId())
                .expectedTables(contract.getExpectedTables())
                .expectedGuests(contract.getExpectedGuests())
                .bookingDate(contract.getStartTime().toLocalDate())
                .bookingTime(contract.getBookingTime())
                .startTime(contract.getStartTime())
                .endTime(contract.getEndTime())
                .contractState(contract.getContractState())
                .status(contract.getStatus())
                .paymentPercent(contract.getPaymentPercent())
                .brideName(contract.getBrideName())
                .brideAge(contract.getBrideAge())
                .groomName(contract.getGroomName())
                .groomAge(contract.getGroomAge())
                .build();
    }

    private InvoiceResponse buildInvoiceResponse() {
        return new vn.edu.fpt.dto.response.invoice.InvoiceResponse();
    }
}

