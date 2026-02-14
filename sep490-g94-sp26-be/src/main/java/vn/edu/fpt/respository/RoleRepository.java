package vn.edu.fpt.respository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.edu.fpt.dto.response.role.RoleResponse;
import vn.edu.fpt.entity.Role;
import vn.edu.fpt.enums.RecordStatus;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoleRepository extends JpaRepository<Role, Integer> {
    @Override
    Optional<Role> findById(Integer id);

    List<Role> findAllByStatus(RecordStatus status);

    Optional<Role> findByIdAndStatus(Integer id, RecordStatus status);

    Optional<Role> findByCodeAndStatus(String code, RecordStatus status);

    Boolean existsByCodeAndStatus(String code, RecordStatus status);

    Optional<Role> findRoleByCode(String code);

    RoleResponse changeRoleStatus(Integer id);

}
