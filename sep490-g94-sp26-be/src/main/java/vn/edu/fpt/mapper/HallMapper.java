package vn.edu.fpt.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import vn.edu.fpt.dto.request.hall.HallRequest;
import vn.edu.fpt.dto.response.hall.HallResponse;
import vn.edu.fpt.entity.Hall;

@Mapper(componentModel = "spring")
public interface HallMapper {
    @Mapping(target = "id", ignore = true)
    Hall toEntity(HallRequest request);

    @Mapping(target = "locationName", ignore = true)
    HallResponse toResponse(Hall hall);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    void updateEntity(@MappingTarget Hall hall, HallRequest request);
}

