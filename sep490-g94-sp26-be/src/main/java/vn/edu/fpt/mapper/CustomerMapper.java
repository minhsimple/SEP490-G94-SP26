package vn.edu.fpt.mapper;

import org.mapstruct.*;
import vn.edu.fpt.dto.request.customer.CustomerRequest;
import vn.edu.fpt.dto.request.customer.CustomerUpdateRequest;
import vn.edu.fpt.dto.response.customer.CustomerResponse;
import vn.edu.fpt.entity.Customer;

@Mapper(componentModel = "spring")
public interface CustomerMapper {
    @Mapping(target="id", ignore = true)
    Customer toEntity(CustomerRequest request);

    @Mapping(target="locationName", ignore=true)
    CustomerResponse toResponse(Customer customer);

    @Mapping(target = "id", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(@MappingTarget Customer customer, CustomerUpdateRequest updateRequest);
}
