package vn.edu.fpt.service.impl;

import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import vn.edu.fpt.dto.SimplePage;
import vn.edu.fpt.dto.request.service.ServiceFilterRequest;
import vn.edu.fpt.dto.request.service.ServiceRequest;
import vn.edu.fpt.dto.response.service.ServiceResponse;
import vn.edu.fpt.util.enums.RecordStatus;
import vn.edu.fpt.exception.AppException;
import vn.edu.fpt.exception.ERROR_CODE;
import vn.edu.fpt.mapper.ServiceMapper;
import vn.edu.fpt.respository.LocationRepository;
import vn.edu.fpt.respository.PackageServiceRepository;
import vn.edu.fpt.respository.ServicePackageRepository;
import vn.edu.fpt.respository.ServiceItemRepository;
import vn.edu.fpt.service.ServiceItemService;
import vn.edu.fpt.service.VideoService;
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
    private final LocationRepository locationRepository;
    private final PackageServiceRepository packageServiceRepository;
    private final VideoService videoService;

    @Override
    @Transactional
    public ServiceResponse createService(ServiceRequest request, MultipartFile videoFile) {
        if (serviceItemRepository.existsByCodeAndLocationId(request.getCode(),
                request.getLocationId())) {
            throw new AppException(ERROR_CODE.SERVICE_EXISTED);
        }
        if (!locationRepository.existsByIdAndStatus(request.getLocationId(), RecordStatus.active)) {
            throw new AppException(ERROR_CODE.LOCATION_NOT_EXISTED);
        }

        Services service = serviceMapper.toEntity(request);
        Services saved = serviceItemRepository.save(service);
        String videoKey = videoService.uploadVideo("services", saved.getId(), videoFile);
        saved.setVideoKey(videoKey);
        return serviceMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public ServiceResponse updateService(Integer serviceId, ServiceRequest serviceRequest, MultipartFile videoFile) {
        Services service = serviceItemRepository.findByIdAndStatus(serviceId, RecordStatus.active)
                .orElseThrow(() -> new AppException(ERROR_CODE.SERVICE_NOT_EXISTED));

        if (!locationRepository.existsByIdAndStatus(serviceRequest.getLocationId(), RecordStatus.active)) {
            throw new AppException(ERROR_CODE.LOCATION_NOT_EXISTED);
        }

        serviceMapper.updateEntity(service, serviceRequest);
        if (videoFile != null) {
            if (service.getVideoKey() != null) {
                videoService.deleteVideo(service.getVideoKey());
            }
            String videoKey = videoService.uploadVideo("services", service.getId(), videoFile);
            service.setVideoKey(videoKey);
        }
        return serviceMapper.toResponse(service);
    }

    @Override
    public ServiceResponse getServiceDetail(Integer serviceId) {
        Services service = serviceItemRepository.findById(serviceId)
                .orElseThrow(() -> new AppException(ERROR_CODE.SERVICE_NOT_EXISTED));

        return serviceMapper.toResponse(service);
    }

    @Transactional
    @Override
    public ServiceResponse changeStatus(Integer serviceId) {
        Services service = serviceItemRepository.findById(serviceId)
                .orElseThrow(() -> new AppException(ERROR_CODE.SERVICE_NOT_EXISTED));

        if (!locationRepository.existsByIdAndStatus(service.getLocationId(), RecordStatus.active)) {
            throw new AppException(ERROR_CODE.LOCATION_NOT_EXISTED);
        }

        if (service.getStatus() == RecordStatus.active) {
            service.setStatus(RecordStatus.inactive);
        } else {
            service.setStatus(RecordStatus.active);
        }
        // change all status in packageService
        packageServiceRepository.updateStatusByServiceId(serviceId, service.getStatus());

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
                if (filterRequest.getUpperBoundItemPrice() != null && filterRequest.getLowerBoundItemPrice() != null) {
                    predicates.add(
                            cb.between(root.get("unitPrice"), filterRequest.getLowerBoundItemPrice(),
                                    filterRequest.getUpperBoundItemPrice()));
                } else if (filterRequest.getUpperBoundItemPrice() != null) {
                    predicates.add(
                            cb.lessThanOrEqualTo(root.get("unitPrice"), filterRequest.getUpperBoundItemPrice()));
                }
                if (filterRequest.getLocationId() != null) {
                    predicates.add(cb.equal(root.get("locationId"), filterRequest.getLocationId()));
                }
            }
            if (filterRequest.getStatus() != null) {
                predicates.add(cb.equal(root.get("status"), filterRequest.getStatus()));
            }

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
                pageable);
    }
}