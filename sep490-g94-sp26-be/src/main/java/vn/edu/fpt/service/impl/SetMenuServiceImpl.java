package vn.edu.fpt.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import vn.edu.fpt.dto.request.setmenu.SetMenuRequest;
import vn.edu.fpt.dto.response.setmenu.SetMenuResponse;
import vn.edu.fpt.entity.*;
import vn.edu.fpt.enums.RecordStatus;
import vn.edu.fpt.exception.AppException;
import vn.edu.fpt.exception.ERROR_CODE;
import vn.edu.fpt.respository.*;
import vn.edu.fpt.service.SetMenuService;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SetMenuServiceImpl implements SetMenuService {
    private final SetMenuRepository setMenuRepository;
    private final SetMenuItemRepository setMenuItemRepository;
    private final LocationRepository locationRepository;
    private final MenuItemRepository menuItemRepository;
    private final CategoryMenuItemRepository categoryMenuItemRepository;

    @Override
    public SetMenuResponse createNewSetMenu(SetMenuRequest setMenuRequest) {
        Location location = locationRepository
                .findByIdAndStatus(setMenuRequest.getLocationId(), RecordStatus.active)
                .orElseThrow(() -> new AppException(ERROR_CODE.LOCATION_NOT_EXISTED));

        if(!CollectionUtils.isEmpty(setMenuRequest.getMenuItems())) {
            validateMenuItems(setMenuRequest);
        }

        SetMenu setMenu = SetMenu.builder()
                .code(setMenuRequest.getCode())
                .name(setMenuRequest.getName())
                .description(setMenuRequest.getDescription())
                .locationId(setMenuRequest.getLocationId())
                .setPrice(!CollectionUtils.isEmpty(setMenuRequest.getMenuItems()) ?
                        calculateSetPrice(setMenuRequest.getMenuItems()) : BigDecimal.ZERO)
                .build();

        Integer setMenuId = setMenuRepository.save(setMenu).getId();

        List<SetMenuItem> setMenuItems = setMenuRequest.getMenuItems()
                .stream()
                .map(menuItem -> SetMenuItem.builder()
                        .menuItemId(menuItem.getId())
                        .setMenuId(setMenuId)
                        .quantity(menuItem.getQuantity())
                        .courseOrder(menuItem.getCourseOrder())
                        .build())
                .collect(Collectors.toList());

        setMenuItems = setMenuItemRepository.saveAll(setMenuItems);

        return mapToSetMenuResponse(setMenu, location, setMenuItems);
    }

    private SetMenuResponse mapToSetMenuResponse(SetMenu setMenu, Location location, List<SetMenuItem> setMenuItemList) {
        SetMenuResponse setMenuResponse = new SetMenuResponse();
        setMenuResponse.setId(setMenu.getId());
        setMenuResponse.setCode(setMenu.getCode());
        setMenuResponse.setName(setMenu.getName());
        setMenuResponse.setDescription(setMenu.getDescription());
        setMenuResponse.setSetPrice(setMenu.getSetPrice());
        setMenuResponse.setLocation(new SetMenuResponse.Location(location.getId(), location.getName()));

        Set<Integer> menuItemIds = setMenuItemList.stream()
                .map(SetMenuItem::getMenuItemId)
                .collect(Collectors.toSet());

        List<MenuItem> menuItemList = menuItemRepository.findAllByIdInAndStatus(menuItemIds, RecordStatus.active);
        Set<Integer>  categoryMenuItemIds = menuItemList.stream()
                .map(MenuItem::getCategoryMenuItemsId)
                .collect(Collectors.toSet());

        Map<Integer, String> categoryMenuItemMap = categoryMenuItemRepository.findAllById(categoryMenuItemIds)
                .stream()
                .collect(Collectors.toMap(CategoryMenuItem::getId, CategoryMenuItem::getName));

        Map<String, List<SetMenuResponse.MenuItem>> menuItemsByCategory = menuItemList.stream()
                .map(menuItem -> {
                    SetMenuItem setMenuItem = setMenuItemList.stream()
                            .filter(item -> Objects.equals(item.getMenuItemId(), menuItem.getId()))
                            .findFirst()
                            .orElse(null);
                    if(setMenuItem == null) {
                        return null;
                    }
                    return new SetMenuResponse.MenuItem(
                            menuItem.getId(),
                            menuItem.getCode(),
                            menuItem.getName(),
                            menuItem.getUnitPrice(),
                            menuItem.getDescription(),
                            setMenuItem.getQuantity(),
                            setMenuItem.getCourseOrder()
                    );
                })
                .filter(Objects::nonNull)
                .collect(Collectors.groupingBy(menuItem -> categoryMenuItemMap
                        .get(menuItemList.stream().filter(item -> Objects.equals(item.getId(), menuItem.getId()))
                                .findFirst()
                                .map(MenuItem::getCategoryMenuItemsId).orElse(null))));
        setMenuResponse.setMenuItemsByCategory(menuItemsByCategory);

        return setMenuResponse;
    }

    private BigDecimal calculateSetPrice(List<SetMenuRequest.MenuItem> menuItems) {
        Set<Integer> menuItemIds = menuItems.stream()
                .map(SetMenuRequest.MenuItem::getId)
                .collect(Collectors.toSet());
        List<MenuItem> menuItemList = menuItemRepository.findAllByIdInAndStatus(menuItemIds, RecordStatus.active);
        return menuItemList.stream()
                .map(menuItem -> {
                    Integer quantity = menuItems.stream()
                            .filter(item -> Objects.equals(item.getId(), menuItem.getId()))
                            .findFirst()
                            .map(SetMenuRequest.MenuItem::getQuantity)
                            .orElse(0);
                    return menuItem.getUnitPrice().multiply(BigDecimal.valueOf(quantity));
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private void validateMenuItems(SetMenuRequest setMenuRequest) {
        Set<Integer> menuItemIds = setMenuRequest.getMenuItems()
                .stream()
                .map(SetMenuRequest.MenuItem::getId)
                .collect(Collectors.toSet());
        List<MenuItem> menuItemList = menuItemRepository.findAllByIdInAndStatus(menuItemIds, RecordStatus.active);
        for(MenuItem menuItem : menuItemList) {
            if(!Objects.equals(menuItem.getLocationId(), setMenuRequest.getLocationId())) {
                throw new AppException(ERROR_CODE.SET_MENU_LOCATION_NOT_MATCH_MENU_ITEM,
                        "Menu item " + menuItem.getName() + " does not belong to location " + setMenuRequest.getLocationId());
            }
        }
    }
}
