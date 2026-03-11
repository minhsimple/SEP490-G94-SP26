package vn.edu.fpt.util;

import vn.edu.fpt.dto.response.image.ImageUrlsResponseDTO;
import vn.edu.fpt.entity.MediaAsset;
import vn.edu.fpt.service.ImageAssetService;

public class MediaAssetUtil {
    public static ImageUrlsResponseDTO getPresignedImageUrls(ImageAssetService imageAssetService, MediaAsset mediaAsset) throws Exception {
        if (mediaAsset == null) {
            return null;
        }

        String originalUrl = imageAssetService.preSignedUrl(mediaAsset.getImageOrigKey(), 60);
        String thumbUrl = mediaAsset.getImageThumbKey() != null ? imageAssetService.preSignedUrl(mediaAsset.getImageThumbKey(), 60) : null;
        String mediumUrl = mediaAsset.getImageMediumKey() != null ? imageAssetService.preSignedUrl(mediaAsset.getImageMediumKey(), 60) : null;
        String largeUrl = mediaAsset.getImageLargeKey() != null ? imageAssetService.preSignedUrl(mediaAsset.getImageLargeKey(), 60) : null;

        return new ImageUrlsResponseDTO(originalUrl, thumbUrl, mediumUrl, largeUrl);
    }
}
