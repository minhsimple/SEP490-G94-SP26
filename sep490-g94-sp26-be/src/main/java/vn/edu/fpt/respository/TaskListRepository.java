package vn.edu.fpt.respository;

import vn.edu.fpt.entity.TaskList;
import vn.edu.fpt.util.enums.RecordStatus;

import java.util.Optional;

public interface TaskListRepository extends BaseRepository<TaskList, Integer>{
    Optional<TaskList> findTaskListByIdAndStatus(Integer id, RecordStatus recordStatus);
    Optional<TaskList> findTaskListByContractIdAndStatus(Integer contractId, RecordStatus recordStatus);
    boolean existsByContractId(Integer contractId);
    boolean existsByContractIdAndIdNot(Integer contractId, Integer id);
}

