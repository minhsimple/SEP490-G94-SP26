package vn.edu.fpt.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import vn.edu.fpt.dto.request.service.ServiceRequest;
import vn.edu.fpt.dto.response.service.ServiceResponse;
import vn.edu.fpt.entity.Services;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ServiceMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "videoKey", ignore = true)
    Services toEntity(ServiceRequest request);

    @Mapping(target = "videoUrl", ignore = true)
    ServiceResponse toResponse(Services service);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "videoKey", ignore = true)
    void updateEntity(@MappingTarget Services service, ServiceRequest request);

    List<ServiceResponse> toServiceResponseList(List<Services> services);


}