package vn.edu.fpt.service.impl;

import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.fpt.dto.request.task.TaskListFilterRequest;
import vn.edu.fpt.dto.request.task.TaskListRequest;
import vn.edu.fpt.dto.response.task.TaskListResponse;
import vn.edu.fpt.dto.response.task.TaskCategoryGroupResponse;
import vn.edu.fpt.dto.response.task.TaskResponse;
import vn.edu.fpt.entity.Contract;
import vn.edu.fpt.entity.Hall;
import vn.edu.fpt.entity.TaskList;
import vn.edu.fpt.entity.Tasks;
import vn.edu.fpt.entity.TaskCategory;
import vn.edu.fpt.exception.AppException;
import vn.edu.fpt.exception.ERROR_CODE;
import vn.edu.fpt.mapper.TasksMapper;
import vn.edu.fpt.respository.ContractRepository;
import vn.edu.fpt.respository.HallRepository;
import vn.edu.fpt.respository.TaskListRepository;
import vn.edu.fpt.respository.TasksRepository;
import vn.edu.fpt.respository.TaskCategoryRepository;
import vn.edu.fpt.service.TaskListService;
import vn.edu.fpt.util.StringUtils;
import vn.edu.fpt.util.enums.RecordStatus;
import vn.edu.fpt.util.enums.TaskState;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskListServiceImpl implements TaskListService {
    private final TaskListRepository taskListRepository;
    private final TasksRepository tasksRepository;
    private final TasksMapper tasksMapper;
    private final ContractRepository contractRepository;
    private final HallRepository hallRepository;
    private final TaskCategoryRepository taskCategoryRepository;

    @Transactional
    @Override
    public TaskListResponse createNewTaskList(TaskListRequest taskListRequest) {
        // Validate: Check if taskList already exists for this contract
        if (taskListRepository.existsByContractId(taskListRequest.getContractId())) {
            throw new AppException(ERROR_CODE.TASK_LIST_EXISTED);
        }

        // Create TaskList
        TaskList taskList = TaskList.builder()
                .contractId(taskListRequest.getContractId())
                .name(taskListRequest.getName())
                .description(taskListRequest.getDescription())
                .build();

        TaskList savedTaskList = taskListRepository.save(taskList);
        Integer taskListId = savedTaskList.getId();

        // Create Tasks for this TaskList
        List<Tasks> tasksList = getTasksList(taskListRequest, taskListId);
        tasksList = tasksRepository.saveAll(tasksList);

        return mapToTaskListResponse(savedTaskList, tasksList);
    }

    @Override
    public TaskListResponse getTaskListById(Integer id) {
        TaskList taskList = taskListRepository.findTaskListByIdAndStatus(id, RecordStatus.active)
                .orElseThrow(() -> new AppException(ERROR_CODE.TASK_LIST_NOT_EXISTED));

        List<Tasks> tasksList = tasksRepository.findAllByTaskListIdAndStatus(id, RecordStatus.active);

        return mapToTaskListResponse(taskList, tasksList);
    }

    @Override
    public TaskListResponse getTaskListByContractId(Integer contractId) {
        TaskList taskList = taskListRepository.findTaskListByContractIdAndStatus(contractId, RecordStatus.active)
                .orElseThrow(() -> new AppException(ERROR_CODE.TASK_LIST_NOT_EXISTED));

        List<Tasks> tasksList = tasksRepository.findAllByTaskListIdAndStatus(taskList.getId(), RecordStatus.active);

        return mapToTaskListResponse(taskList, tasksList);
    }

    @Override
    public List<TaskListResponse> getAllTaskList(Integer coordinatorId) {
        // Get contract IDs using query - nếu coordinatorId là null thì lấy tất cả, nếu không lấy theo coordinatorId
        List<Integer> contractIds = contractRepository.findContractIdsByCoordinator(coordinatorId);

        // Get all TaskLists từ các contracts
        Specification<TaskList> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Filter by contractIds
            if (!contractIds.isEmpty()) {
                predicates.add(root.get("contractId").in(contractIds));
            } else {
                // Nếu không có contract nào thì trả về empty list
                return cb.and(predicates.toArray(new Predicate[0]));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        List<TaskList> taskListList = taskListRepository.findAll(spec);

        Map<Integer, List<Tasks>> tasksMap = tasksRepository.findAllByTaskListIdInAndStatus(
                taskListList.stream().map(TaskList::getId).collect(Collectors.toSet()),
                RecordStatus.active
        ).stream().collect(Collectors.groupingBy(Tasks::getTaskListId));

        return taskListList.stream()
                .map(taskList -> mapToTaskListResponse(taskList,
                    tasksMap.getOrDefault(taskList.getId(), Collections.emptyList()).stream()
                        .sorted(Comparator.comparingInt(Tasks::getPriority))
                        .toList()))
                .toList();
    }

    @Transactional
    @Override
    public TaskListResponse changeStatusTaskList(Integer id) {
        TaskList taskList = taskListRepository.findById(id)
                .orElseThrow(() -> new AppException(ERROR_CODE.TASK_LIST_NOT_EXISTED));

        if (taskList.getStatus() == RecordStatus.active) {
            taskList.setStatus(RecordStatus.inactive);
        } else {
            taskList.setStatus(RecordStatus.active);
        }

        taskListRepository.save(taskList);
        List<Tasks> tasksList = tasksRepository.findAllByTaskListIdAndStatus(id, RecordStatus.active);

        return mapToTaskListResponse(taskList, tasksList);
    }

    @Transactional
    @Override
    public TaskListResponse updateTaskList(Integer taskListId, TaskListRequest taskListRequest) {
        TaskList taskList = taskListRepository.findTaskListByIdAndStatus(taskListId, RecordStatus.active)
                .orElseThrow(() -> new AppException(ERROR_CODE.TASK_LIST_NOT_EXISTED));

        // Check if contract id is being changed
        if (!Objects.equals(taskList.getContractId(), taskListRequest.getContractId())) {
            if (taskListRepository.existsByContractIdAndIdNot(taskListRequest.getContractId(), taskListId)) {
                throw new AppException(ERROR_CODE.TASK_LIST_EXISTED);
            }
        }

        taskList.setName(taskListRequest.getName());
        taskList.setDescription(taskListRequest.getDescription());
        taskList.setContractId(taskListRequest.getContractId());

        // Delete existing tasks and create new ones
        tasksRepository.deleteByTaskListId(taskListId);

        List<Tasks> tasksList = getTasksList(taskListRequest, taskListId);
        tasksList = tasksRepository.saveAll(tasksList);

        return mapToTaskListResponse(taskList, tasksList);
    }

    private List<Tasks> getTasksList(TaskListRequest taskListRequest, Integer taskListId) {
        if (taskListRequest.getTaskCategoryGroups() == null || taskListRequest.getTaskCategoryGroups().isEmpty()) {
            return new ArrayList<>();
        }

        List<Tasks> allTasks = new ArrayList<>();

        for (TaskListRequest.TaskCategoryGroupRequest categoryGroup : taskListRequest.getTaskCategoryGroups()) {
            if (categoryGroup.getTasks() == null || categoryGroup.getTasks().isEmpty()) {
                continue;
            }

            // Tạo TaskCategory nếu category title không null
            Integer taskCategoryId = null;
            if (categoryGroup.getTitle() != null && !categoryGroup.getTitle().isEmpty()) {
                TaskCategory taskCategory = TaskCategory.builder()
                        .taskListId(taskListId)
                        .title(categoryGroup.getTitle())
                        .build();
                TaskCategory savedCategory = taskCategoryRepository.save(taskCategory);
                taskCategoryId = savedCategory.getId();
            }

            // Tạo Tasks cho category này
            final Integer finalTaskCategoryId = taskCategoryId;
            List<Tasks> categoryTasks = categoryGroup.getTasks().stream()
                    .map(task -> Tasks.builder()
                            .taskListId(taskListId)
                            .taskCategoryId(finalTaskCategoryId)
                            .title(task.getTitle())
                            .description(task.getDescription())
                            .priority(task.getPriority())
                            .state(task.getState())
                            .build())
                    .collect(Collectors.toList());

            allTasks.addAll(categoryTasks);
        }

        return allTasks;
    }

    private TaskListResponse mapToTaskListResponse(TaskList taskList, List<Tasks> tasksList) {
        // Lấy contract info
        Contract contract = contractRepository.findById(taskList.getContractId()).orElse(null);
        Hall hall = contract != null ? hallRepository.findById(contract.getHallId()).orElse(null) : null;

        // Group tasks by category
        Map<Integer, List<Tasks>> tasksByCategory = tasksList.stream()
                .collect(Collectors.groupingBy(task -> task.getTaskCategoryId() != null ? task.getTaskCategoryId() : 0));

        // Get all task categories
        Set<Integer> categoryIds = tasksByCategory.keySet();
        Map<Integer, TaskCategory> categoryMap = new HashMap<>();
        if (!categoryIds.isEmpty() && categoryIds.stream().anyMatch(id -> id != 0)) {
            categoryMap.putAll(
                    taskCategoryRepository.findAllById(
                            categoryIds.stream().filter(id -> id != 0).collect(Collectors.toSet())
                    ).stream()
                    .collect(Collectors.toMap(TaskCategory::getId, c -> c))
            );
        }

        // Build task category groups
        List<TaskCategoryGroupResponse> taskCategoryGroups = tasksByCategory.entrySet().stream()
                .map(entry -> {
                    Integer categoryId = entry.getKey();
                    List<Tasks> tasksInCategory = entry.getValue();

                    List<TaskResponse> tasksResponse = tasksInCategory.stream()
                            .sorted(Comparator.comparingInt(Tasks::getPriority))
                            .map(tasksMapper::toResponse)
                            .toList();

                    if (categoryId == 0) {
                        // Tasks without category
                        return TaskCategoryGroupResponse.builder()
                                .categoryId(null)
                                .categoryTitle("Không có danh mục")
                                .tasks(tasksResponse)
                                .build();
                    } else {
                        TaskCategory category = categoryMap.get(categoryId);
                        return TaskCategoryGroupResponse.builder()
                                .categoryId(categoryId)
                                .categoryTitle(category != null ? category.getTitle() : "Danh mục không tồn tại")
                                .tasks(tasksResponse)
                                .build();
                    }
                })
                .sorted(Comparator.comparingInt((TaskCategoryGroupResponse g) -> g.getCategoryId() != null ? g.getCategoryId() : Integer.MAX_VALUE))
                .toList();

        return TaskListResponse.builder()
                .id(taskList.getId())
                .contractId(taskList.getContractId())
                .name(taskList.getName())
                .description(taskList.getDescription())
                .contractNo(contract != null ? contract.getContractNo() : null)
                .hallName(hall != null ? hall.getName() : null)
                .bookingTime(contract != null ? contract.getBookingTime() : null)
                .status(taskList.getStatus())
                .taskCategoryGroups(taskCategoryGroups)
                .build();
    }
}






