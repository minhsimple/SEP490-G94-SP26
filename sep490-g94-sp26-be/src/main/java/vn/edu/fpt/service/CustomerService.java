package vn.edu.fpt.service;

import org.springframework.data.domain.Pageable;
import vn.edu.fpt.dto.SimplePage;
import vn.edu.fpt.dto.request.customer.CustomerRequest;
import vn.edu.fpt.dto.request.customer.CustomerUpdateRequest;
import vn.edu.fpt.dto.request.customer.CustomersFilterRequest;
import vn.edu.fpt.dto.response.customer.CustomerResponse;

public interface CustomerService {
    CustomerResponse createCustomer(CustomerRequest request);
    CustomerResponse updateCustomer(Integer id, CustomerUpdateRequest customerUpdateRequest);
    CustomerResponse getCustomerById(Integer id);
    CustomerResponse changeStatusCustomer(Integer id);
    SimplePage<CustomerResponse> getAllCustomers(Pageable pageable, CustomersFilterRequest filterRequest);
}
