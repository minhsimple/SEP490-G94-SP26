package vn.edu.fpt.service;

import org.springframework.data.domain.Pageable;
import vn.edu.fpt.dto.SimplePage;
import vn.edu.fpt.dto.request.booking.BookingFilterRequest;
import vn.edu.fpt.dto.request.booking.BookingRequest;
import vn.edu.fpt.dto.request.booking.ContractStatusRequest;
import vn.edu.fpt.dto.response.booking.BookingResponse;

public interface ContractService {

    BookingResponse createContract(BookingRequest request);

    BookingResponse updateContract(Integer id, BookingRequest request);

    BookingResponse getContractById(Integer id);

    SimplePage<BookingResponse> searchContracts(Pageable pageable, BookingFilterRequest filter);

    BookingResponse changeContractStatus(Integer id);

    BookingResponse updateContractState(ContractStatusRequest request);
}


