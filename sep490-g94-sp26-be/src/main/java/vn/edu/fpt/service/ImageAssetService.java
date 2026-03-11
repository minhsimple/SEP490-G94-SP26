package vn.edu.fpt.service;

import org.springframework.web.multipart.MultipartFile;
import vn.edu.fpt.util.enums.ImageCategory;
import vn.edu.fpt.util.image.ImageStorageResult;

import java.util.List;

public interface ImageAssetService {
    ImageStorageResult uploadImageSet(ImageCategory category, Integer entityId, MultipartFile file) throws Exception;

    List<ImageStorageResult> uploadImageSets(ImageCategory category, Integer entityId, List<MultipartFile> files) throws Exception;

    String preSignedUrl(String objectKey, int minutes) throws Exception;

    void deleteFolder(String objectKey);
}
