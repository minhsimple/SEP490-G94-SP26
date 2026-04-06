package vn.edu.fpt.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import vn.edu.fpt.dto.request.task.TaskListRequest;
import vn.edu.fpt.dto.response.task.TaskListResponse;
import vn.edu.fpt.entity.TaskList;
import vn.edu.fpt.entity.Tasks;

import java.util.List;

@Mapper(componentModel = "spring", uses = TasksMapper.class)
public interface TaskListMapper {

    @Mapping(target = "id", ignore = true)
    TaskList toEntity(TaskListRequest request);

    @Mapping(target = "id", ignore = true)
    void updateEntity(@MappingTarget TaskList taskList, TaskListRequest taskListRequest);

    @Mapping(target = "id", source = "taskList.id")
    @Mapping(target = "contractId", source = "taskList.contractId")
    @Mapping(target = "name", source = "taskList.name")
    @Mapping(target = "description", source = "taskList.description")
    @Mapping(target = "status", source = "taskList.status")
    @Mapping(target = "tasks", source = "tasks")
    TaskListResponse toResponse(TaskList taskList, List<Tasks> tasks);
}

