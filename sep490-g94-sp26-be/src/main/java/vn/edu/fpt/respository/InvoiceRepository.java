package vn.edu.fpt.respository;

import vn.edu.fpt.entity.Invoice;
import vn.edu.fpt.util.enums.RecordStatus;

import java.util.Optional;

public interface InvoiceRepository extends BaseRepository<Invoice, Integer>{
    Optional<Invoice> findByIdAndStatus(Integer id, RecordStatus status);
}
