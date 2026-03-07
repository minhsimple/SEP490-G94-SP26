package vn.edu.fpt.service.impl;

import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import vn.edu.fpt.dto.SimplePage;
import vn.edu.fpt.dto.request.menuitem.MenuItemFilterRequest;
import vn.edu.fpt.dto.request.menuitem.MenuItemRequest;
import vn.edu.fpt.dto.response.image.ImageUrlsResponseDTO;
import vn.edu.fpt.dto.response.menuitem.MenuItemResponse;
import vn.edu.fpt.entity.CategoryMenuItem;
import vn.edu.fpt.entity.Location;
import vn.edu.fpt.entity.MenuItem;
import vn.edu.fpt.entity.SetMenuItem;
import vn.edu.fpt.service.ImageAssetService;
import vn.edu.fpt.util.enums.ImageCategory;
import vn.edu.fpt.util.enums.ImageVariant;
import vn.edu.fpt.util.enums.RecordStatus;
import vn.edu.fpt.exception.AppException;
import vn.edu.fpt.exception.ERROR_CODE;
import vn.edu.fpt.mapper.MenuItemMapper;
import vn.edu.fpt.respository.CategoryMenuItemRepository;
import vn.edu.fpt.respository.LocationRepository;
import vn.edu.fpt.respository.MenuItemRepository;
import vn.edu.fpt.respository.SetMenuItemRepository;
import vn.edu.fpt.service.MenuItemService;
import vn.edu.fpt.util.StringUtils;
import vn.edu.fpt.util.image.ImageStorageResult;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MenuItemServiceImpl implements MenuItemService {
    private final MenuItemRepository menuItemRepository;
    private final LocationRepository locationRepository;
    private final CategoryMenuItemRepository categoryMenuItemRepository;
    private final SetMenuItemRepository setMenuItemRepository;
    private final ImageAssetService imageAssetService;

    private final MenuItemMapper menuItemMapper;

    @Transactional
    @Override
    public MenuItemResponse createNewMenuItem(MenuItemRequest request, MultipartFile imageFile) throws Exception {
        CategoryMenuItem categoryMenuItem = categoryMenuItemRepository
                .findCategoryMenuItemByIdAndStatus(request.getCategoryMenuItemsId(), RecordStatus.active)
                .orElseThrow(() -> new AppException(ERROR_CODE.CATEGORY_MENU_ITEM_NOT_EXISTED));

        Location location = locationRepository
                .findByIdAndStatus(request.getLocationId(), RecordStatus.active)
                .orElseThrow(() -> new AppException(ERROR_CODE.LOCATION_NOT_EXISTED));

        if (menuItemRepository.existsByCodeAndLocationId(request.getCode(), request.getLocationId())) {
            throw new AppException(ERROR_CODE.MENU_ITEM_CODE_EXISTED_SAME_LOCATION);
        }

        MenuItem menuItem = menuItemMapper.toEntity(request);
        menuItem = menuItemRepository.save(menuItem);

        ImageStorageResult imageStorageResult = imageAssetService.uploadImageSet(ImageCategory.MENU_ITEM, menuItem.getId(), imageFile);
        menuItem.setImageOrigKey(imageStorageResult.originalKey());
        menuItem.setImageThumbKey(imageStorageResult.variantKeys().getOrDefault(ImageVariant.THUMB, null));
        menuItem.setImageMediumKey(imageStorageResult.variantKeys().getOrDefault(ImageVariant.MEDIUM, null));
        menuItem.setImageLargeKey(imageStorageResult.variantKeys().getOrDefault(ImageVariant.LARGE, null));

        MenuItemResponse menuItemResponse = menuItemMapper.toResponse(menuItem, location, categoryMenuItem);
        menuItemResponse.setImageUrls(getPresignedImageUrls(menuItem));

        return menuItemResponse;
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

        if (menuItemRepository.existsByCodeAndLocationIdAndIdNot(request.getCode(), request.getLocationId(), id)) {
            throw new AppException(ERROR_CODE.MENU_ITEM_CODE_EXISTED_SAME_LOCATION);
        }

        menuItemMapper.updateEntity(menuItem, request);

        return menuItemMapper.toResponse(menuItem, location, categoryMenuItem);
    }

    @Override
    public MenuItemResponse getMenuItemById(Integer id) throws Exception {
        MenuItem menuItem = menuItemRepository.findById(id)
                .orElseThrow(() -> new AppException(ERROR_CODE.MENU_ITEM_NOT_EXISTED));

        CategoryMenuItem categoryMenuItem = categoryMenuItemRepository
                .findById(menuItem.getCategoryMenuItemsId())
                .orElseThrow(() -> new AppException(ERROR_CODE.CATEGORY_MENU_ITEM_NOT_EXISTED));

        Location location = locationRepository
                .findById(menuItem.getLocationId())
                .orElseThrow(() -> new AppException(ERROR_CODE.LOCATION_NOT_EXISTED));

        MenuItemResponse menuItemResponse = menuItemMapper.toResponse(menuItem, location, categoryMenuItem);
        menuItemResponse.setImageUrls(getPresignedImageUrls(menuItem));

        return menuItemResponse;
    }

    @Override
    public SimplePage<MenuItemResponse> getAllMenuItems(Pageable pageable, MenuItemFilterRequest filterRequest) {
        Specification<MenuItem> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (!StringUtils.isNullOrEmptyOrBlank(filterRequest.getCode())) {
                predicates.add(
                        cb.like(cb.lower(root.get("code")), "%" + filterRequest.getCode().toLowerCase() + "%")
                );
            }
            if (!StringUtils.isNullOrEmptyOrBlank(filterRequest.getName())) {
                predicates.add(
                        cb.like(cb.lower(root.get("name")), "%" + filterRequest.getName().toLowerCase() + "%")
                );
            }
            if (!StringUtils.isNullOrEmptyOrBlank(filterRequest.getDescription())) {
                predicates.add(
                        cb.like(cb.lower(root.get("description")), "%" + filterRequest.getDescription().toLowerCase() + "%")
                );
            }
            if (filterRequest.getLocationId() != null) {
                predicates.add(
                        cb.equal(root.get("locationId"), filterRequest.getLocationId())
                );
            }
            if (filterRequest.getCategoryMenuItemsId() != null) {
                predicates.add(
                        cb.equal(root.get("categoryMenuItemsId"), filterRequest.getCategoryMenuItemsId())
                );
            }
            if (filterRequest.getUpperBoundUnitPrice() != null && filterRequest.getLowerBoundUnitPrice() != null) {
                predicates.add(
                        cb.between(root.get("unitPrice"), filterRequest.getLowerBoundUnitPrice(), filterRequest.getUpperBoundUnitPrice())
                );
            } else if (filterRequest.getUpperBoundUnitPrice() != null) {
                predicates.add(
                        cb.lessThanOrEqualTo(root.get("unitPrice"), filterRequest.getUpperBoundUnitPrice())
                );
            } else if (filterRequest.getLowerBoundUnitPrice() != null) {
                predicates.add(
                        cb.greaterThanOrEqualTo(root.get("unitPrice"), filterRequest.getLowerBoundUnitPrice())
                );
            }

            if (filterRequest.getStatus() != null) {
                predicates.add(cb.equal(root.get("status"), filterRequest.getStatus()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<MenuItem> menuItemPage = menuItemRepository.findAll(spec, pageable);
        List<MenuItem> menuItemList = menuItemPage.getContent();

        List<MenuItemResponse> responseList = menuItemList
                .stream()
                .map(menuItem -> {
                    MenuItemResponse menuItemResponse = menuItemMapper
                            .toResponse(menuItem,
                                    locationRepository.findById(menuItem.getLocationId())
                                            .orElse(null),
                                    categoryMenuItemRepository.findById(menuItem.getCategoryMenuItemsId())
                                            .orElse(null));
                    try {
                        menuItemResponse.setImageUrls(getPresignedImageUrls(menuItem));
                    } catch (Exception e) {
                        menuItemResponse.setImageUrls(null);
                    }
                    return menuItemResponse;
                }).toList();

        return new SimplePage<>(
                responseList,
                menuItemPage.getTotalElements(),
                pageable
        );
    }

    @Transactional
    @Override
    public MenuItemResponse changeStatusMenuItem(Integer id) throws Exception {
        MenuItem menuItem = menuItemRepository.findById(id)
                .orElseThrow(() -> new AppException(ERROR_CODE.MENU_ITEM_NOT_EXISTED));

        CategoryMenuItem categoryMenuItem = categoryMenuItemRepository
                .findById(menuItem.getCategoryMenuItemsId())
                .orElseThrow(() -> new AppException(ERROR_CODE.CATEGORY_MENU_ITEM_NOT_EXISTED));

        Location location = locationRepository
                .findById(menuItem.getLocationId())
                .orElseThrow(() -> new AppException(ERROR_CODE.LOCATION_NOT_EXISTED));

        if (menuItem.getStatus() == RecordStatus.active) {
            menuItem.setStatus(RecordStatus.inactive);
        } else {
            menuItem.setStatus(RecordStatus.active);
        }

        List<SetMenuItem> setMenuItemList = setMenuItemRepository.findAllByMenuItemIdAndStatus(id, RecordStatus.active);
        setMenuItemList.forEach(setMenuItem -> setMenuItem.setStatus(menuItem.getStatus()));

        MenuItemResponse menuItemResponse = menuItemMapper.toResponse(menuItem, location, categoryMenuItem);
        menuItemResponse.setImageUrls(getPresignedImageUrls(menuItem));

        return menuItemResponse;
    }

    private ImageUrlsResponseDTO getPresignedImageUrls(MenuItem menuItem) throws Exception {
        if (menuItem == null || menuItem.getImageOrigKey() == null) {
            return null;
        }

        String originalUrl = imageAssetService.preSignedUrl(menuItem.getImageOrigKey(), 60);
        String thumbUrl = menuItem.getImageThumbKey() != null ? imageAssetService.preSignedUrl(menuItem.getImageThumbKey(), 60) : null;
        String mediumUrl = menuItem.getImageMediumKey() != null ? imageAssetService.preSignedUrl(menuItem.getImageMediumKey(), 60) : null;
        String largeUrl = menuItem.getImageLargeKey() != null ? imageAssetService.preSignedUrl(menuItem.getImageLargeKey(), 60) : null;

        return new ImageUrlsResponseDTO(originalUrl, thumbUrl, mediumUrl, largeUrl);
    }
}
