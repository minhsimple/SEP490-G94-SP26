package vn.edu.fpt.service.impl;

import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.fpt.dto.SimplePage;
import vn.edu.fpt.dto.request.task.TaskFilterRequest;
import vn.edu.fpt.dto.request.task.TaskRequest;
import vn.edu.fpt.dto.response.task.TaskResponse;
import vn.edu.fpt.entity.Tasks;
import vn.edu.fpt.exception.AppException;
import vn.edu.fpt.exception.ERROR_CODE;
import vn.edu.fpt.mapper.TasksMapper;
import vn.edu.fpt.respository.TaskListRepository;
import vn.edu.fpt.respository.TasksRepository;
import vn.edu.fpt.service.TasksService;
import vn.edu.fpt.util.StringUtils;
import vn.edu.fpt.util.enums.RecordStatus;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TasksServiceImpl implements TasksService {
    private final TasksRepository tasksRepository;
    private final TaskListRepository taskListRepository;
    private final TasksMapper tasksMapper;

    @Transactional
    @Override
    public TaskResponse createNewTask(TaskRequest taskRequest) {
        // Validate: Check if TaskList exists
        taskListRepository.findById(taskRequest.getTaskListId())
                .orElseThrow(() -> new AppException(ERROR_CODE.TASK_LIST_NOT_EXISTED));

        Tasks task = Tasks.builder()
                .taskListId(taskRequest.getTaskListId())
                .title(taskRequest.getTitle())
                .description(taskRequest.getDescription())
                .state(taskRequest.getState())
                .priority(taskRequest.getPriority())
                .build();

        Tasks savedTask = tasksRepository.save(task);
        return tasksMapper.toResponse(savedTask);
    }

    @Transactional
    @Override
    public TaskResponse updateTask(Integer id, TaskRequest taskRequest) {
        Tasks task = tasksRepository.findTasksByIdAndStatus(id, RecordStatus.active)
                .orElseThrow(() -> new AppException(ERROR_CODE.TASK_NOT_EXISTED));

        // Validate: Check if TaskList exists (if taskListId is changed)
        if (!task.getTaskListId().equals(taskRequest.getTaskListId())) {
            taskListRepository.findById(taskRequest.getTaskListId())
                    .orElseThrow(() -> new AppException(ERROR_CODE.TASK_LIST_NOT_EXISTED));
        }

        task.setTaskListId(taskRequest.getTaskListId());
        task.setTitle(taskRequest.getTitle());
        task.setDescription(taskRequest.getDescription());
        task.setState(taskRequest.getState());
        task.setPriority(taskRequest.getPriority());

        Tasks updatedTask = tasksRepository.save(task);
        return tasksMapper.toResponse(updatedTask);
    }

    @Override
    public TaskResponse getTaskById(Integer id) {
        Tasks task = tasksRepository.findTasksByIdAndStatus(id, RecordStatus.active)
                .orElseThrow(() -> new AppException(ERROR_CODE.TASK_NOT_EXISTED));
        return tasksMapper.toResponse(task);
    }

    @Override
    public SimplePage<TaskResponse> getAllTasks(Pageable pageable, TaskFilterRequest filterRequest) {
        Specification<Tasks> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filterRequest.getTaskListId() != null) {
                predicates.add(cb.equal(root.get("taskListId"), filterRequest.getTaskListId()));
            }
            if (!StringUtils.isNullOrEmptyOrBlank(filterRequest.getTitle())) {
                predicates.add(cb.like(
                        cb.lower(root.get("title")), "%" + filterRequest.getTitle().toLowerCase() + "%"
                ));
            }
            if (!StringUtils.isNullOrEmptyOrBlank(filterRequest.getDescription())) {
                predicates.add(cb.like(
                        cb.lower(root.get("description")), "%" + filterRequest.getDescription().toLowerCase() + "%"
                ));
            }
            if (filterRequest.getState() != null) {
                predicates.add(cb.equal(root.get("state"), filterRequest.getState()));
            }
            if (filterRequest.getPriority() != null) {
                predicates.add(cb.equal(root.get("priority"), filterRequest.getPriority()));
            }
            if (filterRequest.getStatus() != null) {
                predicates.add(cb.equal(root.get("status"), filterRequest.getStatus()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Tasks> tasksPage = tasksRepository.findAll(spec, pageable);
        List<TaskResponse> taskResponseList = tasksPage.getContent()
                .stream()
                .map(tasksMapper::toResponse)
                .toList();

        return new SimplePage<>(
                taskResponseList,
                tasksPage.getTotalElements(),
                pageable
        );
    }

    @Transactional
    @Override
    public TaskResponse changeStatusTask(Integer id) {
        Tasks task = tasksRepository.findById(id)
                .orElseThrow(() -> new AppException(ERROR_CODE.TASK_NOT_EXISTED));

        if (task.getStatus() == RecordStatus.active) {
            task.setStatus(RecordStatus.inactive);
        } else {
            task.setStatus(RecordStatus.active);
        }

        Tasks updatedTask = tasksRepository.save(task);
        return tasksMapper.toResponse(updatedTask);
    }

    @Override
    public List<TaskResponse> getTasksByTaskListId(Integer taskListId) {
        // Validate: Check if TaskList exists
        taskListRepository.findById(taskListId)
                .orElseThrow(() -> new AppException(ERROR_CODE.TASK_LIST_NOT_EXISTED));

        List<Tasks> tasksList = tasksRepository.findAllByTaskListIdAndStatus(taskListId, RecordStatus.active);
        return tasksList.stream()
                .sorted(Comparator.comparingInt(Tasks::getPriority))
                .map(tasksMapper::toResponse)
                .collect(Collectors.toList());
    }
}



