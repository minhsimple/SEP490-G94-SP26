package vn.edu.fpt.dto.response.hall;

import lombok.*;
import lombok.experimental.FieldDefaults;
import vn.edu.fpt.dto.response.image.ImageUrlsResponseDTO;
import vn.edu.fpt.util.enums.RecordStatus;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class HallResponse {
    Integer id;
    String code;
    String name;
    Integer locationId;
    String locationName;
    Integer capacity;
    String notes;
    RecordStatus status;
    List<ImageUrlsResponseDTO> imageUrls;
}

