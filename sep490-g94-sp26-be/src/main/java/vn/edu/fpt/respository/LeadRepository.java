package vn.edu.fpt.respository;

import vn.edu.fpt.entity.Lead;
import vn.edu.fpt.entity.User;
import vn.edu.fpt.enums.RecordStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface LeadRepository extends BaseRepository<Lead,Integer>{

    Optional<Lead> findByIdAndStatus(Integer id, RecordStatus status);

    Page<Lead> findAllByStatus(RecordStatus status, Pageable pageable);
}
