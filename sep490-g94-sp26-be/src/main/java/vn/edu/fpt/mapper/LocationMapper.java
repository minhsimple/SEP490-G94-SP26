package vn.edu.fpt.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import vn.edu.fpt.dto.request.location.LocationRequest;
import vn.edu.fpt.dto.response.location.LocationResponse;
import vn.edu.fpt.entity.Location;

@Mapper(componentModel = "spring")
public interface LocationMapper {
    @Mapping(target = "id", ignore = true)
    Location toEntity(LocationRequest request);

    LocationResponse toResponse(Location location);

    @Mapping(target = "id", ignore = true)
    void updateEntity(@MappingTarget Location location, LocationRequest request);
}
