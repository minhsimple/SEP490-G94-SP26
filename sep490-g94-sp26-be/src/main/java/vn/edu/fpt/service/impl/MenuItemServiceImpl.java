package vn.edu.fpt.service.impl;

import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.fpt.dto.SimplePage;
import vn.edu.fpt.dto.request.menuitem.MenuItemFilterRequest;
import vn.edu.fpt.dto.request.menuitem.MenuItemRequest;
import vn.edu.fpt.dto.response.menuitem.MenuItemResponse;
import vn.edu.fpt.entity.CategoryMenuItem;
import vn.edu.fpt.entity.Location;
import vn.edu.fpt.entity.MenuItem;
import vn.edu.fpt.enums.RecordStatus;
import vn.edu.fpt.exception.AppException;
import vn.edu.fpt.exception.ERROR_CODE;
import vn.edu.fpt.mapper.MenuItemMapper;
import vn.edu.fpt.respository.CategoryMenuItemRepository;
import vn.edu.fpt.respository.LocationRepository;
import vn.edu.fpt.respository.MenuItemRepository;
import vn.edu.fpt.service.MenuItemService;
import vn.edu.fpt.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MenuItemServiceImpl implements MenuItemService {
    private final MenuItemRepository menuItemRepository;
    private final LocationRepository locationRepository;
    private final CategoryMenuItemRepository categoryMenuItemRepository;

    private final MenuItemMapper menuItemMapper;

    @Override
    public MenuItemResponse createNewMenuItem(MenuItemRequest request) {
        CategoryMenuItem categoryMenuItem = categoryMenuItemRepository
                .findCategoryMenuItemByIdAndStatus(request.getCategoryMenuItemsId(), RecordStatus.active)
                .orElseThrow(() -> new AppException(ERROR_CODE.CATEGORY_MENU_ITEM_NOT_EXISTED));

        Location location = locationRepository
                .findByIdAndStatus(request.getLocationId(), RecordStatus.active)
                .orElseThrow(() -> new AppException(ERROR_CODE.LOCATION_NOT_EXISTED));

        MenuItem menuItem = menuItemMapper.toEntity(request);
        menuItem = menuItemRepository.save(menuItem);

        return menuItemMapper.toResponse(menuItem, location, categoryMenuItem);
    }

    @Transactional
    @Override
    public MenuItemResponse updateMenuItem(Integer id, MenuItemRequest request) {
        MenuItem menuItem = menuItemRepository.findMenuItemByIdAndStatus(id, RecordStatus.active)
                .orElseThrow(() -> new AppException(ERROR_CODE.MENU_ITEM_NOT_EXISTED));

        CategoryMenuItem categoryMenuItem = categoryMenuItemRepository
                .findCategoryMenuItemByIdAndStatus(request.getCategoryMenuItemsId(), RecordStatus.active)
                .orElseThrow(() -> new AppException(ERROR_CODE.CATEGORY_MENU_ITEM_NOT_EXISTED));

        Location location = locationRepository
                .findByIdAndStatus(request.getLocationId(), RecordStatus.active)
                .orElseThrow(() -> new AppException(ERROR_CODE.LOCATION_NOT_EXISTED));

        menuItemMapper.updateEntity(menuItem, request);

        return menuItemMapper.toResponse(menuItem, location, categoryMenuItem);
    }

    @Override
    public MenuItemResponse getMenuItemById(Integer id) {
        MenuItem menuItem = menuItemRepository.findMenuItemByIdAndStatus(id, RecordStatus.active)
                .orElseThrow(() -> new AppException(ERROR_CODE.MENU_ITEM_NOT_EXISTED));

        CategoryMenuItem categoryMenuItem = categoryMenuItemRepository
                .findCategoryMenuItemByIdAndStatus(menuItem.getCategoryMenuItemsId(), RecordStatus.active)
                .orElseThrow(() -> new AppException(ERROR_CODE.CATEGORY_MENU_ITEM_NOT_EXISTED));

        Location location = locationRepository
                .findByIdAndStatus(menuItem.getLocationId(), RecordStatus.active)
                .orElseThrow(() -> new AppException(ERROR_CODE.LOCATION_NOT_EXISTED));

        return menuItemMapper.toResponse(menuItem, location, categoryMenuItem);
    }

    @Override
    public SimplePage<MenuItemResponse> getAllMenuItems(Pageable pageable, MenuItemFilterRequest filterRequest) {
        Specification<MenuItem> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if(!StringUtils.isNullOrEmptyOrBlank(filterRequest.getCode())) {
                predicates.add(
                        cb.like(cb.lower(root.get("code")), "%" + filterRequest.getCode().toLowerCase() + "%")
                );
            }
            if(!StringUtils.isNullOrEmptyOrBlank(filterRequest.getName())) {
                predicates.add(
                        cb.like(cb.lower(root.get("name")), "%" + filterRequest.getName().toLowerCase() + "%")
                );
            }
            if(!StringUtils.isNullOrEmptyOrBlank(filterRequest.getDescription())) {
                predicates.add(
                        cb.like(cb.lower(root.get("description")), "%" + filterRequest.getDescription().toLowerCase() + "%")
                );
            }
            if(filterRequest.getLocationId() != null) {
                predicates.add(
                        cb.equal(root.get("locationId"), filterRequest.getLocationId())
                );
            }
            if(filterRequest.getCategoryMenuItemsId() != null) {
                predicates.add(
                        cb.equal(root.get("categoryMenuItemsId"), filterRequest.getCategoryMenuItemsId())
                );
            }
            if(filterRequest.getUpperBoundUnitPrice() != null && filterRequest.getLowerBoundUnitPrice() != null) {
                predicates.add(
                        cb.between(root.get("unitPrice"), filterRequest.getLowerBoundUnitPrice(), filterRequest.getUpperBoundUnitPrice())
                );
            } else if(filterRequest.getUpperBoundUnitPrice() != null) {
                predicates.add(
                        cb.lessThanOrEqualTo(root.get("unitPrice"), filterRequest.getUpperBoundUnitPrice())
                );
            } else if(filterRequest.getLowerBoundUnitPrice() != null) {
                predicates.add(
                        cb.greaterThanOrEqualTo(root.get("unitPrice"), filterRequest.getLowerBoundUnitPrice())
                );
            }

            predicates.add(cb.equal(root.get("status"), RecordStatus.active));

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<MenuItem> menuItemPage = menuItemRepository.findAll(spec, pageable);
        List<MenuItem> menuItemList = menuItemPage.getContent();

        List<MenuItemResponse> responseList = menuItemList
                .stream()
                .map(menuItem -> {
                  return menuItemMapper
                          .toResponse(menuItem,
                                  locationRepository.findByIdAndStatus(menuItem.getLocationId(), RecordStatus.active)
                                          .orElse(null),
                                  categoryMenuItemRepository.findCategoryMenuItemByIdAndStatus(menuItem.getCategoryMenuItemsId(), RecordStatus.active)
                                          .orElse(null));

                }).toList();

        return new SimplePage<>(
                responseList,
                menuItemPage.getTotalElements(),
                pageable
        );
    }

    @Transactional
    @Override
    public MenuItemResponse changeStatusMenuItem(Integer id) {
        MenuItem menuItem = menuItemRepository.findById(id)
                .orElseThrow(() -> new AppException(ERROR_CODE.MENU_ITEM_NOT_EXISTED));

        CategoryMenuItem categoryMenuItem = categoryMenuItemRepository
                .findCategoryMenuItemByIdAndStatus(menuItem.getCategoryMenuItemsId(), RecordStatus.active)
                .orElseThrow(() -> new AppException(ERROR_CODE.CATEGORY_MENU_ITEM_NOT_EXISTED));

        Location location = locationRepository
                .findByIdAndStatus(menuItem.getLocationId(), RecordStatus.active)
                .orElseThrow(() -> new AppException(ERROR_CODE.LOCATION_NOT_EXISTED));

        if(menuItem.getStatus() == RecordStatus.active) {
            menuItem.setStatus(RecordStatus.inactive);
        } else {
            menuItem.setStatus(RecordStatus.active);
        }

        return menuItemMapper.toResponse(menuItem, location, categoryMenuItem);
    }
}
