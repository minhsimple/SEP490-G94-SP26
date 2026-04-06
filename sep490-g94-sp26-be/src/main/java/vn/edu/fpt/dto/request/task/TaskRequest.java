package vn.edu.fpt.dto.request.task;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.edu.fpt.util.enums.TaskState;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskRequest {
    @NotNull(message = "ID danh sách công việc không được để trống")
    private Integer taskListId;

    @NotBlank(message = "Tiêu đề công việc không được để trống")
    private String title;

    private String description;

    @NotNull(message = "Trạng thái công việc không được để trống")
    private TaskState state;

    @NotNull(message = "Mức độ ưu tiên không được để trống")
    private Integer priority;
}

