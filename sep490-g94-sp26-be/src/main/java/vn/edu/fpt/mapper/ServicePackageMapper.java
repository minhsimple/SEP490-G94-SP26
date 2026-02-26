package vn.edu.fpt.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import vn.edu.fpt.dto.request.servicepackage.ServicePackageRequest;
import vn.edu.fpt.dto.response.servicepackage.ServicePackageResponse;
import vn.edu.fpt.entity.ServicePackage;

import java.util.List;

@Mapper(componentModel = "spring", uses = { ServiceMapper.class })
public interface ServicePackageMapper {


    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "basePrice", ignore = true)
    ServicePackage toEntity(ServicePackageRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "basePrice", ignore = true)
    void updateEntity(@MappingTarget ServicePackage entity,
                      ServicePackageRequest request);


    ServicePackageResponse toResponse(ServicePackage servicePackage);

}
