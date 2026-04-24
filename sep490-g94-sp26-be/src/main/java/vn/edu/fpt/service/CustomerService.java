package vn.edu.fpt.service;

import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.multipart.MultipartFile;
import vn.edu.fpt.dto.SimplePage;
import vn.edu.fpt.dto.request.customer.CustomerRequest;
import vn.edu.fpt.dto.request.customer.CustomerUpdateRequest;
import vn.edu.fpt.dto.request.customer.CustomersFilterRequest;
import vn.edu.fpt.dto.response.customer.CustomerResponse;

import java.util.List;

public interface CustomerService {
    CustomerResponse createCustomer(CustomerRequest request, List<MultipartFile> imageFiles) throws Exception;
    CustomerResponse updateCustomer(Integer id, CustomerUpdateRequest customerUpdateRequest, List<MultipartFile> imageFiles) throws Exception;
    CustomerResponse getCustomerById(Integer id);
    CustomerResponse changeStatusCustomer(Integer id);
    SimplePage<CustomerResponse> getAllCustomers(UserDetails userDetails, Pageable pageable, CustomersFilterRequest filterRequest);
}
