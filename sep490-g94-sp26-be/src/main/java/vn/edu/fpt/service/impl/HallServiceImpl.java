package vn.edu.fpt.service.impl;

import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.fpt.dto.SimplePage;
import vn.edu.fpt.dto.request.hall.HallFilterRequest;
import vn.edu.fpt.dto.request.hall.HallRequest;
import vn.edu.fpt.dto.response.hall.HallResponse;
import vn.edu.fpt.entity.Hall;
import vn.edu.fpt.entity.Location;
import vn.edu.fpt.enums.RecordStatus;
import vn.edu.fpt.exception.AppException;
import vn.edu.fpt.exception.ERROR_CODE;
import vn.edu.fpt.mapper.HallMapper;
import vn.edu.fpt.respository.HallRepository;
import vn.edu.fpt.respository.LocationRepository;
import vn.edu.fpt.service.HallService;
import vn.edu.fpt.util.StringUtils;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HallServiceImpl implements HallService {
    private final HallRepository hallRepository;
    private final LocationRepository locationRepository;
    private final HallMapper hallMapper;

    @Transactional
    @Override
    public HallResponse createHall(HallRequest request) {
        if (request == null) {
            throw new AppException(ERROR_CODE.INVALID_REQUEST);
        }

        // Validate location exists
        Location location = locationRepository.findByIdAndStatus(request.getLocationId(), RecordStatus.active)
                .orElseThrow(() -> new AppException(ERROR_CODE.LOCATION_NOT_EXISTED));

        // Check if code already exists
        if (hallRepository.existsByCodeAndStatus(request.getCode(), RecordStatus.active)) {
            throw new AppException(ERROR_CODE.HALL_EXISTED);
        }

        Hall hall = hallMapper.toEntity(request);
        hall.setStatus(RecordStatus.active);
        Hall saved = hallRepository.save(hall);

        HallResponse response = hallMapper.toResponse(saved);
        response.setLocationName(location.getName());
        return response;
    }

    @Transactional
    @Override
    public HallResponse updateHall(Integer id, HallRequest request) {
        Hall hall = hallRepository.findByIdAndStatus(id, RecordStatus.active)
                .orElseThrow(() -> new AppException(ERROR_CODE.HALL_NOT_EXISTED));

        // Validate location exists
        Location location = locationRepository.findByIdAndStatus(request.getLocationId(), RecordStatus.active)
                .orElseThrow(() -> new AppException(ERROR_CODE.LOCATION_NOT_EXISTED));

        // Check if code already exists for another hall
        if (hallRepository.existsByCodeAndStatusAndIdNot(request.getCode(), RecordStatus.active, id)) {
            throw new AppException(ERROR_CODE.HALL_EXISTED);
        }

        hallMapper.updateEntity(hall, request);
        Hall saved = hallRepository.save(hall);

        HallResponse response = hallMapper.toResponse(saved);
        response.setLocationName(location.getName());
        return response;
    }

    @Override
    public HallResponse getHallById(Integer id) {
        Hall hall = hallRepository.findByIdAndStatus(id, RecordStatus.active)
                .orElseThrow(() -> new AppException(ERROR_CODE.HALL_NOT_EXISTED));

        Location location = locationRepository.findByIdAndStatus(hall.getLocationId(), RecordStatus.active)
                .orElseThrow(() -> new AppException(ERROR_CODE.LOCATION_NOT_EXISTED));

        HallResponse response = hallMapper.toResponse(hall);
        response.setLocationName(location.getName());
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
            }

            // Always filter active
            predicates.add(cb.equal(root.get("status"), RecordStatus.active));

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

        HallResponse response = hallMapper.toResponse(saved);
        // Try to get location name if available
        locationRepository.findById(saved.getLocationId())
                .ifPresent(location -> response.setLocationName(location.getName()));

        return response;
    }
}

