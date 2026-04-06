package vn.edu.fpt.service;

import org.springframework.data.domain.Pageable;
import vn.edu.fpt.dto.SimplePage;
import vn.edu.fpt.dto.request.task.TaskFilterRequest;
import vn.edu.fpt.dto.request.task.TaskRequest;
import vn.edu.fpt.dto.response.task.TaskResponse;

import java.util.List;

public interface TasksService {
    TaskResponse createNewTask(TaskRequest taskRequest);
    TaskResponse updateTask(Integer id, TaskRequest taskRequest);
    TaskResponse getTaskById(Integer id);
    SimplePage<TaskResponse> getAllTasks(Pageable pageable, TaskFilterRequest filterRequest);
    TaskResponse changeStatusTask(Integer id);
    List<TaskResponse> getTasksByTaskListId(Integer taskListId);
}


