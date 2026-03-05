package vn.edu.fpt.service;

import org.springframework.web.multipart.MultipartFile;
import vn.edu.fpt.dto.response.UploadResult;
import vn.edu.fpt.util.enums.ImageCategory;

public interface MinioStorageService {
    UploadResult uploadImage(MultipartFile file, ImageCategory imageCategory, Integer entityId) throws Exception;
    String preSignedUrl(String objectName, int minutes) throws Exception;
}
