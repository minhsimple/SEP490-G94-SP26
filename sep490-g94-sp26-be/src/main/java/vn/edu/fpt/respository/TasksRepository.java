package vn.edu.fpt.respository;

import vn.edu.fpt.entity.Tasks;
import vn.edu.fpt.util.enums.RecordStatus;
import vn.edu.fpt.util.enums.TaskState;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface TasksRepository extends BaseRepository<Tasks, Integer>{
    Optional<Tasks> findTasksByIdAndStatus(Integer id, RecordStatus recordStatus);

    List<Tasks> findAllByTaskListIdAndStatus(Integer taskListId, RecordStatus recordStatus);

    List<Tasks> findAllByTaskListIdInAndStatus(Set<Integer> taskListIds, RecordStatus recordStatus);

    List<Tasks> findAllByTaskListId(Integer taskListId);

    void deleteByTaskListId(Integer taskListId);

    Boolean existsByTaskListIdAndStatusAndState(Integer taskListId, RecordStatus status, TaskState state);
}


