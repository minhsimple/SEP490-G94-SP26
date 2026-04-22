package vn.edu.fpt.service.impl;

import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.fpt.dto.SimplePage;
import vn.edu.fpt.dto.request.contract.ContractRequest;
import vn.edu.fpt.dto.request.invoice.InvoiceFilterRequest;
import vn.edu.fpt.dto.request.payment.PaymentRequest;
import vn.edu.fpt.dto.response.invoice.InvoiceResponse;
import vn.edu.fpt.entity.*;
import vn.edu.fpt.exception.AppException;
import vn.edu.fpt.exception.ERROR_CODE;
import vn.edu.fpt.respository.*;
import vn.edu.fpt.service.InvoiceService;
import vn.edu.fpt.service.PaymentService;
import vn.edu.fpt.util.enums.*;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvoiceServiceImpl implements InvoiceService {
    private final InvoiceRepository invoiceRepository;
    private final ContractRepository contractRepository;
    private final HallRepository hallRepository;
    private final SetMenuRepository setMenuRepository;
    private final ServicePackageRepository servicePackageRepository;
    private final MenuItemRepository menuItemRepository;
    private final SetMenuItemRepository setMenuItemRepository;
    private final CategoryMenuItemRepository categoryMenuItemRepository;
    private final PackageServiceRepository packageServiceRepository;
    private final ServiceItemRepository serviceItemRepository;
    private final PaymentRepository paymentRepository;

    private final PaymentService paymentService;

    @Override
    public InvoiceResponse createInvoice(Integer contractId) {
        Contract contract = contractRepository.findByIdAndStatus(contractId, RecordStatus.active)
                .orElseThrow(() -> new AppException(ERROR_CODE.BOOKING_NOT_EXISTED));

        SetMenu setMenu = setMenuRepository.findSetMenuByIdAndStatus(contract.getSetMenuId(), RecordStatus.active)
                .orElseThrow(() -> new AppException(ERROR_CODE.SET_MENU_NOT_EXISTED));

        Hall hall = hallRepository.findByIdAndStatus(contract.getHallId(), RecordStatus.active)
                .orElseThrow(() -> new AppException(ERROR_CODE.HALL_NOT_EXISTED));

        ServicePackage servicePackage = servicePackageRepository.findByIdAndStatus(contract.getPackageId(), RecordStatus.active)
                .orElseThrow(() -> new AppException(ERROR_CODE.SERVICE_PACKAGE_NOT_FOUND));

        Invoice invoice = new Invoice();
        invoice.setContractId(contractId);
        invoice.setInvoiceState(InvoiceState.UNPAID);

        Invoice.InvoiceData invoiceData = generateInitialInvoiceData(setMenu, hall, servicePackage);

        BigDecimal totalAmount = calculateTotalAmountForInvoice(invoiceData, contract.getExpectedTables());

        invoice.setTotalAmount(totalAmount);
        invoice.setData(invoiceData);
        Invoice savedInvoice = invoiceRepository.save(invoice);

        return mapToInvoiceResponse(savedInvoice, contract);
    }

    @Override
    public InvoiceResponse getInvoiceById(Integer id) {
        Invoice invoice = invoiceRepository.findByIdAndStatus(id, RecordStatus.active)
                .orElseThrow(() -> new AppException(ERROR_CODE.INVOICE_NOT_FOUND));

        Contract contract = contractRepository.findById(invoice.getContractId())
                .orElseThrow(() -> new AppException(ERROR_CODE.BOOKING_NOT_EXISTED));

        return mapToInvoiceResponse(invoice, contract);
    }

    @Transactional
    @Override
    public Invoice.InvoiceData updateInvoiceWhenUpdatingContract(Contract contract, ContractRequest contractRequest) {
        Invoice invoice = invoiceRepository.findByContractIdAndStatus(contract.getId(), RecordStatus.active)
                .orElseThrow(() -> new AppException(ERROR_CODE.INVOICE_NOT_FOUND));
        Invoice.InvoiceData invoiceData = invoice.getData();

        if (contractRequest.getHallId() != null && !contractRequest.getHallId().equals(contract.getHallId())) {
            Hall hall = hallRepository.findByIdAndStatus(contractRequest.getHallId(), RecordStatus.active)
                    .orElseThrow(() -> new AppException(ERROR_CODE.HALL_NOT_EXISTED));
            Invoice.HallInvoice hallInvoice = new Invoice.HallInvoice(hall.getId(), hall.getCode(), hall.getName(), hall.getBasePrice());
            invoiceData.setHallInvoice(hallInvoice);
        }
        if (contractRequest.getSetMenuId() != null && !contractRequest.getSetMenuId().equals(contract.getSetMenuId())) {
            SetMenu setMenu = setMenuRepository.findSetMenuByIdAndStatus(contractRequest.getSetMenuId(), RecordStatus.active)
                    .orElseThrow(() -> new AppException(ERROR_CODE.SET_MENU_NOT_EXISTED));
            List<SetMenuItem> setMenuItemList = setMenuItemRepository.findAllBySetMenuIdAndStatus(setMenu.getId(), RecordStatus.active);
            Set<Integer> menuItemIds = setMenuItemList.stream()
                    .map(SetMenuItem::getMenuItemId)
                    .collect(Collectors.toSet());
            List<MenuItem> menuItemList = menuItemRepository.findAllByIdInAndStatus(menuItemIds, RecordStatus.active);

            Set<Integer> categoryMenuItemIds = menuItemList.stream()
                    .map(MenuItem::getCategoryMenuItemsId)
                    .collect(Collectors.toSet());
            Map<Integer, String> categoryMenuItemNameMap = categoryMenuItemRepository.findAllByIdIn(categoryMenuItemIds).stream()
                    .collect(Collectors.toMap(CategoryMenuItem::getId, CategoryMenuItem::getName));

            List<Invoice.MenuItemInvoice> menuItemInvoices = menuItemList.stream()
                    .map(menuItem -> {
                        Invoice.MenuItemInvoice menuItemInvoice = new Invoice.MenuItemInvoice();
                        menuItemInvoice.setId(menuItem.getId());
                        menuItemInvoice.setCode(menuItem.getCode());
                        menuItemInvoice.setName(menuItem.getName());
                        menuItemInvoice.setPrice(menuItem.getUnitPrice());
                        menuItemInvoice.setUnit(menuItem.getUnit());
                        menuItemInvoice.setCategoryName(categoryMenuItemNameMap.getOrDefault(menuItem.getCategoryMenuItemsId(), null));
                        menuItemInvoice.setQuantity(setMenuItemList.stream()
                                .filter(setMenuItem -> Objects.equals(setMenuItem.getMenuItemId(), menuItem.getId()))
                                .findFirst()
                                .map(SetMenuItem::getQuantity)
                                .orElse(0));
                        return menuItemInvoice;
                    }).toList();

            Invoice.SetMenuInvoice setMenuInvoice = new Invoice.SetMenuInvoice();
            setMenuInvoice.setId(contractRequest.getSetMenuId());
            setMenuInvoice.setCode(setMenu.getCode());
            setMenuInvoice.setName(setMenu.getName());
            setMenuInvoice.setPrice(SetMenuServiceImpl.calculateSetPrice(setMenuItemList, menuItemList));
            setMenuInvoice.setMenuItems(menuItemInvoices);

            invoiceData.setSetMenuInvoice(setMenuInvoice);
        }
        if (contractRequest.getPackageId() != null && !contractRequest.getPackageId().equals(contract.getPackageId())) {
            ServicePackage servicePackage = servicePackageRepository.findByIdAndStatus(contractRequest.getPackageId(), RecordStatus.active)
                    .orElseThrow(() -> new AppException(ERROR_CODE.SERVICE_PACKAGE_NOT_FOUND));
            List<Integer> serviceIds = packageServiceRepository.findByPackageIdAndStatus(servicePackage.getId(), RecordStatus.active)
                    .stream()
                    .map(PackageService::getServiceId)
                    .toList();
            List<Invoice.ServiceInvoice> services = serviceItemRepository.findAllByIdInAndStatus(serviceIds, RecordStatus.active).stream()
                    .map(service -> new Invoice.ServiceInvoice(service.getId(), service.getCode(), service.getName(), service.getBasePrice(), service.getUnit()))
                    .toList();

            Invoice.ServicePackageInvoice servicePackageInvoice = new Invoice.ServicePackageInvoice();
            servicePackageInvoice.setId(servicePackage.getId());
            servicePackageInvoice.setCode(servicePackage.getCode());
            servicePackageInvoice.setName(servicePackage.getName());
            servicePackageInvoice.setPrice(servicePackage.getBasePrice());
            servicePackageInvoice.setServices(services);

            invoiceData.setServicePackageInvoice(servicePackageInvoice);
        }
        invoice.setData(invoiceData);
        invoice.setTotalAmount(calculateTotalAmountForInvoice(invoiceData, contractRequest.getExpectedTables()));

        return invoiceData;
    }

    @Override
    public List<Invoice.IncidentInvoice> getIncidentInvoices(Integer contractId) {
        Invoice invoice = invoiceRepository.findByContractIdAndStatus(contractId, RecordStatus.active)
                .orElseThrow(() -> new AppException(ERROR_CODE.INVOICE_NOT_FOUND));
        return invoice.getData().getIncidents();
    }

    @Transactional
    @Override
    public List<Invoice.IncidentInvoice> updateIncidentInvoices(Integer contractId, List<Invoice.IncidentInvoice> incidents) {
        Invoice invoice = invoiceRepository.findByContractIdAndStatus(contractId, RecordStatus.active)
                .orElseThrow(() -> new AppException(ERROR_CODE.INVOICE_NOT_FOUND));
        invoice.getData().setIncidents(incidents);
        return invoice.getData().getIncidents();
    }

    @Override
    public SimplePage<InvoiceResponse> getAllInvoices(Pageable pageable, InvoiceFilterRequest filterRequest) {
        Specification<Invoice> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (filterRequest.getContractId() != null) {
                predicates.add(cb.equal(
                        root.get("contractId"),
                        filterRequest.getContractId()
                ));
            }
            if (filterRequest.getInvoiceState() != null) {
                predicates.add(cb.equal(root.get("invoiceState"), filterRequest.getInvoiceState()));
            }
            if (filterRequest.getUpperBoundTotalAmount() != null && filterRequest.getLowerBoundTotalAmount() != null) {
                predicates.add(
                        cb.between(root.get("totalAmount"), filterRequest.getLowerBoundTotalAmount(), filterRequest.getUpperBoundTotalAmount())
                );
            } else if (filterRequest.getUpperBoundTotalAmount() != null) {
                predicates.add(
                        cb.lessThanOrEqualTo(root.get("totalAmount"), filterRequest.getUpperBoundTotalAmount())
                );
            } else if (filterRequest.getLowerBoundTotalAmount() != null) {
                predicates.add(
                        cb.greaterThanOrEqualTo(root.get("totalAmount"), filterRequest.getLowerBoundTotalAmount())
                );
            }
            if (filterRequest.getStatus() != null) {
                predicates.add(cb.equal(root.get("status"), filterRequest.getStatus()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
        Page<Invoice> invoicePage = invoiceRepository.findAll(spec, pageable);
        List<Invoice> invoiceList = invoicePage.getContent();

        Set<Integer> contractsIds = invoiceList.stream()
                .map(Invoice::getContractId)
                .collect(Collectors.toSet());
        List<Contract> contractList = contractRepository.findAllByIdIn(contractsIds);
        Map<Integer, Contract> mapContract = contractList.stream()
                .collect(Collectors.toMap(Contract::getId, contract -> contract));

        List<InvoiceResponse> invoiceResponseList = invoiceList.stream()
                .map(invoice -> mapToInvoiceResponse(invoice,
                        mapContract.getOrDefault(invoice.getContractId(), new Contract())))
                .toList();

        return new SimplePage<>(
                invoiceResponseList,
                invoicePage.getTotalElements(),
                pageable
        );
    }

    @Override
    public InvoiceResponse liquidateInvoice(Integer id) {
        Invoice invoice = invoiceRepository.findByIdAndStatus(id, RecordStatus.active)
                .orElseThrow(() -> new AppException(ERROR_CODE.INVOICE_NOT_FOUND));
        Contract contract = contractRepository.findByIdAndStatus(invoice.getContractId(), RecordStatus.active)
                .orElseThrow(() -> new AppException(ERROR_CODE.BOOKING_NOT_EXISTED));

        List<Payment> paymentList = paymentRepository.findByContractIdAndStatus(invoice.getContractId(), RecordStatus.active, Pageable.unpaged())
                .getContent();

        boolean isContractDraft = contract.getContractState() == ContractState.DRAFT;
        boolean isContractCancelled = contract.getContractState() == ContractState.CANCELLED;

        if (paymentList.size() > 1 || isContractDraft || isContractCancelled ) {
            throw new AppException(ERROR_CODE.INVOICE_LIQUIDATE_INVALID);
        }

        BigDecimal amount = invoice.getTotalAmount().subtract(paymentList.getFirst().getAmount());

        PaymentRequest paymentRequest = PaymentRequest.builder()
                .contractId(contract.getId())
                .amount(amount)
                .method(PaymentMethod.BANK_TRANSFER)
                .paymentState(PaymentState.PENDING)
                .note("Thanh toán đợt 2")
                .build();

        paymentService.createPayment(paymentRequest);

        return mapToInvoiceResponse(invoice, contract);
    }

    private Invoice.InvoiceData generateInitialInvoiceData(SetMenu setMenu, Hall hall, ServicePackage servicePackage) {
        List<Integer> serviceIds = packageServiceRepository.findByPackageIdAndStatus(servicePackage.getId(), RecordStatus.active)
                .stream()
                .map(PackageService::getServiceId)
                .toList();
        List<Invoice.ServiceInvoice> services = serviceItemRepository.findAllByIdInAndStatus(serviceIds, RecordStatus.active).stream()
                .map(service -> new Invoice.ServiceInvoice(service.getId(), service.getCode(), service.getName(), service.getBasePrice(), service.getUnit()))
                .toList();

        List<SetMenuItem> setMenuItemList = setMenuItemRepository.findAllBySetMenuIdAndStatus(setMenu.getId(), RecordStatus.active);
        Set<Integer> menuItemIds = setMenuItemList.stream()
                .map(SetMenuItem::getMenuItemId)
                .collect(Collectors.toSet());
        List<MenuItem> menuItemList = menuItemRepository.findAllByIdInAndStatus(menuItemIds, RecordStatus.active);

        Set<Integer> categoryMenuItemIds = menuItemList.stream()
                .map(MenuItem::getCategoryMenuItemsId)
                .collect(Collectors.toSet());
        Map<Integer, String> categoryMenuItemNameMap = categoryMenuItemRepository.findAllByIdIn(categoryMenuItemIds).stream()
                .collect(Collectors.toMap(CategoryMenuItem::getId, CategoryMenuItem::getName));

        Invoice.InvoiceData data = new Invoice.InvoiceData();
        data.setHallInvoice(new Invoice.HallInvoice(hall.getId(), hall.getCode(), hall.getName(), hall.getBasePrice()));

        List<Invoice.MenuItemInvoice> menuItemInvoices = menuItemList.stream()
                .map(menuItem -> {
                    Invoice.MenuItemInvoice menuItemInvoice = new Invoice.MenuItemInvoice();
                    menuItemInvoice.setId(menuItem.getId());
                    menuItemInvoice.setCode(menuItem.getCode());
                    menuItemInvoice.setName(menuItem.getName());
                    menuItemInvoice.setPrice(menuItem.getUnitPrice());
                    menuItemInvoice.setUnit(menuItem.getUnit());
                    menuItemInvoice.setCategoryName(categoryMenuItemNameMap.getOrDefault(menuItem.getCategoryMenuItemsId(), null));
                    menuItemInvoice.setQuantity(setMenuItemList.stream()
                            .filter(setMenuItem -> Objects.equals(setMenuItem.getMenuItemId(), menuItem.getId()))
                            .findFirst()
                            .map(SetMenuItem::getQuantity)
                            .orElse(0));
                    return menuItemInvoice;
                }).toList();

        Invoice.SetMenuInvoice setMenuInvoice = new Invoice.SetMenuInvoice();
        setMenuInvoice.setId(setMenu.getId());
        setMenuInvoice.setCode(setMenu.getCode());
        setMenuInvoice.setName(setMenu.getName());
        setMenuInvoice.setPrice(SetMenuServiceImpl.calculateSetPrice(setMenuItemList, menuItemList));
        setMenuInvoice.setMenuItems(menuItemInvoices);

        data.setSetMenuInvoice(setMenuInvoice);

        Invoice.ServicePackageInvoice servicePackageInvoice = new Invoice.ServicePackageInvoice();
        servicePackageInvoice.setId(servicePackage.getId());
        servicePackageInvoice.setCode(servicePackage.getCode());
        servicePackageInvoice.setName(servicePackage.getName());
        servicePackageInvoice.setPrice(servicePackage.getBasePrice());
        servicePackageInvoice.setServices(services);

        data.setServicePackageInvoice(servicePackageInvoice);

        return data;
    }

    private BigDecimal calculateTotalAmountForInvoice(Invoice.InvoiceData invoiceData, Integer expectedTables) {
        BigDecimal totalAmount = BigDecimal.ZERO;
        if (invoiceData.getHallInvoice() != null) {
            totalAmount = totalAmount.add(invoiceData.getHallInvoice().getPrice());
        }
        if (invoiceData.getSetMenuInvoice() != null) {
            totalAmount = totalAmount.add(invoiceData.getSetMenuInvoice().getPrice().multiply(BigDecimal.valueOf(expectedTables)));
        }
        if (invoiceData.getServicePackageInvoice() != null) {
            totalAmount = totalAmount.add(invoiceData.getServicePackageInvoice().getPrice());
        }
        if (!invoiceData.getIncidents().isEmpty()) {
            totalAmount = invoiceData.getIncidents().stream()
                    .map(Invoice.IncidentInvoice::getPrice)
                    .reduce(totalAmount, BigDecimal::add);
        }

        return totalAmount;
    }

    private InvoiceResponse mapToInvoiceResponse(Invoice invoice, Contract contract) {
        InvoiceResponse invoiceResponse = new InvoiceResponse();

        invoiceResponse.setId(invoice.getId());
        invoiceResponse.setContractId(invoice.getContractId());
        invoiceResponse.setContractNo(contract.getContractNo());
        invoiceResponse.setExpectedTables(contract.getExpectedTables());
        invoiceResponse.setInvoiceState(invoice.getInvoiceState());
        invoiceResponse.setTotalAmount(invoice.getTotalAmount());
        invoiceResponse.setData(invoice.getData());
        return invoiceResponse;
    }
}
