package vn.edu.fpt.respository;

import org.springframework.data.jpa.repository.Query;
import vn.edu.fpt.dto.response.contract.CalenderContractResponse;
import vn.edu.fpt.entity.Contract;
import vn.edu.fpt.util.enums.ContractState;
import vn.edu.fpt.util.enums.RecordStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface ContractRepository extends BaseRepository<Contract, Integer> {

    Optional<Contract> findByIdAndStatus(Integer id, RecordStatus status);

    List<Contract> findAllByIdIn(Set<Integer> ids);

    List<Contract> findAllByStatus(RecordStatus status);

    Optional<Contract> findByContractNo(String bookingNo);

    Boolean existsByStartTimeAndEndTimeAndContractStateAndHallId(LocalDateTime startTime, LocalDateTime endTime, ContractState contractState, Integer hallId);

    List<Contract> findAllByCustomerId(Integer customerId);

    List<Contract> findAllByHallIdAndContractState(Integer hallId, ContractState bookingState);


    @Query("""
    SELECT new vn.edu.fpt.dto.response.contract.CalenderContractResponse(
        c.startTime,
        c.endTime,
        c.bookingTime,
        c.hallId,
        h.name
    )
    FROM Contract c
    LEFT JOIN Hall h ON c.hallId = h.id
    WHERE (:hallId IS NULL OR c.hallId = :hallId)
      AND (:to IS NULL OR c.startTime < :to)
      AND (:from IS NULL OR c.endTime > :from)
""")
    List<CalenderContractResponse> getCalendarFromContract(
            Integer hallId,
            LocalDateTime from,
            LocalDateTime to
    );
}


