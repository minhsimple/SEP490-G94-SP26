package vn.edu.fpt.service;

import org.springframework.web.multipart.MultipartFile;
import vn.edu.fpt.util.enums.ImageCategory;
import vn.edu.fpt.util.image.ImageStorageResult;

public interface ImageAssetService {
    ImageStorageResult uploadImageSet(ImageCategory category, Integer entityId, MultipartFile file) throws Exception;
    String preSignedUrl(String objectKey, int minutes) throws Exception;
}
