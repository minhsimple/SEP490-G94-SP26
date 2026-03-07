package vn.edu.fpt.service;

import org.springframework.web.multipart.MultipartFile;
import vn.edu.fpt.util.image.ImageSet;

public interface ImageProcessorService {
    ImageSet process(MultipartFile file) throws Exception;
}
