package vn.edu.fpt.service;

import org.springframework.web.multipart.MultipartFile;

public interface VideoService {
    String uploadVideo(String entityType, Integer entityId, MultipartFile file);

    String preSignedUrl(String objectKey, int minutes);

    void deleteVideo(String objectKey);
}
