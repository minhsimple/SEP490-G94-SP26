package vn.edu.fpt.dto.response.image;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ImageUrlsResponseDTO {
    String originalUrl;
    String thumbnailUrl;
    String mediumUrl;
    String largeUrl;
}
