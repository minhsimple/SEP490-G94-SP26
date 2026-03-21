package vn.edu.fpt.respository;

import vn.edu.fpt.entity.Contract;
import vn.edu.fpt.util.enums.ContractState;
import vn.edu.fpt.util.enums.RecordStatus;

import java.util.List;
import java.util.Optional;

public interface ContractRepository extends BaseRepository<Contract, Integer> {

    Optional<Contract> findByIdAndStatus(Integer id, RecordStatus status);

    List<Contract> findAllByStatus(RecordStatus status);

    Optional<Contract> findByBookingNo(String bookingNo);

    Boolean existsByBookingNo(String bookingNo);

    List<Contract> findAllByCustomerId(Integer customerId);

    List<Contract> findAllByHallIdAndContractState(Integer hallId, ContractState bookingState);
}


