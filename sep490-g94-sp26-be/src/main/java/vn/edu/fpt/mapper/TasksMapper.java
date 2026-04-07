package vn.edu.fpt.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import vn.edu.fpt.dto.request.task.TaskRequest;
import vn.edu.fpt.dto.response.task.TaskResponse;
import vn.edu.fpt.entity.Tasks;

@Mapper(componentModel = "spring")
public interface TasksMapper {

    @Mapping(target = "id", ignore = true)
    Tasks toEntity(TaskRequest request);

    @Mapping(target = "id", ignore = true)
    void updateEntity(@MappingTarget Tasks tasks, TaskRequest taskRequest);

    @Mapping(target = "id", source = "tasks.id")
    @Mapping(target = "title", source = "tasks.title")
    @Mapping(target = "description", source = "tasks.description")
    @Mapping(target = "state", source = "tasks.state")
    @Mapping(target = "priority", source = "tasks.priority")
    @Mapping(target = "taskCategoryId", source = "tasks.taskCategoryId")
    TaskResponse toResponse(Tasks tasks);
}

