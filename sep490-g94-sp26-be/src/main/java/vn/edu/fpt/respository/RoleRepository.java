package vn.edu.fpt.respository;

import org.springframework.stereotype.Repository;
import vn.edu.fpt.entity.Role;
import vn.edu.fpt.util.enums.RecordStatus;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoleRepository extends BaseRepository<Role, Integer> {
    @Override
    Optional<Role> findById(Integer id);

    List<Role> findAllByStatus(RecordStatus status);

    Optional<Role> findByIdAndStatus(Integer id, RecordStatus status);

    Optional<Role> findByCodeAndStatus(String code, RecordStatus status);

    Boolean existsByCodeAndStatus(String code, RecordStatus status);

    Boolean existsByCode(String code, RecordStatus status);

    Optional<Role> findRoleByCode(String code);


}
