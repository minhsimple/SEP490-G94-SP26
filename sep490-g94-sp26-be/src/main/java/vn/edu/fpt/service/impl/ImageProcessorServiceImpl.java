package vn.edu.fpt.service.impl;

import lombok.NoArgsConstructor;
import net.coobird.thumbnailator.Thumbnails;
import org.apache.tika.Tika;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import vn.edu.fpt.exception.AppException;
import vn.edu.fpt.exception.ERROR_CODE;
import vn.edu.fpt.service.ImageProcessorService;
import vn.edu.fpt.util.enums.Constants;
import vn.edu.fpt.util.enums.ImageVariant;
import vn.edu.fpt.util.image.ImageSet;
import vn.edu.fpt.util.image.ProcessedImage;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.EnumMap;
import java.util.Map;
import java.util.Set;

@Service
@NoArgsConstructor
public class ImageProcessorServiceImpl implements ImageProcessorService {
    private static final Set<String> ALLOWED = Set.of("image/jpeg");
    private final Tika tika = new Tika();

    @Override
    public ImageSet process(MultipartFile file) throws Exception {
        if (file == null || file.isEmpty()) throw new AppException(ERROR_CODE.FILE_EMPTY);
        if (file.getSize() > Constants.FILE_MAX_SIZE) throw new AppException(ERROR_CODE.FILE_TOO_LARGE);

        // Safer than trusting file.getContentType()
        String detectedType;
        try (InputStream in = file.getInputStream()) {
            detectedType = tika.detect(in);
        }
        if (!ALLOWED.contains(detectedType)) {
            throw new AppException(ERROR_CODE.FILE_INVALID_CONTENT_TYPE);
        }

        BufferedImage original;
        try (InputStream in = file.getInputStream()) {
            original = ImageIO.read(in);
        }
        if (original == null) throw new AppException(ERROR_CODE.FILE_ERROR);

        String outFormat = "jpg";
        String outContentType = "image/jpeg";
        String outExt = ".jpg";

        // Optimized "orig" (cap big photos)
        ProcessedImage origOptimized = encodeResized(original, 2000, 2000, 0.86f, outFormat, outContentType, "orig" + outExt);

        Map<ImageVariant, ProcessedImage> variants = new EnumMap<>(ImageVariant.class);
        for (ImageVariant v : ImageVariant.values()) {
            ProcessedImage p = encodeResized(original, v.maxW(), v.maxH(), v.quality(), outFormat, outContentType,
                    v.name().toLowerCase() + outExt);
            variants.put(v, p);
        }

        return new ImageSet(origOptimized, variants);
    }

    private ProcessedImage encodeResized(
            BufferedImage src, int maxW, int maxH, float quality,
            String format, String contentType, String filename
    ) throws Exception {

        BufferedImage resized = Thumbnails.of(src)
                .size(maxW, maxH)
                .keepAspectRatio(true)
                .asBufferedImage();

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        // Thumbnailator quality applies when writing JPG. (For PNG it’s different.)
        Thumbnails.of(resized)
                .scale(1.0)
                .outputQuality(quality)
                .outputFormat(format)
                .toOutputStream(baos);

        return new ProcessedImage(filename, contentType, baos.toByteArray());
    }
}
