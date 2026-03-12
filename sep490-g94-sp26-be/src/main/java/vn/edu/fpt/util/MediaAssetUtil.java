package vn.edu.fpt.util;

import org.springframework.web.multipart.MultipartFile;
import vn.edu.fpt.dto.response.image.ImageUrlsResponseDTO;
import vn.edu.fpt.entity.MediaAsset;
import vn.edu.fpt.respository.MediaAssetRepository;
import vn.edu.fpt.service.ImageAssetService;
import vn.edu.fpt.util.enums.ImageCategory;
import vn.edu.fpt.util.enums.ImageVariant;
import vn.edu.fpt.util.enums.MediaAssetOwnerType;
import vn.edu.fpt.util.image.ImageStorageResult;

import java.util.List;
import java.util.stream.Collectors;

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

    public static MediaAsset uploadImageAsset(
            ImageAssetService imageAssetService,
            MediaAssetRepository mediaAssetRepository,
            MultipartFile imageFile,
            Integer entityId,
            MediaAssetOwnerType mediaAssetOwnerType,
            MediaAsset mediaAsset) throws Exception {
        ImageStorageResult imageStorageResult = imageAssetService.uploadImageSet(getImageCategoryForAsset(mediaAssetOwnerType), entityId, imageFile);
        if (mediaAsset == null) {
            mediaAsset = mediaAssetRepository.save(MediaAsset.builder()
                    .ownerId(entityId)
                    .ownerType(mediaAssetOwnerType)
                    .imageOrigKey(imageStorageResult.originalKey())
                    .imageThumbKey(imageStorageResult.variantKeys().getOrDefault(ImageVariant.THUMB, null))
                    .imageMediumKey(imageStorageResult.variantKeys().getOrDefault(ImageVariant.MEDIUM, null))
                    .imageLargeKey(imageStorageResult.variantKeys().getOrDefault(ImageVariant.LARGE, null))
                    .build());
        } else {
            mediaAsset.setImageOrigKey(imageStorageResult.originalKey());
            mediaAsset.setImageThumbKey(imageStorageResult.variantKeys().getOrDefault(ImageVariant.THUMB, null));
            mediaAsset.setImageMediumKey(imageStorageResult.variantKeys().getOrDefault(ImageVariant.MEDIUM, null));
            mediaAsset.setImageLargeKey(imageStorageResult.variantKeys().getOrDefault(ImageVariant.LARGE, null));
        }
        return mediaAsset;
    }

    public static List<ImageUrlsResponseDTO> getPresignedListImageUrls(ImageAssetService imageAssetService, List<MediaAsset> mediaAssetList) {
        if (mediaAssetList == null || mediaAssetList.isEmpty()) {
            return null;
        }
        return mediaAssetList.stream()
                .map(mediaAsset -> {
                    try {
                        return ImageUrlsResponseDTO.builder()
                                .originalUrl(mediaAsset.getImageOrigKey() != null ? imageAssetService.preSignedUrl(mediaAsset.getImageOrigKey(), 60) : null)
                                .thumbnailUrl(mediaAsset.getImageThumbKey() != null ? imageAssetService.preSignedUrl(mediaAsset.getImageThumbKey(), 60) : null)
                                .mediumUrl(mediaAsset.getImageMediumKey() != null ? imageAssetService.preSignedUrl(mediaAsset.getImageMediumKey(), 60) : null)
                                .largeUrl(mediaAsset.getImageLargeKey() != null ? imageAssetService.preSignedUrl(mediaAsset.getImageLargeKey(), 60) : null)
                                .build();
                    } catch (Exception e) {
                        throw new RuntimeException(e);
                    }
                })
                .collect(Collectors.toList());
    }

    public static List<MediaAsset> uploadListImageAssets(
            ImageAssetService imageAssetService,
            MediaAssetRepository mediaAssetRepository,
            List<MultipartFile> imageFiles,
            Integer entityId,
            MediaAssetOwnerType mediaAssetOwnerType
    ) throws Exception {
        List<ImageStorageResult> imageStorageResults = imageAssetService.uploadImageSets(getImageCategoryForAsset(mediaAssetOwnerType), entityId, imageFiles);
        if (imageStorageResults == null || imageStorageResults.isEmpty()) {
            return null;
        }
        List<MediaAsset> mediaAssets = imageStorageResults.stream()
                .map(imageStorageResult -> MediaAsset.builder()
                        .ownerId(entityId)
                        .ownerType(mediaAssetOwnerType)
                        .imageOrigKey(imageStorageResult.originalKey())
                        .imageThumbKey(imageStorageResult.variantKeys().getOrDefault(ImageVariant.THUMB, null))
                        .imageMediumKey(imageStorageResult.variantKeys().getOrDefault(ImageVariant.MEDIUM, null))
                        .imageLargeKey(imageStorageResult.variantKeys().getOrDefault(ImageVariant.LARGE, null))
                        .build())
                .collect(Collectors.toList());
        return mediaAssetRepository.saveAll(mediaAssets);
    }

    public static MediaAsset getMediaAssetByEntityIdAndOwnerType(MediaAssetRepository mediaAssetRepository, Integer entityId, MediaAssetOwnerType mediaAssetOwnerType) {
        List<MediaAsset> mediaAssetList = mediaAssetRepository.findMediaAssetByOwnerIdAndOwnerType(entityId, mediaAssetOwnerType);
        return !mediaAssetList.isEmpty() ? mediaAssetList.getFirst() : null;
    }

    public static List<MediaAsset> getListMediaAssetByEntityIdAndOwnerType(MediaAssetRepository mediaAssetRepository, Integer entityId, MediaAssetOwnerType mediaAssetOwnerType) {
        return mediaAssetRepository.findMediaAssetByOwnerIdAndOwnerType(entityId, mediaAssetOwnerType);
    }

    private static ImageCategory getImageCategoryForAsset(MediaAssetOwnerType mediaAssetOwnerType) {
        return switch (mediaAssetOwnerType) {
            case HALL -> ImageCategory.HALL;
            case MENU_ITEM -> ImageCategory.MENU_ITEM;
            case SET_MENU -> ImageCategory.SET_MENU;
        };
    }
}
