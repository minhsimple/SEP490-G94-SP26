package vn.edu.fpt.service.impl;

import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import io.minio.http.Method;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import vn.edu.fpt.config.MinioProperties;
import vn.edu.fpt.service.ImageAssetService;
import vn.edu.fpt.service.ImageProcessorService;
import vn.edu.fpt.util.enums.ImageCategory;
import vn.edu.fpt.util.enums.ImageVariant;
import vn.edu.fpt.util.image.ImageNamingStrategy;
import vn.edu.fpt.util.image.ImageSet;
import vn.edu.fpt.util.image.ImageStorageResult;
import vn.edu.fpt.util.image.ProcessedImage;

import java.io.ByteArrayInputStream;
import java.util.EnumMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ImageAssetServiceImpl implements ImageAssetService {
    private final ImageProcessorService processor;
    private final MinioClient minio;
    private final MinioProperties props;
    private final ImageNamingStrategy naming = new ImageNamingStrategy();

    @Override
    public ImageStorageResult uploadImageSet(ImageCategory category, Integer entityId, MultipartFile file) throws Exception {
        ImageSet set = processor.process(file);

        String folder = naming.baseFolder(category, entityId);
        String id = naming.newId();

        // Build keys
        String origKey = naming.objectKey(folder, "orig", id, extFromFilename(set.originalOptimized().filename()));
        Map<ImageVariant, String> keys = new EnumMap<>(ImageVariant.class);
        for (var e : set.variants().entrySet()) {
            keys.put(e.getKey(), naming.objectKey(folder, e.getKey().name().toLowerCase(), id, extFromFilename(e.getValue().filename())));
        }

        // Upload with rollback on failure
        try {
            put(origKey, set.originalOptimized());
            for (var e : set.variants().entrySet()) {
                put(keys.get(e.getKey()), e.getValue());
            }
        } catch (Exception ex) {
            // best-effort cleanup
            safeDelete(origKey);
            for (String k : keys.values()) safeDelete(k);
            throw ex;
        }

        return new ImageStorageResult(origKey, keys);
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

    private void put(String objectKey, ProcessedImage img) throws Exception {
        try (ByteArrayInputStream in = new ByteArrayInputStream(img.bytes())) {
            minio.putObject(
                    PutObjectArgs.builder()
                            .bucket(props.getBucket())
                            .object(objectKey)
                            .stream(in, img.size(), -1)
                            .contentType(img.contentType())
                            .build()
            );
        }
    }

    private void safeDelete(String objectKey) {
        try {
            minio.removeObject(RemoveObjectArgs.builder().bucket(props.getBucket()).object(objectKey).build());
        } catch (Exception ignored) {}
    }

    private String extFromFilename(String filename) {
        int idx = filename.lastIndexOf('.');
        return idx >= 0 ? filename.substring(idx) : ".jpg";
    }
}
