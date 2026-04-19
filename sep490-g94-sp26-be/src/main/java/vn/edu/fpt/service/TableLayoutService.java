package vn.edu.fpt.service;

import vn.edu.fpt.dto.request.contract.ContractRequest;
import vn.edu.fpt.dto.response.tablelayout.TableLayoutResponse;

public interface TableLayoutService {
    TableLayoutResponse createTableLayout(ContractRequest.TableLayoutRequest tableLayoutRequest, Integer contractId);
    TableLayoutResponse getTableLayoutByContractId(Integer contractId);
    TableLayoutResponse updateTableLayout(ContractRequest.TableLayoutRequest tableLayoutRequest, Integer contractId);
}
