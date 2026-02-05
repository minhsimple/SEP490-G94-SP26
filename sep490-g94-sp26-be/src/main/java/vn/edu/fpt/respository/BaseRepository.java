package vn.edu.fpt.respository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.NoRepositoryBean;

import java.util.UUID;

@NoRepositoryBean
public interface BaseRepository<T, ID> extends JpaRepository<T, UUID>, JpaSpecificationExecutor<T> {
}