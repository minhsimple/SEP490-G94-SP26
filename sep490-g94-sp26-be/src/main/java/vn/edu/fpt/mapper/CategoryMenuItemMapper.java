package vn.edu.fpt.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import vn.edu.fpt.dto.request.categorymenuitem.CategoryMenuItemRequest;
import vn.edu.fpt.dto.response.categorymenuitem.CategoryMenuItemResponse;
import vn.edu.fpt.entity.CategoryMenuItem;

@Mapper(componentModel = "spring")
public interface CategoryMenuItemMapper {
    @Mapping(target = "id", ignore = true)
    CategoryMenuItem toEntity(CategoryMenuItemRequest request);

    CategoryMenuItemResponse toResponse(CategoryMenuItem categoryMenuItem);

    @Mapping(target = "id", ignore = true)
    void updateEntity(@MappingTarget CategoryMenuItem categoryMenuItem, CategoryMenuItemRequest categoryMenuItemRequest);
}
