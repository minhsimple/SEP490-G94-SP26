package vn.edu.fpt.util;

import vn.edu.fpt.dto.response.image.ImageUrlsResponseDTO;
import vn.edu.fpt.entity.MenuItem;
import vn.edu.fpt.service.ImageAssetService;

public class MenuItemUtil {
    public static ImageUrlsResponseDTO getPresignedImageUrls(ImageAssetService imageAssetService, MenuItem menuItem) throws Exception {
        if (menuItem == null || menuItem.getImageOrigKey() == null) {
            return null;
        }

        String originalUrl = imageAssetService.preSignedUrl(menuItem.getImageOrigKey(), 60);
        String thumbUrl = menuItem.getImageThumbKey() != null ? imageAssetService.preSignedUrl(menuItem.getImageThumbKey(), 60) : null;
        String mediumUrl = menuItem.getImageMediumKey() != null ? imageAssetService.preSignedUrl(menuItem.getImageMediumKey(), 60) : null;
        String largeUrl = menuItem.getImageLargeKey() != null ? imageAssetService.preSignedUrl(menuItem.getImageLargeKey(), 60) : null;

        return new ImageUrlsResponseDTO(originalUrl, thumbUrl, mediumUrl, largeUrl);
    }
}
