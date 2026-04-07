package vn.edu.fpt.respository;

import org.springframework.data.jpa.repository.Modifying;
import vn.edu.fpt.entity.TaskCategory;
import vn.edu.fpt.util.enums.RecordStatus;

import java.util.List;
import java.util.Optional;

public interface TaskCategoryRepository extends BaseRepository<TaskCategory, Integer> {
    Optional<TaskCategory> findByIdAndStatus(Integer id, RecordStatus status);
    List<TaskCategory> findAllByTaskListId(Integer taskListId);
    @Modifying
    void deleteByTaskListId(Integer taskListId);
}

