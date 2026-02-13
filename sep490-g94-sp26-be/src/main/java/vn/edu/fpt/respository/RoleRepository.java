package vn.edu.fpt.respository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.edu.fpt.entity.Role;

import java.util.Optional;
import java.util.UUID;

public interface RoleRepository extends JpaRepository<Role, Integer> {
    @Override
    Optional<Role> findById(Integer id);

    Optional<Role> findRoleByCode(String code);

}
