package vn.edu.fpt.dto.response.tablelayout;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TableLayoutResponse {
    Integer contractId;
    Map<String, List<TableLayoutDetailResponse>> tableLayoutDetails;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class TableLayoutDetailResponse {
        Integer id;
        String groupName;
        Integer numberOfTables;
    }
}
