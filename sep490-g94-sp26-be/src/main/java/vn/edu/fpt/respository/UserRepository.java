package vn.edu.fpt.respository;

import vn.edu.fpt.entity.User;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends BaseRepository<User, Integer> {
    Optional<User> findByEmail(String email);
}

