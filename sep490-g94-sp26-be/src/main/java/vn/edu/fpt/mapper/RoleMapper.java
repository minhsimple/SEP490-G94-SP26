package vn.edu.fpt.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import vn.edu.fpt.dto.request.role.RoleRequest;
import vn.edu.fpt.dto.response.role.RoleResponse;
import vn.edu.fpt.entity.Role;

@Mapper(componentModel = "spring")
public interface RoleMapper {
    @Mapping(target = "id", ignore = true)
    Role toEntity(RoleRequest request);

    RoleResponse toResponse(Role role);

    @Mapping(target = "id", ignore = true)
    void updateEntity(@MappingTarget Role role, RoleRequest request);
}
