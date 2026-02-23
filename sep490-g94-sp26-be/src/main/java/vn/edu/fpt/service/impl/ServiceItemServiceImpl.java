package vn.edu.fpt.service.impl;

import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import vn.edu.fpt.dto.SimplePage;
import vn.edu.fpt.dto.request.service.ServiceFilterRequest;
import vn.edu.fpt.dto.request.service.ServiceRequest;
import vn.edu.fpt.dto.response.service.ServiceResponse;
import vn.edu.fpt.enums.RecordStatus;
import vn.edu.fpt.exception.AppException;
import vn.edu.fpt.exception.ERROR_CODE;
import vn.edu.fpt.mapper.ServiceMapper;
import vn.edu.fpt.respository.ServicePackageRepository;
import vn.edu.fpt.respository.ServiceItemRepository;
import vn.edu.fpt.service.ServiceItemService;
import vn.edu.fpt.entity.Services;


import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ServiceItemServiceImpl implements ServiceItemService {
    private final ServiceItemRepository serviceItemRepository;
    private final ServicePackageRepository servicePackageRepository;
    private final ServiceMapper serviceMapper; // Add this dependency

    @Override
    public ServiceResponse createService(ServiceRequest request) {
        if (serviceItemRepository.existsByCodeAndStatus(request.getCode(), RecordStatus.active)) {
            throw new AppException(ERROR_CODE.SERVICE_EXISTED);
        }

        Services service = serviceMapper.toEntity(request);
        Services saved = serviceItemRepository.save(service);
        return serviceMapper.toResponse(saved);
    }

    @Override
    public ServiceResponse updateService(Integer serviceId, ServiceRequest serviceRequest) {
        Services service = serviceItemRepository.findByIdAndStatus(serviceId, RecordStatus.active)
                .orElseThrow(() -> new AppException(ERROR_CODE.SERVICE_NOT_EXISTED));

        serviceMapper.updateEntity(service, serviceRequest);
        Services saved = serviceItemRepository.save(service);
        return serviceMapper.toResponse(saved);
    }

    @Override
    public ServiceResponse getServiceDetail(Integer serviceId) {
        Services service = serviceItemRepository.findByIdAndStatus(serviceId, RecordStatus.active)
                .orElseThrow(() -> new AppException(ERROR_CODE.SERVICE_NOT_EXISTED));

        return serviceMapper.toResponse(service);
    }

    @Override
    public ServiceResponse changeStatus(Integer serviceId) {
        Services service = serviceItemRepository.findById(serviceId)
                .orElseThrow(() -> new AppException(ERROR_CODE.SERVICE_NOT_EXISTED));

        if (service.getStatus() == RecordStatus.active) {
            service.setStatus(RecordStatus.inactive);
        } else {
            service.setStatus(RecordStatus.active);
        }

        Services saved = serviceItemRepository.save(service);
        return serviceMapper.toResponse(saved);
    }

    @Override
    public SimplePage<ServiceResponse> searchService(Pageable pageable, ServiceFilterRequest filterRequest) {
        Specification<Services> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filterRequest != null) {
                if (filterRequest.getCode() != null && !filterRequest.getCode().isBlank()) {
                    predicates.add(cb.like(cb.lower(root.get("code")),
                            "%" + filterRequest.getCode().toLowerCase() + "%"));
                }

                if (filterRequest.getName() != null && !filterRequest.getName().isBlank()) {
                    predicates.add(cb.like(cb.lower(root.get("name")),
                            "%" + filterRequest.getName().toLowerCase() + "%"));
                }

                if (filterRequest.getDescription() != null && !filterRequest.getDescription().isBlank()) {
                    predicates.add(cb.like(cb.lower(root.get("description")),
                            "%" + filterRequest.getDescription().toLowerCase() + "%"));
                }

                if (filterRequest.getUnit() != null && !filterRequest.getUnit().isBlank()) {
                    predicates.add(cb.like(cb.lower(root.get("unit")),
                            "%" + filterRequest.getUnit().toLowerCase() + "%"));
                }
                if(filterRequest.getUpperBoundItemPrice() != null && filterRequest.getLowerBoundItemPrice() != null) {
                    predicates.add(
                            cb.between(root.get("unitPrice"), filterRequest.getLowerBoundItemPrice(), filterRequest.getUpperBoundItemPrice())
                    );
                } else if(filterRequest.getUpperBoundItemPrice() != null) {
                    predicates.add(
                            cb.lessThanOrEqualTo(root.get("unitPrice"), filterRequest.getUpperBoundItemPrice())
                    );
                }
                if (filterRequest.getLocationId() != null) {
                    predicates.add(cb.equal(root.get("locationId"), filterRequest.getLocationId()));
                }
            }

            // always filter active
            predicates.add(cb.equal(root.get("status"), RecordStatus.active));

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Services> page = serviceItemRepository.findAll(spec, pageable);

        List<ServiceResponse> responses = page.getContent()
                .stream()
                .map(serviceMapper::toResponse)
                .collect(Collectors.toList());

        return new SimplePage<>(
                responses,
                page.getTotalElements(),
                pageable
        );
    }
}