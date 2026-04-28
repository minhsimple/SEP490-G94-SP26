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

    @Override
    public AdminDashBoardResponse getAdminDashBoard(AdminDashBoardRequest request) {
        LocalDateTime fromDateTime = request.getFromDate().atStartOfDay();
        LocalDateTime toDateTime = request.getToDate().atTime(23, 59, 59);

        // Get invoices in date range for selected locations
        List<Invoice> invoices = invoiceRepository.findAllByLocationIdsAndCreatedAtBetween(
                request.getLocationIds(),
                fromDateTime,
                toDateTime
        );

        // Get all contracts in date range for selected locations
        List<Hall> halls = hallRepository.findAllByLocationIdIn(request.getLocationIds());
        Set<Integer> hallIds = halls.stream().map(Hall::getId).collect(Collectors.toSet());

        List<Contract> contracts = contractRepository.findAllByHallIdInAndCreatedAtBetween(
                hallIds,
                fromDateTime,
                toDateTime
        );

        // Get all payments for these contracts
        Set<Integer> contractIds = contracts.stream().map(Contract::getId).collect(Collectors.toSet());
        List<Payment> allPayments = paymentRepository.findAllByContractIdIn(contractIds);

        // Build response
        AdminDashBoardResponse response = new AdminDashBoardResponse();
        response.setPeriod(request.getFromDate() + " - " + request.getToDate());

        // Summary data
        AdminDashBoardResponse.Summary summary = buildSummary(
                invoices,
                contracts,
                allPayments,
                halls
        );
        response.setSummary(summary);

        // Center data (grouped by location)
        List<AdminDashBoardResponse.Center> centers = buildCentersList(
                request.getLocationIds(),
                invoices,
                contracts,
                allPayments,
                halls
        );
        response.setCenters(centers);

        return response;
    }

    private AdminDashBoardResponse.Summary buildSummary(
            List<Invoice> invoices,
            List<Contract> contracts,
            List<Payment> allPayments,
            List<Hall> halls) {

        // Tạo Financial
        BigDecimal totalRevenue = allPayments.stream()
                .filter(p -> p.getPaymentState() == PaymentState.SUCCESS)
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

//        Map<Integer, BigDecimal> paidByContract = allPayments.stream()
//                .filter(p -> p.getPaymentState() == PaymentState.SUCCESS)
//                .collect(Collectors.groupingBy(
//                        Payment::getContractId,
//                        Collectors.mapping(
//                                Payment::getAmount,
//                                Collectors.reducing(BigDecimal.ZERO, BigDecimal::add)
//                        )
//                ));
//
//
//        BigDecimal totalDebt = invoices.stream()
//                .map(i -> {
//                    BigDecimal paid = paidByContract.getOrDefault(i.getContractId(), BigDecimal.ZERO);
//                    return i.getTotalAmount().subtract(paid);
//                })
//                .filter(debt -> debt.compareTo(BigDecimal.ZERO) > 0)
//                .reduce(BigDecimal.ZERO, BigDecimal::add);

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
        Integer totalRooms = halls.size();
        Long occupiedRooms = contracts.stream()
                .filter(c -> c.getContractState() == ContractState.ACTIVE)
                .map(Contract::getHallId)
                .distinct()
                .count();
        Integer availableRooms = (int) (totalRooms - occupiedRooms);
        Double occupancyRate = totalRooms > 0 ? (occupiedRooms.doubleValue() / totalRooms * 100) : 0.0;

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
                .totalRooms(totalRooms)
                .occupiedRooms(occupiedRooms.intValue())
                .availableRooms(availableRooms)
                .occupancyRate(occupancyRate)
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

        // Customer
        Long newCustomers = contracts.stream()
                .map(Contract::getCustomerId)
                .distinct()
                .count();
        Long totalActiveResidents = contracts.stream()
                .filter(c -> c.getContractState() == ContractState.ACTIVE)
                .map(Contract::getCustomerId)
                .distinct()
                .count();

        AdminDashBoardResponse.Customer customer = AdminDashBoardResponse.Customer.builder()
                .newCustomers(newCustomers.intValue())
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
            List<Hall> halls) {

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
            List<Invoice> locationInvoices = invoices.stream()
                    .filter(inv -> locationHallIds.contains(inv.getId()))
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

            AdminDashBoardResponse.Customer centerCustomer = buildCenterCustomer(locationContracts);

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

        int totalRooms = halls.size();
        long occupiedRooms = contracts.stream()
                .filter(c -> c.getContractState() == ContractState.ACTIVE
                        || c.getContractState() == ContractState.LIQUIDATED)
                .map(Contract::getHallId)
                .distinct()
                .count();

        return AdminDashBoardResponse.Business.builder()
                .totalRooms(totalRooms)
                .occupiedRooms((int) occupiedRooms)
                .availableRooms(totalRooms - (int) occupiedRooms)
                .occupancyRate(totalRooms > 0 ? ((double) occupiedRooms / totalRooms * 100) : 0.0)
                .newContracts((int) contracts.stream()
                        .filter(c -> c.getContractState() == ContractState.ACTIVE).count())
                .expiringContracts((int) contracts.stream()
                        .filter(c -> c.getContractState() == ContractState.ACTIVE).count())
                .liquidatedContracts((int) contracts.stream()
                        .filter(c -> c.getContractState() == ContractState.LIQUIDATED).count())
                .build();
    }

    private AdminDashBoardResponse.Customer buildCenterCustomer(List<Contract> contracts) {
        return AdminDashBoardResponse.Customer.builder()
                .newCustomers((int) contracts.stream()
                        .map(Contract::getCustomerId)
                        .distinct()
                        .count())
                .totalActiveResidents((int) contracts.stream()
                        .filter(c -> c.getContractState() == ContractState.ACTIVE)
                        .map(Contract::getCustomerId)
                        .distinct()
                        .count())
                .build();
    }
}
