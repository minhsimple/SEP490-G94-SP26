package vn.edu.fpt.service.impl;

import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import io.minio.http.Method;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import vn.edu.fpt.config.MinioProperties;
import vn.edu.fpt.exception.AppException;
import vn.edu.fpt.exception.ERROR_CODE;
import vn.edu.fpt.service.VideoService;
import vn.edu.fpt.util.enums.Constants;

import java.io.InputStream;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class VideoServiceImpl implements VideoService {
    /** Allowed file extensions for video uploads. */
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(".mp4", ".mov", ".avi", ".mkv", ".webm");

    private final MinioClient minio;
    private final MinioProperties props;

    @Override
    public String uploadVideo(String entityType, Integer entityId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new AppException(ERROR_CODE.FILE_EMPTY);
        }
        if (file.getSize() > Constants.FILE_VIDEO_MAX_SIZE) {
            throw new AppException(ERROR_CODE.FILE_VIDEO_TOO_LARGE);
        }

        // Validate by file extension
        String filename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "";
        String extension = getFileExtension(filename);
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new AppException(ERROR_CODE.FILE_VIDEO_INVALID_CONTENT_TYPE);
        }

        // Validate by magic bytes: MP4/MOV containers have "ftyp" at bytes 4-7
        try {
            byte[] header = file.getBytes();
            if (!isVideoMagicBytes(header, extension)) {
                log.warn("Magic bytes check failed for file: {}", filename);
                throw new AppException(ERROR_CODE.FILE_VIDEO_INVALID_CONTENT_TYPE);
            }
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Could not read file bytes for validation: {}", filename, e);
            throw new AppException(ERROR_CODE.FILE_VIDEO_INVALID_CONTENT_TYPE);
        }

        String bucketName = props.getBucket();
        String objectKey = buildObjectKey(entityType, entityId, filename);
        // Use a safe content type for MinIO storage
        String contentType = resolveContentType(extension);

        try (InputStream stream = file.getInputStream()) {
            minio.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectKey)
                            .stream(stream, file.getSize(), -1)
                            .contentType(contentType)
                            .build());
            log.info("Uploaded video: {}", objectKey);
            return objectKey;
        } catch (Exception e) {
            log.error("Failed to upload video: {}", objectKey, e);
            throw new RuntimeException("Failed to upload video", e);
        }
    }

    /**
     * Checks magic bytes for common video container formats.
     * MP4/MOV: bytes 4–7 are the ASCII string "ftyp".
     * WebM/MKV: starts with 0x1A 0x45 0xDF 0xA3 (EBML header).
     * AVI: starts with "RIFF" (bytes 0–3) and "AVI " at bytes 8–11.
     */
    private boolean isVideoMagicBytes(byte[] header, String extension) {
        if (header == null || header.length < 12)
            return false;
        return switch (extension) {
            case ".mp4", ".mov" -> header[4] == 'f' && header[5] == 't' && header[6] == 'y' && header[7] == 'p';
            case ".mkv", ".webm" ->
                (header[0] & 0xFF) == 0x1A && (header[1] & 0xFF) == 0x45
                        && (header[2] & 0xFF) == 0xDF && (header[3] & 0xFF) == 0xA3;
            case ".avi" ->
                header[0] == 'R' && header[1] == 'I' && header[2] == 'F' && header[3] == 'F'
                        && header[8] == 'A' && header[9] == 'V' && header[10] == 'I' && header[11] == ' ';
            default -> false;
        };
    }

    private String resolveContentType(String extension) {
        return switch (extension) {
            case ".mp4" -> "video/mp4";
            case ".mov" -> "video/quicktime";
            case ".avi" -> "video/x-msvideo";
            case ".mkv" -> "video/x-matroska";
            case ".webm" -> "video/webm";
            default -> "application/octet-stream";
        };
    }

    @Override
    public String preSignedUrl(String objectKey, int minutes) {
        try {
            return minio.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .method(Method.GET)
                            .bucket(props.getBucket())
                            .object(objectKey)
                            .expiry(minutes)
                            .build());
        } catch (Exception e) {
            log.error("Failed to generate presigned URL for {}: {}", objectKey, e.getMessage());
            throw new RuntimeException("Failed to generate presigned URL", e);
        }
    }

    @Override
    public void deleteVideo(String objectKey) {
        try {
            minio.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(props.getBucket())
                            .object(objectKey)
                            .build());
            log.info("Deleted video: {}", objectKey);
        } catch (Exception e) {
            log.error("Failed to delete video: {}: {}", objectKey, e.getMessage());
            throw new RuntimeException("Failed to delete video", e);
        }
    }

    private String buildObjectKey(String entityType, Integer entityId, String filename) {
        String extension = getFileExtension(filename);
        String uniqueId = UUID.randomUUID().toString();
        return String.format("videos/%s/%d/%s%s", entityType, entityId, uniqueId, extension);
    }

    private String getFileExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex == -1) {
            return "";
        }
        return filename.substring(lastDotIndex).toLowerCase();
    }
}
