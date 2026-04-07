package vn.edu.fpt.dto.response.task;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.edu.fpt.entity.TaskCategory;
import vn.edu.fpt.util.enums.RecordStatus;
import vn.edu.fpt.util.enums.TaskState;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskResponse {
    private Integer id;
    private String title;
    private String description;
    private TaskState state;
    private Integer priority;
    private Integer taskCategoryId;
}

