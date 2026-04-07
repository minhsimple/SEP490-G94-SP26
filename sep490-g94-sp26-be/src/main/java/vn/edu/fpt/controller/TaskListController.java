package vn.edu.fpt.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.edu.fpt.dto.request.task.TaskListRequest;
import vn.edu.fpt.dto.response.ApiResponse;
import vn.edu.fpt.dto.response.task.TaskListResponse;
import vn.edu.fpt.service.TaskListService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/task-list")
@Tag(name = "Task List")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TaskListController {
    TaskListService taskListService;

//    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
//    @Transactional
//    @Operation(summary = "Tạo danh sách công việc mới")
//    @PostMapping("/create")
//    public ApiResponse<TaskListResponse> createNewTaskList(
//            @Valid @RequestBody TaskListRequest taskListRequest) {
//        TaskListResponse taskListResponse = taskListService.createNewTaskList(taskListRequest);
//        return ApiResponse.<TaskListResponse>builder()
//                .data(taskListResponse)
//                .build();
//    }

    @Operation(summary = "Xem chi tiết danh sách công việc")
    @GetMapping("/{taskListId}")
    public ApiResponse<TaskListResponse> viewDetailTaskList(@PathVariable Integer taskListId) {
        TaskListResponse taskListResponse = taskListService.getTaskListById(taskListId);
        return ApiResponse.<TaskListResponse>builder()
                .data(taskListResponse)
                .build();
    }

//    @Operation(summary = "Xem danh sách công việc theo hợp đồng")
//    @GetMapping("/contract/{contractId}")
//    public ApiResponse<TaskListResponse> getTaskListByContractId(@PathVariable Integer contractId) {
//        TaskListResponse taskListResponse = taskListService.getTaskListByContractId(contractId);
//        return ApiResponse.<TaskListResponse>builder()
//                .data(taskListResponse)
//                .build();
//    }

    @Operation(summary = "Xem danh sách tất cả danh sách công việc theo điều kiện lọc (theo người điều phối và các tiêu chí khác)")
    @GetMapping("/search")
    public ApiResponse<List<TaskListResponse>> getAllTaskLists(
            @RequestParam(required = false) Integer coordinatorId
    ) {
        return ApiResponse.<List<TaskListResponse>>builder()
                .data(taskListService.getAllTaskList(coordinatorId))
                .build();
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','COORDINATOR')")
    @Operation(summary = "Thay đổi trạng thái danh sách công việc")
    @PutMapping("/{taskListId}/change-status")
    public ApiResponse<TaskListResponse> changeStatusTaskList(@PathVariable Integer taskListId) {
        TaskListResponse taskListResponse = taskListService.changeStatusTaskList(taskListId);
        return ApiResponse.<TaskListResponse>builder()
                .data(taskListResponse)
                .build();
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','COORDINATOR')")
    @Operation(summary = "Cập nhật danh sách công việc (và các công việc trong đó)")
    @PutMapping("/update")
    public ApiResponse<TaskListResponse> updateTaskList(@RequestParam Integer taskListId,
                                                        @Valid @RequestBody TaskListRequest taskListRequest) {
        TaskListResponse taskListResponse = taskListService.updateTaskList(taskListId, taskListRequest);
        return ApiResponse.<TaskListResponse>builder()
                .data(taskListResponse)
                .build();
    }
}



