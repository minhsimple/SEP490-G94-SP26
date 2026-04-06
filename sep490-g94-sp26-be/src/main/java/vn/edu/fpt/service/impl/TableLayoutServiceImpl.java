package vn.edu.fpt.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.edu.fpt.dto.request.contract.ContractRequest;
import vn.edu.fpt.dto.response.tablelayout.TableLayoutResponse;
import vn.edu.fpt.entity.Contract;
import vn.edu.fpt.entity.TableLayout;
import vn.edu.fpt.exception.AppException;
import vn.edu.fpt.exception.ERROR_CODE;
import vn.edu.fpt.respository.ContractRepository;
import vn.edu.fpt.respository.TableLayoutRepository;
import vn.edu.fpt.service.TableLayoutService;
import vn.edu.fpt.util.enums.RecordStatus;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TableLayoutServiceImpl implements TableLayoutService {
    private final TableLayoutRepository tableLayoutRepository;
    private final ContractRepository contractRepository;

    @Override
    public TableLayoutResponse createTableLayout(ContractRequest.TableLayoutRequest tableLayoutRequest, Integer contractId) {
        Contract contract = contractRepository.findByIdAndStatus(contractId, RecordStatus.active)
                .orElseThrow(() -> new AppException(ERROR_CODE.BOOKING_NOT_EXISTED));

        Integer numberOfTables = tableLayoutRequest.getTableLayoutDetailRequestList()
                .stream()
                .reduce(0, (sum, detail) -> sum + detail.getNumberOfTables(), Integer::sum);

        if (contract.getExpectedTables().compareTo(numberOfTables) < 0) {
            throw new AppException(ERROR_CODE.TABLE_LAYOUT_TOO_MANY_TABLES);
        }

        List<TableLayout> tableLayoutList = extractTableLayoutFromRequest(tableLayoutRequest, contractId);
        List<TableLayout> savedListTableLayouts = tableLayoutRepository.saveAll(tableLayoutList);

        return getTableLayoutResponse(savedListTableLayouts);
    }

    @Override
    public TableLayoutResponse getTableLayoutByContractId(Integer contractId) {
        contractRepository.findByIdAndStatus(contractId, RecordStatus.active)
                .orElseThrow(() -> new AppException(ERROR_CODE.BOOKING_NOT_EXISTED));

        List<TableLayout> tableLayoutList = tableLayoutRepository.findAllByContractId(contractId);

        return getTableLayoutResponse(tableLayoutList);
    }

    @Override
    public TableLayoutResponse updateTableLayout(ContractRequest.TableLayoutRequest tableLayoutRequest, Integer contractId) {
        Contract contract = contractRepository.findByIdAndStatus(contractId, RecordStatus.active)
                .orElseThrow(() -> new AppException(ERROR_CODE.BOOKING_NOT_EXISTED));

        Integer numberOfTables = tableLayoutRequest.getTableLayoutDetailRequestList()
                .stream()
                .reduce(0, (sum, detail) -> sum + detail.getNumberOfTables(), Integer::sum);

        if (contract.getExpectedTables().compareTo(numberOfTables) < 0) {
            throw new AppException(ERROR_CODE.TABLE_LAYOUT_TOO_MANY_TABLES);
        }
        tableLayoutRepository.deleteByContractId(contractId);

        List<TableLayout> tableLayoutList = extractTableLayoutFromRequest(tableLayoutRequest, contractId);
        List<TableLayout> savedListTableLayouts = tableLayoutRepository.saveAll(tableLayoutList);

        return getTableLayoutResponse(savedListTableLayouts);
    }

    private List<TableLayout> extractTableLayoutFromRequest(ContractRequest.TableLayoutRequest tableLayoutRequest, Integer contractId) {

        return tableLayoutRequest.getTableLayoutDetailRequestList()
                .stream()
                .map(tableLayoutDetailRequest -> {
                    TableLayout tableLayout = new TableLayout();
                    tableLayout.setContractId(contractId);
                    tableLayout.setTableLayout(tableLayoutDetailRequest.getTableLayoutEnum());
                    tableLayout.setGroupName(tableLayoutDetailRequest.getGroupName());
                    tableLayout.setNumberOfTables(tableLayoutDetailRequest.getNumberOfTables());
                    return tableLayout;
                }).toList();
    }

    private TableLayoutResponse getTableLayoutResponse(List<TableLayout> tableLayoutList) {
        if (tableLayoutList == null || tableLayoutList.isEmpty()) {
            return null;
        }

        TableLayoutResponse tableLayoutResponse = new TableLayoutResponse();
        tableLayoutResponse.setContractId(tableLayoutList.getFirst().getContractId());

        Map<String, List<TableLayoutResponse.TableLayoutDetailResponse>> tableLayoutDetails = tableLayoutList.stream()
                .collect(Collectors.groupingBy(
                        tableLayout -> tableLayout.getTableLayout().name(),
                        Collectors.mapping(tableLayout -> {
                            TableLayoutResponse.TableLayoutDetailResponse detailResponse = new TableLayoutResponse.TableLayoutDetailResponse();
                            detailResponse.setId(tableLayout.getId());
                            detailResponse.setGroupName(tableLayout.getGroupName());
                            detailResponse.setNumberOfTables(tableLayout.getNumberOfTables());
                            return detailResponse;
                        }, Collectors.toList())
                ));
        tableLayoutResponse.setTableLayoutDetails(tableLayoutDetails);

        return tableLayoutResponse;
    }
}
