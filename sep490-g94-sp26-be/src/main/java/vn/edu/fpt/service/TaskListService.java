package vn.edu.fpt.service;

import vn.edu.fpt.dto.request.task.TaskListCreateRequest;
import vn.edu.fpt.dto.request.task.TaskListRequest;
import vn.edu.fpt.dto.response.task.TaskListResponse;

import java.util.List;

public interface TaskListService {
    TaskListResponse createNewTaskList(TaskListCreateRequest taskListRequest);
    TaskListResponse getTaskListById(Integer id);
    TaskListResponse getTaskListByContractId(Integer contractId);
    List<TaskListResponse> getAllTaskList(Integer id);
    TaskListResponse changeStatusTaskList(Integer id);
    TaskListResponse updateTaskList(Integer taskListId, TaskListRequest taskListRequest);
}


