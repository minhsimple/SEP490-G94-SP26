package vn.edu.fpt.util.image;

import vn.edu.fpt.util.enums.ImageVariant;

import java.util.EnumMap;
import java.util.Map;

public record ImageStorageResult(String originalKey, Map<ImageVariant, String> variantKeys) {

    public static ImageStorageResult of(String origKey) {
        return new ImageStorageResult(origKey, new EnumMap<>(ImageVariant.class));
    }
}
