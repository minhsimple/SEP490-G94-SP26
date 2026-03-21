package vn.edu.fpt.mapper;

import org.mapstruct.*;
import vn.edu.fpt.dto.request.contract.ContractRequest;
import vn.edu.fpt.dto.response.contract.ContractResponse;
import vn.edu.fpt.entity.Contract;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Mapper(
        componentModel = "spring",
        builder = @Builder(disableBuilder = true)
)
public interface ContractMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "contractNo", ignore = true)
    @Mapping(target = "contractState", ignore = true)
    @Mapping(target = "startTime", ignore = true)
    @Mapping(target = "endTime", ignore = true)
    Contract toEntity(ContractRequest request);

    @Mapping(target = "bookingDate", source = "startTime", qualifiedByName = "toLocalDate")
    ContractResponse toResponse(Contract contract);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "contractNo", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "contractState", ignore = true)
    @Mapping(target = "startTime", ignore = true)
    @Mapping(target = "endTime", ignore = true)
    void updateEntity(@MappingTarget Contract contract, ContractRequest request);

    @Named("toLocalDate")
    default LocalDate toLocalDate(LocalDateTime dateTime) {
        return dateTime != null ? dateTime.toLocalDate() : null;
    }
}

