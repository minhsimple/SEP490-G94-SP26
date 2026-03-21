package vn.edu.fpt.service;

import org.springframework.data.domain.Pageable;
import vn.edu.fpt.dto.SimplePage;
import vn.edu.fpt.dto.request.contract.ContractFilterRequest;
import vn.edu.fpt.dto.request.contract.ContractRequest;
import vn.edu.fpt.dto.request.contract.ContractStatusRequest;
import vn.edu.fpt.dto.response.contract.ContractResponse;

public interface ContractService {

    ContractResponse createContract(ContractRequest request);

    ContractResponse updateContract(Integer id, ContractRequest request);

    ContractResponse getContractById(Integer id);

    SimplePage<ContractResponse> searchContracts(Pageable pageable, ContractFilterRequest filter);

    ContractResponse changeContractStatus(Integer id);

    ContractResponse updateContractState(ContractStatusRequest request);
}


