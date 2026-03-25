package vn.edu.fpt.service.impl;

import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import vn.edu.fpt.dto.SimplePage;
import vn.edu.fpt.dto.request.setmenu.SetMenuFilterRequest;
import vn.edu.fpt.dto.request.setmenu.SetMenuRequest;
import vn.edu.fpt.dto.response.setmenu.SetMenuResponse;
import vn.edu.fpt.entity.*;
import vn.edu.fpt.service.ImageAssetService;
import vn.edu.fpt.util.MediaAssetUtil;
import vn.edu.fpt.util.enums.MediaAssetOwnerType;
import vn.edu.fpt.util.enums.RecordStatus;
import vn.edu.fpt.exception.AppException;
import vn.edu.fpt.exception.ERROR_CODE;
import vn.edu.fpt.respository.*;
import vn.edu.fpt.service.SetMenuService;
import vn.edu.fpt.util.StringUtils;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SetMenuServiceImpl implements SetMenuService {
    private final SetMenuRepository setMenuRepository;
    private final SetMenuItemRepository setMenuItemRepository;
    private final LocationRepository locationRepository;
    private final MenuItemRepository menuItemRepository;
    private final CategoryMenuItemRepository categoryMenuItemRepository;
    private final ImageAssetService imageAssetService;
    private final MediaAssetRepository mediaAssetRepository;

    @Transactional
    @Override
    public SetMenuResponse createNewSetMenu(SetMenuRequest setMenuRequest, MultipartFile imageFile) throws Exception {
        Location location = locationRepository
                .findByIdAndStatus(setMenuRequest.getLocationId(), RecordStatus.active)
                .orElseThrow(() -> new AppException(ERROR_CODE.LOCATION_NOT_EXISTED));

        if (setMenuRepository.existsByCodeAndLocationId(setMenuRequest.getCode(), setMenuRequest.getLocationId())) {
            throw new AppException(ERROR_CODE.SET_MENU_CODE_EXISTED_SAME_LOCATION);
        }

        Set<Integer> menuItemIdsSet = validateMenuItems(setMenuRequest);
        if (menuItemIdsSet.isEmpty()) {
            throw new AppException(ERROR_CODE.SET_MENU_EMPTY_MENU_ITEM);
        }

        SetMenu setMenu = SetMenu.builder()
                .code(setMenuRequest.getCode())
                .name(setMenuRequest.getName())
                .description(setMenuRequest.getDescription())
                .locationId(setMenuRequest.getLocationId())
                .build();

        Integer setMenuId = setMenuRepository.save(setMenu).getId();

        MediaAsset mediaAsset = MediaAssetUtil.uploadImageAsset(imageAssetService, mediaAssetRepository, imageFile, setMenuId, MediaAssetOwnerType.SET_MENU, null);

        List<SetMenuItem> setMenuItems = getSetMenuItemList(setMenuRequest, menuItemIdsSet, setMenuId);

        setMenuItems = setMenuItemRepository.saveAll(setMenuItems);

        return mapToSetMenuResponse(setMenu, location, setMenuItems, mediaAsset);
    }

    @Override
    public SetMenuResponse getSetMenuById(Integer id) throws Exception {
        SetMenu setMenu = setMenuRepository.findById(id)
                .orElseThrow(() -> new AppException(ERROR_CODE.SET_MENU_NOT_EXISTED));
        Location location = locationRepository.findById(setMenu.getLocationId())
                .orElseThrow(() -> new AppException(ERROR_CODE.LOCATION_NOT_EXISTED));
        List<SetMenuItem> setMenuItemList = setMenuItemRepository.findAllBySetMenuIdAndStatus(setMenu.getId(), RecordStatus.active);

        MediaAsset mediaAsset = MediaAssetUtil.getMediaAssetByEntityIdAndOwnerType(mediaAssetRepository, setMenu.getId(), MediaAssetOwnerType.SET_MENU);

        return mapToSetMenuResponse(setMenu, location, setMenuItemList, mediaAsset);
    }

    @Override
    public SimplePage<SetMenuResponse> getAllSetMenu(Pageable pageable, SetMenuFilterRequest filterRequest) {
        Specification<SetMenu> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (!StringUtils.isNullOrEmptyOrBlank(filterRequest.getCode())) {
                predicates.add(cb.like(
                        cb.lower(root.get("code")), "%" + filterRequest.getCode().toLowerCase() + "%"
                ));
            }
            if (!StringUtils.isNullOrEmptyOrBlank(filterRequest.getName())) {
                predicates.add(cb.like(
                        cb.lower(root.get("name")), "%" + filterRequest.getName().toLowerCase() + "%"
                ));
            }
            if (!StringUtils.isNullOrEmptyOrBlank(filterRequest.getDescription())) {
                predicates.add(cb.like(
                        cb.lower(root.get("description")), "%" + filterRequest.getDescription().toLowerCase() + "%"
                ));
            }
            if (filterRequest.getLocationId() != null) {
                predicates.add(cb.equal(
                        root.get("locationId"),
                        filterRequest.getLocationId()
                ));
            }
            if (filterRequest.getUpperBoundSetPrice() != null && filterRequest.getLowerBoundSetPrice() != null) {
                predicates.add(
                        cb.between(root.get("setPrice"), filterRequest.getLowerBoundSetPrice(), filterRequest.getUpperBoundSetPrice())
                );
            } else if (filterRequest.getUpperBoundSetPrice() != null) {
                predicates.add(
                        cb.lessThanOrEqualTo(root.get("setPrice"), filterRequest.getUpperBoundSetPrice())
                );
            } else if (filterRequest.getLowerBoundSetPrice() != null) {
                predicates.add(
                        cb.greaterThanOrEqualTo(root.get("setPrice"), filterRequest.getLowerBoundSetPrice())
                );
            }
            if (filterRequest.getStatus() != null) {
                predicates.add(cb.equal(root.get("status"), filterRequest.getStatus()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<SetMenu> setMenuPage = setMenuRepository.findAll(spec, pageable);
        List<SetMenu> setMenuList = setMenuPage.getContent();

        Map<Integer, Location> locationMap = locationRepository.findAllById(setMenuList.stream()
                        .map(SetMenu::getLocationId)
                        .collect(Collectors.toSet()))
                .stream()
                .collect(Collectors.toMap(Location::getId, location -> location));

        Map<Integer, List<SetMenuItem>> setMenuItemsMap = setMenuItemRepository.findAllBySetMenuIdInAndStatus(setMenuList.stream()
                        .map(SetMenu::getId)
                        .collect(Collectors.toSet()), RecordStatus.active)
                .stream()
                .collect(Collectors.groupingBy(SetMenuItem::getSetMenuId));

        List<SetMenuResponse> setMenuResponseList = setMenuList.stream()
                .map(setMenu -> {
                    Location location = locationMap.get(setMenu.getLocationId());
                    List<SetMenuItem> setMenuItemList = setMenuItemsMap.getOrDefault(setMenu.getId(), Collections.emptyList());
                    MediaAsset mediaAsset = MediaAssetUtil.getMediaAssetByEntityIdAndOwnerType(mediaAssetRepository, setMenu.getId(), MediaAssetOwnerType.SET_MENU);
                    try {
                        return mapToSetMenuResponse(setMenu, location, setMenuItemList, mediaAsset);
                    } catch (Exception e) {
                        throw new RuntimeException(e);
                    }
                })
                .toList();


        return new SimplePage<>(
                setMenuResponseList,
                setMenuPage.getTotalElements(),
                pageable
        );
    }

    @Transactional
    @Override
    public SetMenuResponse changeStatusSetMenu(Integer id) throws Exception {
        SetMenu setMenu = setMenuRepository.findById(id)
                .orElseThrow(() -> new AppException(ERROR_CODE.SET_MENU_NOT_EXISTED));

        if (setMenu.getStatus() == RecordStatus.active) {
            setMenu.setStatus(RecordStatus.inactive);
        } else {
            setMenu.setStatus(RecordStatus.active);
        }

        Location location = locationRepository.findById(setMenu.getLocationId())
                .orElseThrow(() -> new AppException(ERROR_CODE.LOCATION_NOT_EXISTED));
        List<SetMenuItem> setMenuItemList = setMenuItemRepository.findAllBySetMenuIdAndStatus(setMenu.getId(), RecordStatus.active);

        MediaAsset mediaAsset = MediaAssetUtil.getMediaAssetByEntityIdAndOwnerType(mediaAssetRepository, setMenu.getId(), MediaAssetOwnerType.SET_MENU);

        return mapToSetMenuResponse(setMenu, location, setMenuItemList, mediaAsset);
    }

    @Transactional
    @Override
    public SetMenuResponse updateSetMenu(Integer setMenuId, SetMenuRequest setMenuRequest, MultipartFile imageFile) throws Exception {
        SetMenu setMenu = setMenuRepository.findSetMenuByIdAndStatus(setMenuId, RecordStatus.active)
                .orElseThrow(() -> new AppException(ERROR_CODE.SET_MENU_NOT_EXISTED));

        Location location = locationRepository.findById(setMenuRequest.getLocationId())
                .orElseThrow(() -> new AppException(ERROR_CODE.LOCATION_NOT_EXISTED));

        if (setMenuRepository.existsByCodeAndLocationIdAndIdNot(setMenuRequest.getCode(), setMenuRequest.getLocationId(), setMenuId)) {
            throw new AppException(ERROR_CODE.SET_MENU_CODE_EXISTED_SAME_LOCATION);
        }

        Set<Integer> menuItemIdsSet = validateMenuItems(setMenuRequest);
        if (menuItemIdsSet.isEmpty()) {
            throw new AppException(ERROR_CODE.SET_MENU_EMPTY_MENU_ITEM);
        }

        MediaAsset mediaAsset = MediaAssetUtil.getMediaAssetByEntityIdAndOwnerType(mediaAssetRepository, setMenuId, MediaAssetOwnerType.SET_MENU);

        if (imageFile != null && !imageFile.isEmpty()) {
            if (mediaAsset != null) {
                imageAssetService.deleteFolder(mediaAsset.getImageOrigKey());
            }
            mediaAsset = MediaAssetUtil.uploadImageAsset(imageAssetService, mediaAssetRepository, imageFile, setMenuId, MediaAssetOwnerType.SET_MENU, mediaAsset);
        }

        setMenu.setCode(setMenuRequest.getCode());
        setMenu.setName(setMenuRequest.getName());
        setMenu.setDescription(setMenuRequest.getDescription());
        setMenu.setLocationId(setMenuRequest.getLocationId());

        setMenuItemRepository.deleteBySetMenuId(setMenuId);

        List<SetMenuItem> setMenuItems = getSetMenuItemList(setMenuRequest, menuItemIdsSet, setMenuId);

        setMenuItems = setMenuItemRepository.saveAll(setMenuItems);

        return mapToSetMenuResponse(setMenu, location, setMenuItems, mediaAsset);
    }

    private static @NonNull List<SetMenuItem> getSetMenuItemList(SetMenuRequest setMenuRequest,
                                                                 Set<Integer> menuItemIdsSet,
                                                                 Integer setMenuId) {
        return setMenuRequest.getMenuItems()
                .stream()
                .filter(menuItem -> menuItemIdsSet.contains(menuItem.getId()))
                .map(menuItem -> SetMenuItem.builder()
                        .menuItemId(menuItem.getId())
                        .setMenuId(setMenuId)
                        .quantity(menuItem.getQuantity())
                        .build())
                .collect(Collectors.toList());
    }

    private SetMenuResponse mapToSetMenuResponse(SetMenu setMenu, Location location, List<SetMenuItem> setMenuItemList, MediaAsset mediaAsset) throws Exception {
        SetMenuResponse setMenuResponse = new SetMenuResponse();
        setMenuResponse.setId(setMenu.getId());
        setMenuResponse.setCode(setMenu.getCode());
        setMenuResponse.setName(setMenu.getName());
        setMenuResponse.setDescription(setMenu.getDescription());
        setMenuResponse.setLocation(new SetMenuResponse.Location(location.getId(), location.getName()));
        setMenuResponse.setStatus(setMenu.getStatus());
        setMenuResponse.setImageUrls(MediaAssetUtil.getPresignedImageUrls(imageAssetService, mediaAsset));

        Set<Integer> menuItemIds = setMenuItemList.stream()
                .map(SetMenuItem::getMenuItemId)
                .collect(Collectors.toSet());

        List<MenuItem> menuItemList = menuItemRepository.findAllByIdInAndStatus(menuItemIds, RecordStatus.active);
        Set<Integer> categoryMenuItemIds = menuItemList.stream()
                .map(MenuItem::getCategoryMenuItemsId)
                .collect(Collectors.toSet());

        setMenuResponse.setSetPrice(calculateSetPrice(setMenuItemList, menuItemList));

        Map<Integer, String> categoryMenuItemMap = categoryMenuItemRepository.findAllById(categoryMenuItemIds)
                .stream()
                .collect(Collectors.toMap(CategoryMenuItem::getId, CategoryMenuItem::getName));

        Map<String, List<SetMenuResponse.MenuItem>> menuItemsByCategory = menuItemList.stream()
                .map(menuItem -> {
                    SetMenuItem setMenuItem = setMenuItemList.stream()
                            .filter(item -> Objects.equals(item.getMenuItemId(), menuItem.getId()))
                            .findFirst()
                            .orElse(null);
                    if (setMenuItem == null) {
                        return null;
                    }
                    MediaAsset mediaAssetMenuItem = MediaAssetUtil.getMediaAssetByEntityIdAndOwnerType(mediaAssetRepository, menuItem.getId(), MediaAssetOwnerType.MENU_ITEM);
                    try {
                        return new SetMenuResponse.MenuItem(
                                menuItem.getId(),
                                menuItem.getCode(),
                                menuItem.getName(),
                                menuItem.getUnitPrice(),
                                menuItem.getUnit(),
                                menuItem.getDescription(),
                                setMenuItem.getQuantity(),
                                MediaAssetUtil.getPresignedImageUrls(imageAssetService, mediaAssetMenuItem)
                        );
                    } catch (Exception e) {
                        throw new RuntimeException(e);
                    }
                })
                .filter(Objects::nonNull)
                .collect(Collectors.groupingBy(menuItem -> categoryMenuItemMap
                        .get(menuItemList.stream().filter(item -> Objects.equals(item.getId(), menuItem.getId()))
                                .findFirst()
                                .map(MenuItem::getCategoryMenuItemsId).orElse(null))));
        setMenuResponse.setMenuItemsByCategory(menuItemsByCategory);

        return setMenuResponse;
    }

    public BigDecimal calculateSetPrice(List<SetMenuItem> setMenuItemList, List<MenuItem> menuItemList) {
        Map<Integer, MenuItem> menuItemMap = menuItemList.stream()
                .collect(Collectors.toMap(MenuItem::getId, menuItem -> menuItem));

        BigDecimal setPrice = BigDecimal.ZERO;
        for (SetMenuItem setMenuItem : setMenuItemList) {
            MenuItem menuItem = menuItemMap.get(setMenuItem.getMenuItemId());
            if (menuItem != null) {
                setPrice = setPrice.add(menuItem.getUnitPrice().multiply(BigDecimal.valueOf(setMenuItem.getQuantity())));
            }
        }
        return setPrice;
    }

    private Set<Integer> validateMenuItems(SetMenuRequest setMenuRequest) {
        if (setMenuRequest.getMenuItems().isEmpty()) {
            throw new AppException(ERROR_CODE.SET_MENU_EMPTY_MENU_ITEM);
        }

        Set<Integer> menuItemIds = setMenuRequest.getMenuItems()
                .stream()
                .map(SetMenuRequest.MenuItemRequestDTO::getId)
                .collect(Collectors.toSet());
        List<MenuItem> menuItemList = menuItemRepository.findAllByIdInAndStatus(menuItemIds, RecordStatus.active);
        for (MenuItem menuItem : menuItemList) {
            if (!Objects.equals(menuItem.getLocationId(), setMenuRequest.getLocationId())) {
                throw new AppException(ERROR_CODE.SET_MENU_LOCATION_NOT_MATCH_MENU_ITEM,
                        " Menu item " + menuItem.getName() + " does not belong to location " + setMenuRequest.getLocationId());
            }
        }
        return menuItemList.stream()
                .map(MenuItem::getId)
                .collect(Collectors.toSet());
    }
}
