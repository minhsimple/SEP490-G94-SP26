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
import vn.edu.fpt.dto.request.hall.HallFilterRequest;
import vn.edu.fpt.dto.request.hall.HallRequest;
import vn.edu.fpt.dto.response.hall.HallResponse;
import vn.edu.fpt.dto.response.image.ImageUrlsResponseDTO;
import vn.edu.fpt.entity.Hall;
import vn.edu.fpt.entity.Location;
import vn.edu.fpt.entity.MediaAsset;
import vn.edu.fpt.respository.MediaAssetRepository;
import vn.edu.fpt.service.ImageAssetService;
import vn.edu.fpt.util.MediaAssetUtil;
import vn.edu.fpt.util.enums.ImageCategory;
import vn.edu.fpt.util.enums.ImageVariant;
import vn.edu.fpt.util.enums.MediaAssetOwnerType;
import vn.edu.fpt.util.enums.RecordStatus;
import vn.edu.fpt.exception.AppException;
import vn.edu.fpt.exception.ERROR_CODE;
import vn.edu.fpt.mapper.HallMapper;
import vn.edu.fpt.respository.HallRepository;
import vn.edu.fpt.respository.LocationRepository;
import vn.edu.fpt.service.HallService;
import vn.edu.fpt.util.StringUtils;
import vn.edu.fpt.util.image.ImageStorageResult;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HallServiceImpl implements HallService {
    private final HallRepository hallRepository;
    private final LocationRepository locationRepository;
    private final HallMapper hallMapper;
    private final MediaAssetRepository mediaAssetRepository;

    private final ImageAssetService imageAssetService;

    @Transactional
    @Override
    public HallResponse createHall(HallRequest request, List<MultipartFile> imageFiles) throws Exception {
        if (request == null) {
            throw new AppException(ERROR_CODE.INVALID_REQUEST);
        }

        // Validate location exists
        Location location = locationRepository.findByIdAndStatus(request.getLocationId(), RecordStatus.active)
                .orElseThrow(() -> new AppException(ERROR_CODE.LOCATION_NOT_EXISTED));

        // Check if code already exists
        if (hallRepository.existsByCode(request.getCode())) {
            throw new AppException(ERROR_CODE.HALL_EXISTED);
        }


        Hall hall = hallMapper.toEntity(request);
        hall.setStatus(RecordStatus.active);
        Hall saved = hallRepository.save(hall);

        List<MediaAsset> mediaAssets = MediaAssetUtil.uploadListImageAssets(imageAssetService, mediaAssetRepository, imageFiles, saved.getId(), MediaAssetOwnerType.HALL, null);

        HallResponse response = hallMapper.toResponse(saved);
        response.setLocationName(location.getName());
        response.setImageUrls(MediaAssetUtil.getPresignedListImageUrls(imageAssetService, mediaAssets));

        return response;
    }

    @Transactional
    @Override
    public HallResponse updateHall(Integer id, HallRequest request, List<MultipartFile> imageFiles) throws Exception {
        Hall hall = hallRepository.findById(id)
                .orElseThrow(() -> new AppException(ERROR_CODE.HALL_NOT_EXISTED));

        // Validate location exists
        Location location = locationRepository.findByIdAndStatus(request.getLocationId(), RecordStatus.active)
                .orElseThrow(() -> new AppException(ERROR_CODE.LOCATION_NOT_EXISTED));

        // Check if code already exists for another hall
        if (hallRepository.existsByCodeAndIdNot(request.getCode(), id)) {
            throw new AppException(ERROR_CODE.HALL_EXISTED);
        }

        hallMapper.updateEntity(hall, request);
        Hall saved = hallRepository.save(hall);

        List<MediaAsset> mediaAssetList = MediaAssetUtil.getListMediaAssetByEntityIdAndOwnerType(mediaAssetRepository, saved.getId(), MediaAssetOwnerType.HALL);
        if (imageFiles != null && !imageFiles.isEmpty()) {
            if (mediaAssetList != null && !mediaAssetList.isEmpty()) {
                imageAssetService.deleteFolder(mediaAssetList.getFirst().getImageOrigKey());
            }
            mediaAssetList = MediaAssetUtil.uploadListImageAssets(imageAssetService, mediaAssetRepository, imageFiles, saved.getId(), MediaAssetOwnerType.HALL, mediaAssetList);
        }

        HallResponse response = hallMapper.toResponse(saved);
        response.setLocationName(location.getName());
        response.setImageUrls(MediaAssetUtil.getPresignedListImageUrls(imageAssetService, mediaAssetList));
        return response;
    }

    @Override
    public HallResponse getHallById(Integer id) {
        Hall hall = hallRepository.findById(id)
                .orElseThrow(() -> new AppException(ERROR_CODE.HALL_NOT_EXISTED));

        Location location = locationRepository.findByIdAndStatus(hall.getLocationId(), RecordStatus.active)
                .orElseThrow(() -> new AppException(ERROR_CODE.LOCATION_NOT_EXISTED));

        List<MediaAsset> mediaAssets = MediaAssetUtil.getListMediaAssetByEntityIdAndOwnerType(mediaAssetRepository, hall.getId(), MediaAssetOwnerType.HALL);

        HallResponse response = hallMapper.toResponse(hall);
        response.setLocationName(location.getName());
        response.setImageUrls(MediaAssetUtil.getPresignedListImageUrls(imageAssetService, mediaAssets));

        return response;
    }

    @Override
    public SimplePage<HallResponse> searchHalls(Pageable pageable, HallFilterRequest filter) {
        Specification<Hall> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter != null) {
                if (!StringUtils.isNullOrEmptyOrBlank(filter.getCode())) {
                    predicates.add(cb.like(cb.lower(root.get("code")),
                            "%" + filter.getCode().toLowerCase() + "%"));
                }

                if (!StringUtils.isNullOrEmptyOrBlank(filter.getName())) {
                    predicates.add(cb.like(cb.lower(root.get("name")),
                            "%" + filter.getName().toLowerCase() + "%"));
                }

                if (filter.getLocationId() != null) {
                    predicates.add(cb.equal(root.get("locationId"), filter.getLocationId()));
                }

                if (filter.getMinCapacity() != null && filter.getMaxCapacity() != null) {
                    predicates.add(cb.between(root.get("capacity"),
                            filter.getMinCapacity(), filter.getMaxCapacity()));
                } else if (filter.getMinCapacity() != null) {
                    predicates.add(cb.greaterThanOrEqualTo(root.get("capacity"),
                            filter.getMinCapacity()));
                } else if (filter.getMaxCapacity() != null) {
                    predicates.add(cb.lessThanOrEqualTo(root.get("capacity"),
                            filter.getMaxCapacity()));
                }

                if (!StringUtils.isNullOrEmptyOrBlank(filter.getNotes())) {
                    predicates.add(cb.like(cb.lower(root.get("notes")),
                            "%" + filter.getNotes().toLowerCase() + "%"));
                }
                if (filter.getStatus() != null) {
                    predicates.add(cb.equal(root.get("status"), filter.getStatus()));
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Hall> page = hallRepository.findAll(spec, pageable);
        List<Hall> hallList = page.getContent();

        // Get all unique location IDs
        Set<Integer> locationIds = hallList.stream()
                .map(Hall::getLocationId)
                .collect(Collectors.toSet());

        // Fetch all locations in one query
        Map<Integer, Location> locationMap = locationRepository.findAllById(locationIds)
                .stream()
                .collect(Collectors.toMap(Location::getId, location -> location));

        // Map to response
        List<HallResponse> responses = hallList.stream()
                .map(hall -> {
                    HallResponse response = hallMapper.toResponse(hall);
                    List<MediaAsset> mediaAssets = MediaAssetUtil.getListMediaAssetByEntityIdAndOwnerType(mediaAssetRepository, hall.getId(), MediaAssetOwnerType.HALL);
                    response.setImageUrls(MediaAssetUtil.getPresignedListImageUrls(imageAssetService, mediaAssets));
                    Location location = locationMap.get(hall.getLocationId());
                    if (location != null) {
                        response.setLocationName(location.getName());
                    }
                    return response;
                })
                .collect(Collectors.toList());

        return new SimplePage<>(
                responses,
                page.getTotalElements(),
                pageable
        );
    }

    @Transactional
    @Override
    public HallResponse changeHallStatus(Integer id) {
        Hall hall = hallRepository.findById(id)
                .orElseThrow(() -> new AppException(ERROR_CODE.HALL_NOT_EXISTED));

        if (hall.getStatus() == RecordStatus.active) {
            hall.setStatus(RecordStatus.inactive);
        } else {
            hall.setStatus(RecordStatus.active);
        }

        Hall saved = hallRepository.save(hall);

        List<MediaAsset> mediaAssetList = MediaAssetUtil.getListMediaAssetByEntityIdAndOwnerType(mediaAssetRepository, saved.getId(), MediaAssetOwnerType.HALL);
        HallResponse response = hallMapper.toResponse(saved);
        // Try to get location name if available
        locationRepository.findById(saved.getLocationId())
                .ifPresent(location -> response.setLocationName(location.getName()));

        response.setImageUrls(MediaAssetUtil.getPresignedListImageUrls(imageAssetService, mediaAssetList));

        return response;
    }
}

