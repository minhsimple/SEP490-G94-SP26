
package vn.edu.fpt.service.impl;

import io.minio.GetPresignedObjectUrlArgs;
import io.minio.ListObjectsArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import io.minio.RemoveObjectsArgs;
import io.minio.Result;
import io.minio.http.Method;
import io.minio.messages.DeleteError;
import io.minio.messages.DeleteObject;
import io.minio.messages.Item;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionException;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ImageAssetServiceImpl implements ImageAssetService {
    private final ImageProcessorService processor;
    private final MinioClient minio;
    private final MinioProperties props;
    private final ImageNamingStrategy naming = new ImageNamingStrategy();
    private final Executor uploadExecutor = Executors.newVirtualThreadPerTaskExecutor();

    @Override
    public ImageStorageResult uploadImageSet(ImageCategory category, Integer entityId, MultipartFile file) throws Exception {
        ImageSet set = processor.process(file);

        String folder = naming.baseFolder(category, entityId);
        String id = naming.newId();

        String origKey = buildObjectKey(folder, "orig", id, set.originalOptimized().filename());
        Map<ImageVariant, String> keys = new EnumMap<>(ImageVariant.class);
        set.variants().forEach((variant, img) ->
                keys.put(variant, buildObjectKey(folder, variant.name().toLowerCase(), id, img.filename()))
        );

        List<String> allKeys = new ArrayList<>();
        allKeys.add(origKey);
        allKeys.addAll(keys.values());

        try {
            // Upload original first, then variants in parallel
            put(origKey, set.originalOptimized());

            List<CompletableFuture<Void>> futures = set.variants().entrySet().stream()
                    .map(e -> CompletableFuture.runAsync(
                            () -> putUnchecked(keys.get(e.getKey()), e.getValue()), uploadExecutor))
                    .toList();

            CompletableFuture.allOf(futures.toArray(CompletableFuture[]::new)).join();
        } catch (CompletionException ex) {
            allKeys.forEach(this::safeDelete);
            Throwable cause = ex.getCause();
            throw cause instanceof Exception ? (Exception) cause : new RuntimeException(cause);
        } catch (Exception ex) {
            allKeys.forEach(this::safeDelete);
            throw ex;
        }

        return new ImageStorageResult(origKey, keys);
    }

    @Override
    public List<ImageStorageResult> uploadImageSets(ImageCategory category, Integer entityId, List<MultipartFile> files) throws Exception {
        String folder = naming.baseFolder(category, entityId);

        // Process all images in parallel (CPU-bound resizing)
        List<CompletableFuture<ImageSet>> processFutures = files.stream()
                .map(file -> CompletableFuture.supplyAsync(() -> {
                    try {
                        return processor.process(file);
                    } catch (Exception e) {
                        throw new CompletionException(e);
                    }
                }, uploadExecutor))
                .toList();

        List<ImageSet> sets;
        try {
            sets = CompletableFuture.allOf(processFutures.toArray(CompletableFuture[]::new))
                    .thenApply(v -> processFutures.stream()
                            .map(CompletableFuture::join)
                            .toList())
                    .join();
        } catch (CompletionException ex) {
            Throwable cause = ex.getCause();
            throw cause instanceof Exception ? (Exception) cause : new RuntimeException(cause);
        }

        // Build keys for each image set, one unique id per image
        List<String> allKeys = new ArrayList<>();
        List<ImageStorageResult> results = new ArrayList<>(sets.size());
        List<String> origKeys = new ArrayList<>(sets.size());
        List<Map<ImageVariant, String>> variantKeysList = new ArrayList<>(sets.size());

        for (ImageSet set : sets) {
            String id = naming.newId();
            String origKey = buildObjectKey(folder, "orig", id, set.originalOptimized().filename());
            Map<ImageVariant, String> keys = new EnumMap<>(ImageVariant.class);
            set.variants().forEach((variant, img) ->
                    keys.put(variant, buildObjectKey(folder, variant.name().toLowerCase(), id, img.filename()))
            );

            allKeys.add(origKey);
            allKeys.addAll(keys.values());
            origKeys.add(origKey);
            variantKeysList.add(keys);
            results.add(new ImageStorageResult(origKey, keys));
        }

        // Upload all originals + variants in parallel
        try {
            List<CompletableFuture<Void>> uploadFutures = new ArrayList<>();
            for (int i = 0; i < sets.size(); i++) {
                ImageSet set = sets.get(i);
                String origKey = origKeys.get(i);
                Map<ImageVariant, String> keys = variantKeysList.get(i);

                uploadFutures.add(CompletableFuture.runAsync(
                        () -> putUnchecked(origKey, set.originalOptimized()), uploadExecutor));

                for (var entry : set.variants().entrySet()) {
                    String key = keys.get(entry.getKey());
                    ProcessedImage img = entry.getValue();
                    uploadFutures.add(CompletableFuture.runAsync(
                            () -> putUnchecked(key, img), uploadExecutor));
                }
            }

            CompletableFuture.allOf(uploadFutures.toArray(CompletableFuture[]::new)).join();
        } catch (CompletionException ex) {
            allKeys.forEach(this::safeDelete);
            Throwable cause = ex.getCause();
            throw cause instanceof Exception ? (Exception) cause : new RuntimeException(cause);
        } catch (Exception ex) {
            allKeys.forEach(this::safeDelete);
            throw ex;
        }

        return results;
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

    @Override
    public void deleteFolder(String objectKey) {
        String prefix = naming.baseFolderFromKey(objectKey);

        List<DeleteObject> objects = new ArrayList<>();
        for (Result<Item> result : minio.listObjects(
                ListObjectsArgs.builder()
                        .bucket(props.getBucket())
                        .prefix(prefix)
                        .recursive(true)
                        .build())) {
            try {
                objects.add(new DeleteObject(result.get().objectName()));
            } catch (Exception e) {
                log.warn("Failed to list object under prefix {}: {}", prefix, e.getMessage());
            }
        }

        if (objects.isEmpty()) {
            return;
        }

        for (Result<DeleteError> result : minio.removeObjects(
                RemoveObjectsArgs.builder()
                        .bucket(props.getBucket())
                        .objects(objects)
                        .build())) {
            try {
                DeleteError error = result.get();
                log.warn("Failed to delete {}: {}", error.objectName(), error.message());
            } catch (Exception e) {
                log.warn("Error during batch deletion under prefix {}: {}", prefix, e.getMessage());
            }
        }
    }

    private String buildObjectKey(String folder, String prefix, String id, String filename) {
        return naming.objectKey(folder, prefix, id, extFromFilename(filename));
    }

    private void put(String objectKey, ProcessedImage img) throws Exception {
        try (var in = new ByteArrayInputStream(img.bytes())) {
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

    private void putUnchecked(String objectKey, ProcessedImage img) {
        try {
            put(objectKey, img);
        } catch (Exception e) {
            throw new CompletionException(e);
        }
    }

    private void safeDelete(String objectKey) {
        try {
            minio.removeObject(RemoveObjectArgs.builder().bucket(props.getBucket()).object(objectKey).build());
        } catch (Exception ignored) {
        }
    }

    private String extFromFilename(String filename) {
        int idx = filename.lastIndexOf('.');
        return idx >= 0 ? filename.substring(idx) : ".jpg";
    }
}
