package vn.edu.fpt.respository;

import vn.edu.fpt.entity.Customer;
import vn.edu.fpt.enums.RecordStatus;

import java.util.Optional;

public interface CustomerRepository extends BaseRepository<Customer, Integer> {
    Optional<Customer> findByIdAndStatus(Integer id, RecordStatus status);
}
