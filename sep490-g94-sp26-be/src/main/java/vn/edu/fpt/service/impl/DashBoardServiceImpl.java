package vn.edu.fpt.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.edu.fpt.dto.request.dashboard.AdminDashBoardRequest;
import vn.edu.fpt.dto.response.dashboard.AdminDashBoardResponse;
import vn.edu.fpt.entity.*;
import vn.edu.fpt.exception.AppException;
import vn.edu.fpt.exception.ERROR_CODE;
import vn.edu.fpt.respository.*;
import vn.edu.fpt.service.DashBoardService;
import vn.edu.fpt.util.enums.ContractState;
import vn.edu.fpt.util.enums.PaymentState;
import vn.edu.fpt.util.enums.RecordStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashBoardServiceImpl implements DashBoardService {

    private final InvoiceRepository invoiceRepository;
    private final ContractRepository contractRepository;
    private final HallRepository hallRepository;
    private final PaymentRepository paymentRepository;
    private final LocationRepository locationRepository;
    private final CustomerRepository customerRepository;

    @Override
    public AdminDashBoardResponse getAdminDashBoard(AdminDashBoardRequest request) {
        LocalDateTime fromDateTime = request.getFromDate().atStartOfDay();
        LocalDateTime toDateTime = request.getToDate().atTime(23, 59, 59);

        List<Integer> locationIds = request.getLocationIds();
        if (locationIds == null || locationIds.isEmpty()) {
            locationIds = locationRepository.findAllByStatus(RecordStatus.active).stream()
                    .map(Location::getId)
                    .toList();
        }
        List<Hall> halls = hallRepository.findAllByLocationIdIn(locationIds);


        Set<Integer> hallIds = halls.stream().map(Hall::getId).collect(Collectors.toSet());

        List<Contract> contracts = contractRepository.findAllByHallIdInAndCreatedAtBetween(
                hallIds,
                fromDateTime,
                toDateTime
        );
        Set<Integer> contractIds = contracts.stream().map(Contract::getId).collect(Collectors.toSet());


        List<Invoice> invoices = invoiceRepository.findAllByContractIdAndCreatedAtBetween(
                contractIds,
                fromDateTime,
                toDateTime
        );

        // Get all payments for these contracts
        List<Payment> allPayments = paymentRepository.findAllByContractIdIn(contractIds);

        // Build response
        AdminDashBoardResponse response = new AdminDashBoardResponse();
        response.setPeriod(request.getFromDate() + " - " + request.getToDate());

        // Summary data
        AdminDashBoardResponse.Summary summary = buildSummary(
                invoices,
                contracts,
                allPayments,
                halls,
                fromDateTime,
                toDateTime
        );
        response.setSummary(summary);

        // Center data (grouped by location)
        List<AdminDashBoardResponse.Center> centers = buildCentersList(
                locationIds,
                invoices,
                contracts,
                allPayments,
                halls,
                fromDateTime,
                toDateTime
        );
        response.setCenters(centers);

        return response;
    }

    private AdminDashBoardResponse.Summary buildSummary(
            List<Invoice> invoices,
            List<Contract> contracts,
            List<Payment> allPayments,
            List<Hall> halls,
            LocalDateTime fromDateTime,
            LocalDateTime toDateTime) {

        // Tạo Financial
        BigDecimal totalRevenue = allPayments.stream()
                .filter(p -> p.getPaymentState() == PaymentState.SUCCESS)
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal expectedRevenue = invoices.stream()
                .map(i -> i.getTotalAmount() != null ? i.getTotalAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Double collectionRate = expectedRevenue.compareTo(BigDecimal.ZERO) > 0
                ? (totalRevenue.doubleValue() / expectedRevenue.doubleValue() * 100)
                : 0.0;

        AdminDashBoardResponse.Financial financial = AdminDashBoardResponse.Financial.builder()
                .totalRevenue(totalRevenue)
                .expectedRevenue(expectedRevenue)
                .collectionRate(collectionRate)
                .build();

        //Tạo Business

        Long newContracts = contracts.stream()
                .filter(c -> c.getContractState() == ContractState.ACTIVE)
                .count();
        Long expiringContracts = contracts.stream()
                .filter(c -> c.getContractState() == ContractState.ACTIVE)
                .count();
        Long liquidatedContracts = contracts.stream()
                .filter(c -> c.getContractState() == ContractState.LIQUIDATED)
                .count();

        AdminDashBoardResponse.Business business = AdminDashBoardResponse.Business.builder()
                .newContracts(newContracts.intValue())
                .expiringContracts(expiringContracts.intValue())
                .liquidatedContracts(liquidatedContracts.intValue())
                .build();

        List<Invoice.IncidentInvoice> allIncidents = invoices.stream()
                .flatMap(inv -> inv.getData().getIncidents().stream())
                .toList();

        Integer totalIncidents = allIncidents.size();

        AdminDashBoardResponse.Operation operation = AdminDashBoardResponse.Operation.builder()
                .totalIncidents(totalIncidents)
                .build();


        Map<Integer, List<Contract>> contractsByCustomer = contracts.stream()
                .collect(Collectors.groupingBy(Contract::getCustomerId));

        long newCustomers = contractsByCustomer.values().stream()
                .map(customerContracts -> customerContracts.stream()
                        .min(Comparator.comparing(Contract::getCreatedAt))
                        .orElse(null))
                .filter(firstContract -> firstContract != null &&
                        !firstContract.getCreatedAt().isBefore(fromDateTime) &&
                        !firstContract.getCreatedAt().isAfter(toDateTime))
                .count();

        Long totalActiveResidents = contracts.stream()
                .filter(c -> c.getContractState() == ContractState.ACTIVE)
                .map(Contract::getCustomerId)
                .distinct()
                .count();

        AdminDashBoardResponse.Customer customer = AdminDashBoardResponse.Customer.builder()
                .newCustomers((int) newCustomers)
                .totalActiveResidents(totalActiveResidents.intValue())
                .build();

        return AdminDashBoardResponse.Summary.builder()
                .financial(financial)
                .business(business)
                .operation(operation)
                .customer(customer)
                .build();
    }

    private List<AdminDashBoardResponse.Center> buildCentersList(
            List<Integer> locationIds,
            List<Invoice> invoices,
            List<Contract> contracts,
            List<Payment> allPayments,
            List<Hall> halls,
            LocalDateTime fromDateTime,
            LocalDateTime toDateTime) {

        List<AdminDashBoardResponse.Center> centers = new ArrayList<>();

        for (Integer locationId : locationIds) {
            List<Hall> locationHalls = halls.stream()
                    .filter(h -> h.getLocationId().equals(locationId))
                    .toList();

            Location location = locationRepository.findByIdAndStatus(locationId, RecordStatus.active)
                    .orElseThrow(() -> new AppException(ERROR_CODE.LOCATION_NOT_FOUND));
            Set<Integer> locationHallIds = locationHalls.stream()
                    .map(Hall::getId)
                    .collect(Collectors.toSet());

            // Filter data for this location
            Map<Integer, Contract> contractMap = contracts.stream()
                    .collect(Collectors.toMap(Contract::getId, c -> c));

            List<Invoice> locationInvoices = invoices.stream()
                    .filter(inv -> {
                        Contract c = contractMap.get(inv.getContractId());
                        return c != null && locationHallIds.contains(c.getHallId());
                    })
                    .toList();

            List<Contract> locationContracts = contracts.stream()
                    .filter(c -> locationHallIds.contains(c.getHallId()))
                    .toList();

            // Filter payments for this location
            List<Payment> locationPayments = allPayments.stream()
                    .filter(p -> locationContracts.stream()
                            .anyMatch(c -> c.getId().equals(p.getContractId())))
                    .toList();

            // Build center data similar to summary
            AdminDashBoardResponse.Financial centerFinancial = buildCenterFinancial(
                    locationInvoices,
                    locationPayments
            );

            AdminDashBoardResponse.Business centerBusiness = buildCenterBusiness(
                    locationContracts,
                    locationHalls
            );

            // Get incidents from location invoices only
            List<Invoice.IncidentInvoice> locationIncidents = locationInvoices.stream()
                    .flatMap(inv -> inv.getData().getIncidents().stream())
                    .toList();

            Integer totalIncidents = locationIncidents.size();

            AdminDashBoardResponse.Operation centerOperation = AdminDashBoardResponse.Operation.builder()
                    .totalIncidents(totalIncidents)
                    .build();

            AdminDashBoardResponse.Customer centerCustomer = buildCenterCustomer(locationContracts, fromDateTime, toDateTime);

            AdminDashBoardResponse.Center center = AdminDashBoardResponse.Center.builder()
                    .centerId(locationId)
                    .centerName(location.getName())
                    .financial(centerFinancial)
                    .business(centerBusiness)
                    .operation(centerOperation)
                    .customer(centerCustomer)
                    .build();

            centers.add(center);
        }

        return centers;
    }

    private AdminDashBoardResponse.Financial buildCenterFinancial(
            List<Invoice> invoices,
            List<Payment> locationPayments) {

        BigDecimal totalRevenue = locationPayments.stream()
                .filter(p -> p.getPaymentState() == PaymentState.SUCCESS)
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal expectedRevenue = invoices.stream()
                .map(i -> i.getTotalAmount() != null ? i.getTotalAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Double collectionRate = expectedRevenue.compareTo(BigDecimal.ZERO) > 0
                ? (totalRevenue.doubleValue() / expectedRevenue.doubleValue() * 100)
                : 0.0;

        return AdminDashBoardResponse.Financial.builder()
                .totalRevenue(totalRevenue)
                .expectedRevenue(expectedRevenue)
                .collectionRate(collectionRate)
                .build();
    }

    private AdminDashBoardResponse.Business buildCenterBusiness(
            List<Contract> contracts,
            List<Hall> halls) {


        return AdminDashBoardResponse.Business.builder()
                .newContracts((int) contracts.stream()
                        .filter(c -> c.getContractState() == ContractState.ACTIVE).count())
                .expiringContracts((int) contracts.stream()
                        .filter(c -> c.getContractState() == ContractState.ACTIVE).count())
                .liquidatedContracts((int) contracts.stream()
                        .filter(c -> c.getContractState() == ContractState.LIQUIDATED).count())
                .build();
    }

    private AdminDashBoardResponse.Customer buildCenterCustomer(
            List<Contract> contracts,
            LocalDateTime fromDateTime,
            LocalDateTime toDateTime) {

        Map<Integer, List<Contract>> contractsByCustomer = contracts.stream()
                .collect(Collectors.groupingBy(Contract::getCustomerId));


        long newCustomers = contractsByCustomer.values().stream()

                .map(customerContracts -> customerContracts.stream()
                        .min(Comparator.comparing(Contract::getCreatedAt))
                        .orElse(null))

                .filter(firstContract -> firstContract != null &&
                        !firstContract.getCreatedAt().isBefore(fromDateTime) &&
                        !firstContract.getCreatedAt().isAfter(toDateTime))

                .count();

        long totalActiveResidents = contracts.stream()
                .filter(c -> c.getContractState() == ContractState.ACTIVE)
                .map(Contract::getCustomerId)
                .distinct()
                .count();


        return AdminDashBoardResponse.Customer.builder()
                .newCustomers((int) newCustomers)
                .totalActiveResidents((int) totalActiveResidents)
                .build();
    }
}
