package vn.edu.fpt.service;

import org.springframework.data.domain.Pageable;
import vn.edu.fpt.dto.SimplePage;
import vn.edu.fpt.dto.request.location.LocationRequest;
import vn.edu.fpt.dto.response.location.LocationResponse;

public interface LocationService {
    LocationResponse createLocation(LocationRequest request);

    LocationResponse updateLocation(Integer id, LocationRequest request);

    LocationResponse getLocationById(Integer id);

    SimplePage<LocationResponse> getAllLocations(Pageable pageable, LocationRequest filter);

    LocationResponse changeLocationStatus(Integer id);
}
