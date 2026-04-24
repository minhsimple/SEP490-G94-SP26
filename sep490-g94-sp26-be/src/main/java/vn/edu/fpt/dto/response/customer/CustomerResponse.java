package vn.edu.fpt.dto.response.customer;

import lombok.*;
import lombok.experimental.FieldDefaults;
import vn.edu.fpt.dto.response.image.ImageUrlsResponseDTO;
import vn.edu.fpt.util.enums.RecordStatus;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CustomerResponse {
    Integer id;

    String citizenIdNumber;

    String fullName;

    String phone;

    String email;

    String address;

    String notes;

    Integer locationId;

    String locationName;

    RecordStatus status;

    List<ImageUrlsResponseDTO> imageUrls;
}
