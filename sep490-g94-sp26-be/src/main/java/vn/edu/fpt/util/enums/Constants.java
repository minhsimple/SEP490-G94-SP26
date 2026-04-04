package vn.edu.fpt.util.enums;

import org.springframework.data.domain.Sort;

public class Constants {
    public interface SORT {
        String SORT_BY = "updatedAt";
        Sort.Direction SORT_ORDER = Sort.Direction.DESC;
    }

    public interface PAGE {
        int DEFAULT_PAGE_SIZE = 20;
        int DEFAULT_PAGE_NUMBER = 0;
    }

    public static final long FILE_IMAGE_MAX_SIZE = 5 * 1024 * 1024; // 5MB
    public static final long FILE_VIDEO_MAX_SIZE = 40 * 1024 * 1024; // 40MB
}
