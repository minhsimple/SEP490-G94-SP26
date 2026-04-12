package vn.edu.fpt.service.impl;

import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.fpt.dto.SimplePage;
import vn.edu.fpt.dto.request.payment.PaymentRequest;
import vn.edu.fpt.dto.request.task.TaskListCreateRequest;
import vn.edu.fpt.dto.response.payment.PaymentResponse;
import vn.edu.fpt.entity.Contract;
import vn.edu.fpt.entity.Invoice;
import vn.edu.fpt.entity.Payment;
import vn.edu.fpt.exception.AppException;
import vn.edu.fpt.exception.ERROR_CODE;
import vn.edu.fpt.mapper.PaymentMapper;
import vn.edu.fpt.respository.ContractRepository;
import vn.edu.fpt.respository.InvoiceRepository;
import vn.edu.fpt.respository.PaymentRepository;
import vn.edu.fpt.respository.TaskListRepository;
import vn.edu.fpt.service.PaymentService;
import vn.edu.fpt.service.TaskListService;
import vn.edu.fpt.util.enums.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {
    private final PaymentRepository paymentRepository;
    private final PaymentMapper paymentMapper;
    private final ContractRepository contractRepository;
    private final InvoiceRepository invoiceRepository;
    private final TaskListRepository taskListRepository;
    private final TaskListService taskListService;

    @Override
    @Transactional
    public PaymentResponse createPayment(PaymentRequest request) {
        Payment payment = paymentMapper.toEntity(request);
        payment.setPaymentState(request.getPaymentState() != null ? request.getPaymentState() : PaymentState.PENDING);
        Payment savedPayment = paymentRepository.save(payment);
        return paymentMapper.toResponse(savedPayment);
    }


    @Override
    @Transactional
    public PaymentResponse updatePayment(Integer id, PaymentRequest request) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new AppException(ERROR_CODE.PAYMENT_NOT_FOUND));

        paymentMapper.updateEntity(payment, request);
        Payment updatedPayment = paymentRepository.save(payment);
        if(request.getPaymentState().equals(PaymentState.SUCCESS) && request.getMethod().equals(PaymentMethod.CASH)){
            Contract contract =  contractRepository.findByIdAndStatus(payment.getContractId(), RecordStatus.active)
                    .orElseThrow(() -> new AppException(ERROR_CODE.BOOKING_NOT_EXISTED));
                    contract.setContractState(ContractState.ACTIVE);
                    contractRepository.save(contract);

            Invoice invoice = invoiceRepository.findByContractIdAndStatus(payment.getContractId(), RecordStatus.active)
                    .orElseThrow(() -> new AppException(ERROR_CODE.INVOICE_NOT_FOUND));

            List<Payment> payments = paymentRepository.findAllByContractIdAndPaymentStateAndStatus(payment.getContractId(),
                    PaymentState.SUCCESS, RecordStatus.active);
                if (!taskListRepository.existsByContractId(contract.getId())) {
                    String title = (contract.getBrideName() != null ? contract.getBrideName() : "") +
                            " & " +
                            (contract.getGroomName() != null ? contract.getGroomName() : "");

                    TaskListCreateRequest taskListRequest = TaskListCreateRequest.builder()
                            .contractId(contract.getId())
                            .name(title)
                            .description("Task list for contract " + contract.getContractNo())
                            .build();

                    taskListService.createNewTaskList(taskListRequest);
                }
            if(payments.size() > 1){
                invoice.setInvoiceState(InvoiceState.PAID);
            } else {
                invoice.setInvoiceState(InvoiceState.PARTIALLY_PAID);
            }
            invoiceRepository.save(invoice);
        }
        return paymentMapper.toResponse(updatedPayment);
    }

    @Override
    public PaymentResponse getPaymentById(Integer id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new AppException(ERROR_CODE.PAYMENT_NOT_FOUND));
        return paymentMapper.toResponse(payment);
    }

    @Override
    public SimplePage<PaymentResponse> getAllPayments(Pageable pageable) {
        Page<Payment> payments = paymentRepository.findAllByStatus(RecordStatus.active, pageable);
        return new SimplePage<>(
                payments.getContent().stream()
                        .map(paymentMapper::toResponse)
                        .toList(),
                payments.getTotalElements(),
                payments.getNumber(),
                payments.getSize()
        );
    }

    @Override
    public SimplePage<PaymentResponse> getPaymentsByContract(Integer contractId, Pageable pageable) {
        Page<Payment> payments = paymentRepository.findByContractIdAndStatus(contractId, RecordStatus.active, pageable);
        return new SimplePage<>(
                payments.getContent().stream()
                        .map(paymentMapper::toResponse)
                        .toList(),
                payments.getTotalElements(),
                payments.getNumber(),
                payments.getSize()
        );
    }

    @Override
    public SimplePage<PaymentResponse> filterPayments(Integer contractId, PaymentState paymentState, Pageable pageable) {
        Specification<Payment> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (contractId != null) {
                predicates.add(cb.equal(root.get("contractId"), contractId));
            }

            if (paymentState != null) {
                predicates.add(cb.equal(root.get("paymentState"), paymentState));
            }
            predicates.add(cb.equal(root.get("status"), RecordStatus.active));

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Payment> page = paymentRepository.findAll(spec, pageable);

        List<PaymentResponse> responses = page.getContent()
                .stream()
                .map(paymentMapper::toResponse)
                .collect(Collectors.toList());

        return new SimplePage<>(
                responses,
                page.getTotalElements(),
                pageable
        );
    }

    @Override
    @Transactional
    public PaymentResponse changePaymentStatus(Integer id, PaymentState status) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new AppException(ERROR_CODE.PAYMENT_NOT_FOUND));

        payment.setPaymentState(status);
        Payment updatedPayment = paymentRepository.save(payment);
        return paymentMapper.toResponse(updatedPayment);
    }

    @Override
    @Transactional
    public void deletePayment(Integer id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new AppException(ERROR_CODE.PAYMENT_NOT_FOUND));

        payment.setStatus(RecordStatus.inactive);
        paymentRepository.save(payment);
    }
}

