package vn.edu.fpt.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import vn.edu.fpt.dto.request.menuitem.MenuItemRequest;
import vn.edu.fpt.dto.response.menuitem.MenuItemResponse;
import vn.edu.fpt.entity.CategoryMenuItem;
import vn.edu.fpt.entity.Location;
import vn.edu.fpt.entity.MenuItem;

@Mapper(componentModel = "spring")
public interface MenuItemMapper {

    @Mapping(target = "id", ignore = true)
    MenuItem toEntity(MenuItemRequest request);

    @Mapping(target = "id", ignore = true)
    void updateEntity(@MappingTarget MenuItem menuItem, MenuItemRequest menuItemRequest);

    @Mapping(target = "id", source = "menuItem.id")
    @Mapping(target = "name", source = "menuItem.name")
    @Mapping(target = "description", source = "menuItem.description")
    @Mapping(target = "code", source = "menuItem.code")
    @Mapping(target = "location", source = "location")
    @Mapping(target = "categoryMenuItem", source = "categoryMenuItem")
    MenuItemResponse toResponse(MenuItem menuItem, Location location, CategoryMenuItem categoryMenuItem);

    MenuItemResponse.Location toLocationResponse(Location location);

    MenuItemResponse.CategoryMenuItem toCategoryMenuItemResponse(CategoryMenuItem categoryMenuItem);
}
