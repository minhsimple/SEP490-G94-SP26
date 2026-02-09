package vn.edu.fpt.respository;

import vn.edu.fpt.entity.User;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Repository
public interface UserRepository extends BaseRepository<User, Integer> {
    Optional<User> findByEmailAndIsActive(String email, Boolean isActive);

    Optional<User> findByIdAndIsActive(UUID id, Boolean isActive);

    Set<User> findAllByIdInAndIsActive(Set<UUID> ids, Boolean isActive);
}
