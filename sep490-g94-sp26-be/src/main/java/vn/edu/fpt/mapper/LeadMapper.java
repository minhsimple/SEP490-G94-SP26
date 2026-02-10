package vn.edu.fpt.mapper;

import org.mapstruct.*;
import vn.edu.fpt.dto.request.lead.LeadRequest;
import vn.edu.fpt.dto.response.lead.LeadResponse;
import vn.edu.fpt.entity.Lead;

@Mapper(componentModel = "spring")
public interface LeadMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "leadState", ignore = true)
    Lead toEntity(LeadRequest request);

    @Mapping(target = "locationName", ignore = true)
    LeadResponse toResponse(Lead lead);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "leadState", ignore = true)
    void updateEntity(@MappingTarget Lead lead, LeadRequest request);
}