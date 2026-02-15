package vn.edu.fpt.service.impl;

import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.fpt.dto.SimplePage;
import vn.edu.fpt.dto.request.categorymenuitem.CategoryMenuItemFilterRequest;
import vn.edu.fpt.dto.request.categorymenuitem.CategoryMenuItemRequest;
import vn.edu.fpt.dto.response.categorymenuitem.CategoryMenuItemResponse;
import vn.edu.fpt.entity.CategoryMenuItem;
import vn.edu.fpt.enums.RecordStatus;
import vn.edu.fpt.exception.AppException;
import vn.edu.fpt.exception.ERROR_CODE;
import vn.edu.fpt.mapper.CategoryMenuItemMapper;
import vn.edu.fpt.respository.CategoryMenuItemRepository;
import vn.edu.fpt.service.CategoryMenuItemService;
import vn.edu.fpt.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryMenuItemServiceImpl implements CategoryMenuItemService {
    private final CategoryMenuItemRepository categoryMenuItemRepository;
    private final CategoryMenuItemMapper categoryMenuItemMapper;

    @Override
    public CategoryMenuItemResponse createCategoryMenuItem(CategoryMenuItemRequest categoryMenuItemRequest) {
        CategoryMenuItem categoryMenuItem = categoryMenuItemRepository
                .save(categoryMenuItemMapper.toEntity(categoryMenuItemRequest));
        return categoryMenuItemMapper.toResponse(categoryMenuItem);
    }

    @Transactional
    @Override
    public CategoryMenuItemResponse updateCategoryMenuItem(Integer id, CategoryMenuItemRequest categoryMenuItemRequest) {
        CategoryMenuItem categoryMenuItem = categoryMenuItemRepository
                .findCategoryMenuItemByIdAndStatus(id, RecordStatus.active)
                .orElseThrow(() -> new AppException(ERROR_CODE.CATEGORY_MENU_ITEM_NOT_EXISTED));

        categoryMenuItemMapper.updateEntity(categoryMenuItem, categoryMenuItemRequest);

        return categoryMenuItemMapper.toResponse(categoryMenuItem);
    }

    @Override
    public CategoryMenuItemResponse getCategoryMenuItemById(Integer id) {
        CategoryMenuItem categoryMenuItem = categoryMenuItemRepository
                .findCategoryMenuItemByIdAndStatus(id, RecordStatus.active)
                .orElseThrow(() -> new AppException(ERROR_CODE.CATEGORY_MENU_ITEM_NOT_EXISTED));
        return categoryMenuItemMapper.toResponse(categoryMenuItem);
    }

    @Transactional
    @Override
    public CategoryMenuItemResponse changeStatusCategoryMenuItem(Integer id) {
        CategoryMenuItem categoryMenuItem = categoryMenuItemRepository.findById(id)
                .orElseThrow(() -> new AppException(ERROR_CODE.CATEGORY_MENU_ITEM_NOT_EXISTED));

        if(categoryMenuItem.getStatus() == RecordStatus.active) {
            categoryMenuItem.setStatus(RecordStatus.inactive);
        } else {
            categoryMenuItem.setStatus(RecordStatus.active);
        }

        return categoryMenuItemMapper.toResponse(categoryMenuItem);
    }

    @Override
    public SimplePage<CategoryMenuItemResponse> getAllCategoryMenuItems(Pageable pageable, CategoryMenuItemFilterRequest filterRequest) {
        Specification<CategoryMenuItem> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("status"), RecordStatus.active));

            if (!StringUtils.isNullOrEmptyOrBlank(filterRequest.getName())) {
                predicates.add(cb.like(
                        cb.lower(root.get("name")),
                        "%" + filterRequest.getName().toLowerCase() + "%"
                ));
            }
            if (!StringUtils.isNullOrEmptyOrBlank(filterRequest.getDescription())) {
                predicates.add(cb.like(
                        cb.lower(root.get("description")),
                        "%" + filterRequest.getDescription().toLowerCase() + "%"
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<CategoryMenuItem> categoryMenuItemPage = categoryMenuItemRepository.findAll(spec, pageable);
        List<CategoryMenuItem> categoryMenuItemList = categoryMenuItemPage.getContent();

        List<CategoryMenuItemResponse> categoryMenuItemResponses = categoryMenuItemList
                .stream()
                .map(categoryMenuItemMapper::toResponse)
                .toList();

        return new SimplePage<>(
                categoryMenuItemResponses,
                categoryMenuItemPage.getTotalElements(),
                pageable
        );
    }
}
