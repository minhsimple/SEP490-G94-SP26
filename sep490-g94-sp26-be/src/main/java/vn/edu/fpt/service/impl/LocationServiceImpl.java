package vn.edu.fpt.service.impl;

import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import vn.edu.fpt.dto.SimplePage;
import vn.edu.fpt.dto.request.location.LocationRequest;
import vn.edu.fpt.dto.response.location.LocationResponse;
import vn.edu.fpt.entity.Location;
import vn.edu.fpt.enums.RecordStatus;
import vn.edu.fpt.exception.AppException;
import vn.edu.fpt.exception.ERROR_CODE;
import vn.edu.fpt.mapper.LocationMapper;
import vn.edu.fpt.respository.LocationRepository;
import vn.edu.fpt.service.LocationService;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LocationServiceImpl implements LocationService {
    private final LocationRepository locationRepository;
    private final LocationMapper locationMapper;

    @Override
    public LocationResponse createLocation(LocationRequest request) {
        if (request == null) {
            throw new AppException(ERROR_CODE.INVALID_REQUEST);
        }
        if (locationRepository.existsByCodeAndStatus(request.getCode(), RecordStatus.active)) {
            throw new AppException(ERROR_CODE.LOCATION_EXISTED);
        }

        Location location = locationMapper.toEntity(request);
        Location saved = locationRepository.save(location);
        return locationMapper.toResponse(saved);
    }

    @Override
    public LocationResponse updateLocation(Integer id, LocationRequest request) {
        Location location = locationRepository.findByIdAndStatus(id, RecordStatus.active)
                .orElseThrow(() -> new AppException(ERROR_CODE.LOCATION_NOT_EXISTED));
        if (locationRepository.existsByCodeAndStatusAndIdNot(
                request.getCode(),
                RecordStatus.active,
                id
        )) {
            throw new AppException(ERROR_CODE.LOCATION_EXISTED);
        }

        locationMapper.updateEntity(location, request);
        Location saved = locationRepository.save(location);
        return locationMapper.toResponse(saved);
    }

    @Override
    public LocationResponse getLocationById(Integer id) {
        Location location = locationRepository.findByIdAndStatus(id, RecordStatus.active)
                .orElseThrow(() -> new AppException(ERROR_CODE.LOCATION_NOT_EXISTED));

        return locationMapper.toResponse(location);
    }

    @Override
    public SimplePage<LocationResponse> getAllLocations(Pageable pageable, LocationRequest filter) {
        Specification<Location> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter != null) {
                if (filter.getCode() != null && !filter.getCode().isBlank()) {
                    predicates.add(cb.like(cb.lower(root.get("code")),
                            "%" + filter.getCode().toLowerCase() + "%"));
                }

                if (filter.getName() != null && !filter.getName().isBlank()) {
                    predicates.add(cb.like(cb.lower(root.get("name")),
                            "%" + filter.getName().toLowerCase() + "%"));
                }

                if (filter.getAddress() != null && !filter.getAddress().isBlank()) {
                    predicates.add(cb.like(cb.lower(root.get("address")),
                            "%" + filter.getAddress().toLowerCase() + "%"));
                }

                if (filter.getNotes() != null && !filter.getNotes().isBlank()) {
                    predicates.add(cb.like(cb.lower(root.get("notes")),
                            "%" + filter.getNotes().toLowerCase() + "%"));
                }
            }

            // always filter active
            predicates.add(cb.equal(root.get("status"), RecordStatus.active));

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Location> page = locationRepository.findAll(spec, pageable);

        List<LocationResponse> responses = page.getContent()
                .stream()
                .map(locationMapper::toResponse)
                .collect(Collectors.toList());

        return new SimplePage<>(
                responses,
                page.getTotalElements(),
                pageable
        );
    }

    @Override
    public LocationResponse changeLocationStatus(Integer id) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new AppException(ERROR_CODE.LOCATION_NOT_EXISTED));

        if (location.getStatus() == RecordStatus.active) {
            location.setStatus(RecordStatus.inactive);
        } else {
            location.setStatus(RecordStatus.active);
        }

        Location saved = locationRepository.save(location);
        return locationMapper.toResponse(saved);
    }
}
