package vn.edu.fpt.service;

import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;
import vn.edu.fpt.dto.SimplePage;
import vn.edu.fpt.dto.request.hall.HallFilterRequest;
import vn.edu.fpt.dto.request.hall.HallRequest;
import vn.edu.fpt.dto.response.hall.HallResponse;

import java.util.List;

public interface HallService {
    HallResponse createHall(@Valid HallRequest request, List<MultipartFile> imageFiles) throws Exception;

    HallResponse updateHall(Integer id, @Valid HallRequest request);

    HallResponse getHallById(Integer id);

    SimplePage<HallResponse> searchHalls(Pageable pageable, HallFilterRequest filter);

    HallResponse changeHallStatus(Integer id);
}

