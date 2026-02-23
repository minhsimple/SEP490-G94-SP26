package vn.edu.fpt.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.fpt.dto.SimplePage;
import vn.edu.fpt.dto.request.servicepackage.ServicePackageRequest;
import vn.edu.fpt.dto.response.servicepackage.ServicePackageResponse;
import vn.edu.fpt.entity.Location;
import vn.edu.fpt.entity.PackageService;
import vn.edu.fpt.entity.ServicePackage;
import vn.edu.fpt.entity.Services;
import vn.edu.fpt.enums.RecordStatus;
import vn.edu.fpt.exception.AppException;
import vn.edu.fpt.exception.ERROR_CODE;
//import vn.edu.fpt.mapper.ServicePackageMapper;
import vn.edu.fpt.mapper.ServicePackageMapper;
import vn.edu.fpt.respository.LocationRepository;
import vn.edu.fpt.respository.PackageServiceRepository;
import vn.edu.fpt.respository.ServiceItemRepository;
import vn.edu.fpt.respository.ServicePackageRepository;
import vn.edu.fpt.service.ServicePackageService;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ServicePackageServiceImpl implements ServicePackageService {
    private final ServicePackageRepository servicePackageRepository;
    private final ServiceItemRepository serviceItemRepository;
    private final PackageServiceRepository packageServiceRepository;
    private final LocationRepository locationRepository;
    ServicePackageMapper servicePackageMapper;

    @Transactional
    @Override
    public ServicePackageResponse createServicePackage(ServicePackageRequest request) {


        if (servicePackageRepository.existsByCodeAndStatus(request.getCode(), RecordStatus.active)) {
            throw new AppException(ERROR_CODE.SERVICE_EXISTED);
        }
        Location location = locationRepository.findById(request.getLocationId())
                .orElseThrow(() -> new AppException(ERROR_CODE.LOCATION_NOT_EXISTED));

        List<Integer> serviceIds = request.getServiceList().stream()
                .map(ServicePackageRequest.ServiceItemRequest::getServiceId)
                .toList();

        if(!validateServiceIds( request)){
            throw new AppException(ERROR_CODE.SERVICE_NOT_EXISTED);
        }
        // tạo gói dịch vụ
        ServicePackage servicePackage = ServicePackage.builder()
                .code(request.getCode())
                .name(request.getName())
                .description(request.getDescription())
                .locationId(request.getLocationId())
                .basePrice(calculateBasePrice(request.getServiceList()))
                .status(RecordStatus.active)
                .build();

        servicePackageRepository.save(servicePackage);

        // thêm dịch vụ vào gói dịch vụ
        List<PackageService> packageServices = request.getServiceList().stream()
                .map(serviceItem -> PackageService.builder()
                        .packageId(servicePackage.getId())
                        .serviceId(serviceItem.getServiceId())
                        .qty(serviceItem.getQty() != null ? serviceItem.getQty() : BigDecimal.ONE)
                        .build())
                .collect(Collectors.toList());

        packageServiceRepository.saveAll(packageServices);

        return ServicePackageResponse.builder()
                .id(servicePackage.getId())
                .code(servicePackage.getCode())
                .name(servicePackage.getName())
                .description(servicePackage.getDescription())
                .locationId(servicePackage.getLocationId())
                .basePrice(servicePackage.getBasePrice())
                .ServiceResponseList(packageServices)
                .build();
    }

    // Helper method to validate service IDs
    public boolean validateServiceIds(ServicePackageRequest request) {
        List<Integer> serviceIds = request.getServiceList().stream()
                .map(ServicePackageRequest.ServiceItemRequest::getServiceId)
                .toList();
        for (Integer serviceId : serviceIds) {
            if (!serviceItemRepository.existsByIdAndStatus(serviceId, RecordStatus.active)) {
                return false;
            }
        }
        return true;
    }

    private BigDecimal calculateBasePrice(List<ServicePackageRequest.ServiceItemRequest> serviceItems) {
        List<Integer> serviceIds = serviceItems.stream()
                .map(ServicePackageRequest.ServiceItemRequest::getServiceId)
                .collect(Collectors.toList());

        List<Services> serviceItemList = serviceItemRepository.findAllByIdInAndStatus(serviceIds, RecordStatus.active);

        return serviceItemList.stream()
                .map(serviceItem -> {
                    BigDecimal qty = serviceItems.stream()
                            .filter(item -> Objects.equals(item.getServiceId(), serviceItem.getId()))
                            .findFirst()
                            .map(ServicePackageRequest.ServiceItemRequest::getQty)
                            .orElse(BigDecimal.ONE);
                    return serviceItem.getBasePrice().multiply(qty);
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Transactional
    @Override
    public ServicePackageResponse updateServicePackage(Integer servicePackageId, ServicePackageRequest request) {

        ServicePackage servicePackage = servicePackageRepository
                .findByIdAndStatus(servicePackageId, RecordStatus.active)
                .orElseThrow(() -> new AppException(ERROR_CODE.SERVICE_NOT_EXISTED));

        if (servicePackageRepository.existsByCodeAndStatusAndIdNot(
                request.getCode(),
                RecordStatus.active,
                servicePackageId)) {
            throw new AppException(ERROR_CODE.SERVICE_EXISTED);
        }
        if(validateServiceIds(request)){
            throw new AppException(ERROR_CODE.SERVICE_NOT_EXISTED);
        }


        servicePackage.setCode(request.getCode());
        servicePackage.setName(request.getName());
        servicePackage.setDescription(request.getDescription());
        servicePackage.setLocationId(request.getLocationId());

        // delete old relations
        packageServiceRepository.deleteByPackageId(servicePackageId);

        // insert new relations
        List<PackageService> newRelations = request.getServiceList().stream()
                .map(item -> PackageService.builder()
                        .packageId(servicePackageId)
                        .serviceId(item.getServiceId())
                        .qty(item.getQty() != null ? item.getQty() : BigDecimal.ONE)
                        .build())
                .collect(Collectors.toList());

        packageServiceRepository.saveAll(newRelations);

        // recalc price
        servicePackage.setBasePrice(calculateBasePrice(request.getServiceList()));
        List<PackageService> services = packageServiceRepository.findByPackageIdAndStatus(servicePackageId, RecordStatus.active);
        ServicePackageResponse response =
                servicePackageMapper.toResponse(servicePackage);

        response.setServiceResponseList(services);

        return response;    }



    @Override
    public ServicePackageResponse getServicePackageDetail(Integer servicePackageId) {
        return null;
    }

    @Override
    public ServicePackageResponse changeStatus(Integer servicePackageId) {

        ServicePackage servicePackage = servicePackageRepository.findById(servicePackageId)
                .orElseThrow(() -> new AppException(ERROR_CODE.SERVICE_PACKAGE_NOT_FOUND));

        if (servicePackage.getStatus() == RecordStatus.active) {
            servicePackage.setStatus(RecordStatus.inactive);
        } else {
            servicePackage.setStatus(RecordStatus.active);
        }

        servicePackageRepository.save(servicePackage);

        return servicePackageMapper.toResponse(servicePackage);
    }

    @Override
    public SimplePage<ServicePackageResponse> searchServicePackage(Pageable pageable) {
        return null;
    }
}
