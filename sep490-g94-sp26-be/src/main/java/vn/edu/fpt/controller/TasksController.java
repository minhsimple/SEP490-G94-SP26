package vn.edu.fpt.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import vn.edu.fpt.dto.SimplePage;
import vn.edu.fpt.dto.request.task.TaskFilterRequest;
import vn.edu.fpt.dto.request.task.TaskRequest;
import vn.edu.fpt.dto.response.ApiResponse;
import vn.edu.fpt.dto.response.task.TaskResponse;
import vn.edu.fpt.service.TasksService;
import vn.edu.fpt.util.enums.Constants;

import java.util.List;

@RestController
@RequestMapping("/api/v1/task")
@Tag(name = "Task")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TasksController {
    TasksService tasksService;

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @Transactional
    @Operation(summary = "Tạo công việc mới")
    @PostMapping("/create")
    public ApiResponse<TaskResponse> createNewTask(
            @Valid @RequestBody TaskRequest taskRequest) {
        TaskResponse taskResponse = tasksService.createNewTask(taskRequest);
        return ApiResponse.<TaskResponse>builder()
                .data(taskResponse)
                .build();
    }

    @Operation(summary = "Xem chi tiết công việc")
    @GetMapping("/{taskId}")
    public ApiResponse<TaskResponse> viewDetailTask(@PathVariable Integer taskId) {
        TaskResponse taskResponse = tasksService.getTaskById(taskId);
        return ApiResponse.<TaskResponse>builder()
                .data(taskResponse)
                .build();
    }

    @Operation(summary = "Xem danh sách công việc")
    @GetMapping("/search")
    public ApiResponse<SimplePage<TaskResponse>> getAllTasks(
            @Valid TaskFilterRequest filterRequest,
            @ParameterObject @PageableDefault(size = Constants.PAGE.DEFAULT_PAGE_SIZE,
                    sort = Constants.SORT.SORT_BY,
                    direction = Sort.Direction.DESC
            ) Pageable pageable) {
        return ApiResponse.<SimplePage<TaskResponse>>builder()
                .data(tasksService.getAllTasks(pageable, filterRequest))
                .build();
    }

    @Operation(summary = "Xem tổng công việc theo id danh sách công việc")
    @GetMapping("/task-list/{taskListId}")
    public ApiResponse<List<TaskResponse>> getTasksByTaskListId(@PathVariable Integer taskListId) {
        List<TaskResponse> taskResponses = tasksService.getTasksByTaskListId(taskListId);
        return ApiResponse.<List<TaskResponse>>builder()
                .data(taskResponses)
                .build();
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @Operation(summary = "Thay đổi trạng thái công việc")
    @PutMapping("/{taskId}/change-status")
    public ApiResponse<TaskResponse> changeStatusTask(@PathVariable Integer taskId) {
        TaskResponse taskResponse = tasksService.changeStatusTask(taskId);
        return ApiResponse.<TaskResponse>builder()
                .data(taskResponse)
                .build();
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @Operation(summary = "Cập nhật công việc")
    @PutMapping("/update")
    public ApiResponse<TaskResponse> updateTask(@RequestParam Integer taskId,
                                                @Valid @RequestBody TaskRequest taskRequest) {
        TaskResponse taskResponse = tasksService.updateTask(taskId, taskRequest);
        return ApiResponse.<TaskResponse>builder()
                .data(taskResponse)
                .build();
    }
}



