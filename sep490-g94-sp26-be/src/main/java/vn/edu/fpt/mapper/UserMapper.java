package vn.edu.fpt.mapper;

import org.mapstruct.*;
import vn.edu.fpt.dto.request.user.UserRequest;
import vn.edu.fpt.dto.response.UserResponse;
import vn.edu.fpt.entity.User;

@Mapper(componentModel = "spring")

public interface UserMapper {
    // Entity -> Response
    @Mapping(source = "role_id", target = "roleId")
    UserResponse toResponse(User user);


    // Update entity (không update id & password)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(source = "password", target = "passwordHash")
    void updateEntity(@MappingTarget User user, UserRequest updatedUser);

    @Mapping(source = "password", target = "passwordHash")
    User toEntity(UserRequest request);
}
