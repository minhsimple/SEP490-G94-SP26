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
import vn.edu.fpt.dto.response.menuitem.MenuItemResponse;
import vn.edu.fpt.entity.*;
import vn.edu.fpt.respository.*;
import vn.edu.fpt.service.ImageAssetService;
import vn.edu.fpt.util.MediaAssetUtil;
import vn.edu.fpt.util.enums.ImageCategory;
import vn.edu.fpt.util.enums.ImageVariant;
import vn.edu.fpt.util.enums.MediaAssetOwnerType;
import vn.edu.fpt.util.enums.RecordStatus;
import vn.edu.fpt.exception.AppException;
import vn.edu.fpt.exception.ERROR_CODE;
import vn.edu.fpt.mapper.MenuItemMapper;
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
    private final MediaAssetRepository mediaAssetRepository;
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

        MediaAsset mediaAsset = uploadMenuItemImage(imageFile, menuItem.getId(), null);

        MenuItemResponse menuItemResponse = menuItemMapper.toResponse(menuItem, location, categoryMenuItem);
        menuItemResponse.setImageUrls(MediaAssetUtil.getPresignedImageUrls(imageAssetService, mediaAsset));

        return menuItemResponse;
    }

    @Transactional
    @Override
    public MenuItemResponse updateMenuItem(Integer id, MenuItemRequest request, MultipartFile imageFile) throws Exception {
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

        List<MediaAsset> mediaAssetList = mediaAssetRepository.findMediaAssetByOwnerIdAndOwnerType(menuItem.getId(), MediaAssetOwnerType.MENU_ITEM);
        MediaAsset mediaAsset = !mediaAssetList.isEmpty() ? mediaAssetList.getFirst() : null;

        if (imageFile != null && !imageFile.isEmpty()) {
            if (mediaAsset != null) {
                imageAssetService.deleteFolder(mediaAsset.getImageOrigKey());
            }
            mediaAsset = uploadMenuItemImage(imageFile, menuItem.getId(), mediaAsset);
        }

        menuItemMapper.updateEntity(menuItem, request);
        MenuItemResponse menuItemResponse = menuItemMapper.toResponse(menuItem, location, categoryMenuItem);
        menuItemResponse.setImageUrls(MediaAssetUtil.getPresignedImageUrls(imageAssetService, mediaAsset));

        return menuItemResponse;
    }

    private MediaAsset uploadMenuItemImage(MultipartFile imageFile, Integer menuItemId, MediaAsset mediaAsset) throws Exception {
        ImageStorageResult imageStorageResult = imageAssetService.uploadImageSet(ImageCategory.MENU_ITEM, menuItemId, imageFile);
        if(mediaAsset == null) {
            mediaAsset = mediaAssetRepository.save(MediaAsset.builder()
                    .ownerId(menuItemId)
                    .ownerType(MediaAssetOwnerType.MENU_ITEM)
                    .imageOrigKey(imageStorageResult.originalKey())
                    .imageThumbKey(imageStorageResult.variantKeys().getOrDefault(ImageVariant.THUMB, null))
                    .imageMediumKey(imageStorageResult.variantKeys().getOrDefault(ImageVariant.MEDIUM, null))
                    .imageLargeKey(imageStorageResult.variantKeys().getOrDefault(ImageVariant.LARGE, null))
                    .build());
        } else {
            mediaAsset.setImageOrigKey(imageStorageResult.originalKey());
            mediaAsset.setImageThumbKey(imageStorageResult.variantKeys().getOrDefault(ImageVariant.THUMB, null));
            mediaAsset.setImageMediumKey(imageStorageResult.variantKeys().getOrDefault(ImageVariant.MEDIUM, null));
            mediaAsset.setImageLargeKey(imageStorageResult.variantKeys().getOrDefault(ImageVariant.LARGE, null));
        }
        return mediaAsset;
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

        List<MediaAsset> mediaAssetList = mediaAssetRepository.findMediaAssetByOwnerIdAndOwnerType(menuItem.getId(), MediaAssetOwnerType.MENU_ITEM);
        MediaAsset mediaAsset = !mediaAssetList.isEmpty() ? mediaAssetList.getFirst() : null;

        MenuItemResponse menuItemResponse = menuItemMapper.toResponse(menuItem, location, categoryMenuItem);
        menuItemResponse.setImageUrls(MediaAssetUtil.getPresignedImageUrls(imageAssetService, mediaAsset));

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
                        List<MediaAsset> mediaAssetList = mediaAssetRepository.findMediaAssetByOwnerIdAndOwnerType(menuItem.getId(), MediaAssetOwnerType.MENU_ITEM);
                        MediaAsset mediaAsset = !mediaAssetList.isEmpty() ? mediaAssetList.getFirst() : null;
                        menuItemResponse.setImageUrls(MediaAssetUtil.getPresignedImageUrls(imageAssetService, mediaAsset));
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

        List<MediaAsset> mediaAssetList = mediaAssetRepository.findMediaAssetByOwnerIdAndOwnerType(menuItem.getId(), MediaAssetOwnerType.MENU_ITEM);
        MediaAsset mediaAsset = !mediaAssetList.isEmpty() ? mediaAssetList.getFirst() : null;

        menuItemResponse.setImageUrls(MediaAssetUtil.getPresignedImageUrls(imageAssetService, mediaAsset));

        return menuItemResponse;
    }
}
