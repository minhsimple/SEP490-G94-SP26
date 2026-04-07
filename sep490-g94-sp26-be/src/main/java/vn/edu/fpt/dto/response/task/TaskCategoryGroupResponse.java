package vn.edu.fpt.dto.response.task;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskCategoryGroupResponse {
    private Integer categoryId;
    private String categoryTitle;
    private List<TaskResponse> tasks;
}

