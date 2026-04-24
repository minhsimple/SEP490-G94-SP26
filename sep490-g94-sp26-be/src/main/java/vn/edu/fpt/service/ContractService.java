package vn.edu.fpt.service;

import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;
import vn.edu.fpt.dto.SimplePage;
import vn.edu.fpt.dto.request.contract.CalenderContractRequest;
import vn.edu.fpt.dto.request.contract.ContractFilterRequest;
import vn.edu.fpt.dto.request.contract.ContractRequest;
import vn.edu.fpt.dto.request.contract.ContractStatusRequest;
import vn.edu.fpt.dto.response.contract.CalenderContractResponse;
import vn.edu.fpt.dto.response.contract.ContractResponse;

import java.util.List;

public interface ContractService {

    ContractResponse createContract(ContractRequest request, List<MultipartFile> imageFiles) throws Exception;

    ContractResponse updateContract(Integer id, ContractRequest request, List<MultipartFile> imageFiles) throws Exception;

    ContractResponse getContractById(Integer id);

    SimplePage<ContractResponse> searchContracts(Pageable pageable, ContractFilterRequest filter);

    ContractResponse changeContractStatus(Integer id);

    ContractResponse updateContractState(ContractStatusRequest request);

    List<CalenderContractResponse> getAllTimeTable(CalenderContractRequest request);
}


