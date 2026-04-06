package vn.edu.fpt.dto.request.task;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.edu.fpt.util.enums.RecordStatus;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskListFilterRequest {
    private Integer contractId;
    private String name;
    private String description;
    private RecordStatus status;
}

