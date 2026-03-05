package vn.edu.fpt.service;

import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import vn.edu.fpt.dto.SimplePage;
import vn.edu.fpt.dto.request.service.ServiceFilterRequest;
import vn.edu.fpt.dto.request.service.ServiceRequest;
import vn.edu.fpt.dto.response.service.ServiceResponse;

public interface ServiceItemService {
    ServiceResponse createService(@Valid ServiceRequest request);

    ServiceResponse updateService(Integer serviceId, @Valid ServiceRequest serviceRequest);

    ServiceResponse getServiceDetail(Integer serviceId);

    ServiceResponse changeStatus(Integer menuItemId);

    SimplePage<ServiceResponse> searchService(Pageable pageable, @Valid ServiceFilterRequest filterRequest);
}
