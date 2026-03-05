package vn.edu.fpt.service.impl;

import io.minio.*;
import io.minio.http.Method;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import vn.edu.fpt.config.MinioProperties;
import vn.edu.fpt.dto.response.UploadResult;
import vn.edu.fpt.enums.Constants;
import vn.edu.fpt.enums.ImageCategory;
import vn.edu.fpt.exception.AppException;
import vn.edu.fpt.exception.ERROR_CODE;
import vn.edu.fpt.service.MinioStorageService;

import java.io.InputStream;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MinioStorageServiceImpl implements MinioStorageService {
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            MediaType.IMAGE_JPEG_VALUE,
            MediaType.IMAGE_PNG_VALUE
    );

    private final MinioClient minio;
    private final MinioProperties props;

    @Override
    public UploadResult uploadImage(MultipartFile file, ImageCategory imageCategory, Integer entityId) throws Exception {
        if (file.isEmpty()) {
            throw new AppException(ERROR_CODE.FILE_EMPTY);
        }

        if(file.getSize() > Constants.FILE_MAX_SIZE) {
            throw new AppException(ERROR_CODE.FILE_TOO_LARGE);
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new AppException(ERROR_CODE.FILE_INVALID_CONTENT_TYPE);
        }

        String ext = guessExt(contentType);
        String objectKey = imageCategory.prefix() + "/" + entityId + "/" + UUID.randomUUID() + ext;

        try (InputStream in = file.getInputStream()) {
            minio.putObject(
                    PutObjectArgs.builder()
                            .bucket(props.getBucket())
                            .object(objectKey)
                            .stream(in, file.getSize(), -1)
                            .contentType(contentType)
                            .build()
            );
        }

        String viewUrl = preSignedUrl(objectKey, 60 * 24);

        return new UploadResult(objectKey, viewUrl, contentType);
    }

    @Override
    public String preSignedUrl(String objectKey, int minutes) throws Exception {
        return minio.getPresignedObjectUrl(
                GetPresignedObjectUrlArgs.builder()
                        .method(Method.GET)
                        .bucket(props.getBucket())
                        .object(objectKey)
                        .expiry(minutes * 60)
                        .build()
        );
    }

    private void ensureBucketExists() throws Exception {
        boolean exists = minio.bucketExists(BucketExistsArgs.builder().bucket(props.getBucket()).build());
        if (!exists) {
            minio.makeBucket(MakeBucketArgs.builder().bucket(props.getBucket()).build());
        }
    }

    private String guessExt(String contentType) {
        return switch (contentType) {
            case MediaType.IMAGE_JPEG_VALUE -> ".jpg";
            case MediaType.IMAGE_PNG_VALUE -> ".png";
            default -> "";
        };
    }
}
