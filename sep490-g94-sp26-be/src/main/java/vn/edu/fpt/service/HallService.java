package vn.edu.fpt.service;

import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import vn.edu.fpt.dto.SimplePage;
import vn.edu.fpt.dto.request.hall.HallFilterRequest;
import vn.edu.fpt.dto.request.hall.HallRequest;
import vn.edu.fpt.dto.response.hall.HallResponse;

public interface HallService {
    HallResponse createHall(@Valid HallRequest request);

    HallResponse updateHall(Integer id, @Valid HallRequest request);

    HallResponse getHallById(Integer id);

    SimplePage<HallResponse> searchHalls(Pageable pageable, HallFilterRequest filter);

    HallResponse changeHallStatus(Integer id);
}

