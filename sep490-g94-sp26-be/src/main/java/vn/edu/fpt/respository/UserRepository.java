package vn.edu.fpt.respository;

import vn.edu.fpt.entity.User;
import org.springframework.stereotype.Repository;
import vn.edu.fpt.enums.RecordStatus;

import java.util.Optional;
import java.util.Set;

@Repository
public interface UserRepository extends BaseRepository<User, Integer> {
    Optional<User> findByEmailAndStatus(String email, RecordStatus status);

    Boolean existsByEmailAndStatus(String email, RecordStatus status);

    Optional<User> findByIdAndStatus(Integer id, RecordStatus status);

    Set<User> findAllByIdInAndIsActive(Set<Integer> ids, Boolean isActive);


}
