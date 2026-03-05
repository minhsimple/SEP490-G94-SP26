package vn.edu.fpt.respository;

import vn.edu.fpt.entity.Customer;
import vn.edu.fpt.enums.RecordStatus;

import java.util.Optional;

public interface CustomerRepository extends BaseRepository<Customer, Integer> {
    Optional<Customer> findByIdAndStatus(Integer id, RecordStatus status);
    boolean existsByCitizenIdNumber(String citizenIdNumber);
    boolean existsByCitizenIdNumberAndIdNot(String citizenIdNumber, Integer id);
    boolean existsByPhone(String phone);
    boolean existsByPhoneAndIdNot(String phone, Integer id);
    boolean existsByEmail(String email);
    boolean existsByEmailAndIdNot(String email, Integer id);
    boolean existsByTaxCode(String taxCode);
    boolean existsByTaxCodeAndIdNot(String taxCode, Integer id);
}
