package vn.edu.fpt.dto.request.task;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.edu.fpt.entity.TaskCategory;
import vn.edu.fpt.util.enums.TaskState;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskListRequest {
    @NotNull(message = "ID hợp đồng không được để trống")
    private Integer contractId;

    @NotBlank(message = "Tên danh sách công việc không được để trống")
    private String name;

    private String description;

    private List<TaskCategoryGroupRequest> taskCategoryGroups;


    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TaskCategoryGroupRequest{

        @NotNull(message = "Tên nhóm công việc không được để trống")
        private String title;

        private List<TaskRequestDTO> tasks;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TaskRequestDTO {
        @NotBlank(message = "Tiêu đề công việc không được để trống")
        private String title;

        private String description;

        @NotNull(message = "Mức độ ưu tiên không được để trống")
        private Integer priority;

        @NotNull(message = "Trạng thái công việc không được để trống")
        private TaskState state;
    }
}

