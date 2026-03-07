package vn.edu.fpt.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import vn.edu.fpt.dto.response.ApiResponse;
import vn.edu.fpt.service.ImageAssetService;
import vn.edu.fpt.util.enums.ImageCategory;
import vn.edu.fpt.util.enums.ImageVariant;
import vn.edu.fpt.util.image.ImageStorageResult;
import vn.edu.fpt.dto.response.image.ImageUrlsResponseDTO;

@RestController
@RequestMapping("/api/v1/images")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ImageController {
    private final ImageAssetService imageAssetService;

    @PostMapping("/upload")
    public ApiResponse<ImageUrlsResponseDTO> uploadImage(
            @RequestParam ImageCategory category,
            @RequestParam Integer entityId,
            MultipartFile file
            ) throws Exception {
        ImageStorageResult imageStorageResult = imageAssetService.uploadImageSet(category, entityId, file);
        ImageUrlsResponseDTO responseDTO = new ImageUrlsResponseDTO();
        responseDTO.setOriginalUrl(imageAssetService.preSignedUrl(imageStorageResult.originalKey(), 60));
        responseDTO.setThumbnailUrl(imageAssetService.preSignedUrl(imageStorageResult.variantKeys().getOrDefault(ImageVariant.THUMB, ""), 60));
        responseDTO.setMediumUrl(imageAssetService.preSignedUrl(imageStorageResult.variantKeys().getOrDefault(ImageVariant.MEDIUM, ""), 60));
        responseDTO.setLargeUrl(imageAssetService.preSignedUrl(imageStorageResult.variantKeys().getOrDefault(ImageVariant.LARGE, ""), 60));
        return ApiResponse.success(responseDTO);
    }
}
