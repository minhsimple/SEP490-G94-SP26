package vn.edu.fpt.service;

import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import vn.edu.fpt.dto.SimplePage;
import vn.edu.fpt.dto.request.servicepackage.ServicePackageRequest;
import vn.edu.fpt.dto.response.servicepackage.ServicePackageResponse;

public interface ServicePackageService  {
    ServicePackageResponse createServicePackage(@Valid ServicePackageRequest request);

    ServicePackageResponse updateServicePackage(Integer servicePackageId, @Valid ServicePackageRequest request);

    ServicePackageResponse getServicePackageDetail(Integer servicePackageId);

    ServicePackageResponse changeStatus(Integer servicePackageId);

    SimplePage<ServicePackageResponse> searchServicePackage(Pageable pageable);
}
