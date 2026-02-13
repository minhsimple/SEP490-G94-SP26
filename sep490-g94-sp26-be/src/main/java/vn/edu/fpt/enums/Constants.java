package vn.edu.fpt.enums;

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
}
