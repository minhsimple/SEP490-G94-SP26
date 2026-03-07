package vn.edu.fpt.util.image;

import vn.edu.fpt.util.enums.ImageVariant;

import java.util.EnumMap;
import java.util.Map;

public record ImageSet(ProcessedImage originalOptimized, Map<ImageVariant, ProcessedImage> variants) {

    public static ImageSet of(ProcessedImage originalOptimized) {
        return new ImageSet(originalOptimized, new EnumMap<>(ImageVariant.class));
    }
}
