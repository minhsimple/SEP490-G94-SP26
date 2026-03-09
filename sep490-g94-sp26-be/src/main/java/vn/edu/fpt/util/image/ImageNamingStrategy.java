package vn.edu.fpt.util.image;

import vn.edu.fpt.util.enums.ImageCategory;

import java.time.LocalDate;
import java.util.Locale;
import java.util.UUID;

public class ImageNamingStrategy {
    public String baseFolder(ImageCategory category, Integer entityId) {
        LocalDate now = LocalDate.now();
        return String.format(Locale.ROOT, "%s/%d/%04d/%02d",
                category.prefix(), entityId, now.getYear(), now.getMonthValue());
    }

    public String newId() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 10);
    }

    public String objectKey(String baseFolder, String variantName, String id, String ext) {
        return baseFolder + "/" + variantName + "_" + id + ext;
    }

    public String baseFolderFromKey(String objectKey) {
        int lastSlash = objectKey.lastIndexOf('/');
        if (lastSlash <= 0) {
            throw new IllegalArgumentException("Invalid object key: " + objectKey);
        }
        return objectKey.substring(0, lastSlash + 1);
    }
}
