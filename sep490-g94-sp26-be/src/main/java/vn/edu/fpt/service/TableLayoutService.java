package vn.edu.fpt.service;

import vn.edu.fpt.dto.request.tablelayout.TableLayoutRequest;
import vn.edu.fpt.dto.response.tablelayout.TableLayoutResponse;

public interface TableLayoutService {
    TableLayoutResponse createTableLayout(TableLayoutRequest tableLayoutRequest);
    TableLayoutResponse getTableLayoutByContractId(Integer contractId);
    TableLayoutResponse updateTableLayout(TableLayoutRequest tableLayoutRequest);
}
