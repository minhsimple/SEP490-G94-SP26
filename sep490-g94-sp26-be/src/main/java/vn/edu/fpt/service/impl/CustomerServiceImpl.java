package vn.edu.fpt.service.impl;

import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.fpt.dto.SimplePage;
import vn.edu.fpt.dto.request.customer.CustomerRequest;
import vn.edu.fpt.dto.request.customer.CustomerUpdateRequest;
import vn.edu.fpt.dto.request.customer.CustomersFilterRequest;
import vn.edu.fpt.dto.response.customer.CustomerResponse;
import vn.edu.fpt.entity.Customer;
import vn.edu.fpt.entity.Location;
import vn.edu.fpt.enums.RecordStatus;
import vn.edu.fpt.exception.AppException;
import vn.edu.fpt.exception.ERROR_CODE;
import vn.edu.fpt.mapper.CustomerMapper;
import vn.edu.fpt.respository.CustomerRepository;
import vn.edu.fpt.respository.LocationRepository;
import vn.edu.fpt.service.CustomerService;
import vn.edu.fpt.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {
    private final CustomerRepository customerRepository;
    private final LocationRepository locationRepository;

    private final CustomerMapper customerMapper;

    @Override
    public CustomerResponse createCustomer(CustomerRequest request) {
        Location location = locationRepository.findByIdAndStatus(request.getLocationId(), RecordStatus.active).orElseThrow(
                    () -> new AppException(ERROR_CODE.LOCATION_NOT_EXISTED)
        );


        Customer customer = customerMapper.toEntity(request);
        Customer savedCustomer = customerRepository.save(customer);

        CustomerResponse customerResponse = customerMapper.toResponse(savedCustomer);
        customerResponse.setLocationName(location.getName());

        return customerResponse;
    }

    @Transactional
    @Override
    public CustomerResponse updateCustomer(Integer id, CustomerUpdateRequest customerUpdateRequest) {
        Customer customer = customerRepository.findByIdAndStatus(id, RecordStatus.active).orElseThrow(() -> new AppException(ERROR_CODE.CUSTOMER_NOT_EXISTED));


        if (customerUpdateRequest.getLocationId() != null) {
            Location location = locationRepository.findByIdAndStatus(customerUpdateRequest.getLocationId(), RecordStatus.active).orElseThrow(
                    () -> new AppException(ERROR_CODE.LOCATION_NOT_EXISTED)
            );
        }
        customerMapper.updateEntity(customer, customerUpdateRequest);

        CustomerResponse customerResponse = customerMapper.toResponse(customer);
        customerResponse.setLocationName(locationRepository.findByIdAndStatus(customerResponse.getLocationId(), RecordStatus.active).get().getName());

        return customerResponse;
    }

    @Override
    public CustomerResponse getCustomerById(Integer id) {
        Customer customer = customerRepository.findByIdAndStatus(id, RecordStatus.active)
                .orElseThrow(() -> new AppException(ERROR_CODE.CUSTOMER_NOT_EXISTED));

        CustomerResponse response = customerMapper.toResponse(customer);

        response.setLocationName(locationRepository
                .findByIdAndStatus(response.getLocationId(), RecordStatus.active).get().getName());

        return response;
    }

    @Transactional
    @Override
    public CustomerResponse changeStatusCustomer(Integer id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(()->new AppException(ERROR_CODE.CUSTOMER_NOT_EXISTED));

        if(customer.getStatus() == RecordStatus.active) {
            customer.setStatus(RecordStatus.inactive);
        } else {
            customer.setStatus(RecordStatus.active);
        }

        return customerMapper.toResponse(customer);
    }

    @Override
    public SimplePage<CustomerResponse> getAllCustomers(UserDetails userDetails, Pageable pageable, CustomersFilterRequest filterRequest) {
        Specification<Customer> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if(!StringUtils.isNullOrEmptyOrBlank(filterRequest.getFullName())) {
                predicates.add(cb.like(
                        cb.lower(root.get("fullName")),
                        "%" + filterRequest.getFullName().toLowerCase() + "%"
                ));
            }
            if(!StringUtils.isNullOrEmptyOrBlank(filterRequest.getCitizenIdNumber())) {
                predicates.add(cb.like(
                   root.get("citizenIdNumber"),
                   "%"+filterRequest.getCitizenIdNumber()+"%"
                ));
            }
            if(!StringUtils.isNullOrEmptyOrBlank(filterRequest.getPhone())) {
                predicates.add(cb.like(
                        root.get("phone"),
                        "%"+filterRequest.getPhone()+"%"
                ));
            }
            if(!StringUtils.isNullOrEmptyOrBlank(filterRequest.getEmail())) {
                predicates.add(cb.like(
                        cb.lower(root.get("email")),
                        "%"+filterRequest.getEmail().toLowerCase()+"%"
                ));
            }
            if(!StringUtils.isNullOrEmptyOrBlank(filterRequest.getTaxCode())) {
                predicates.add(cb.like(
                        root.get("taxCode"),
                        "%"+filterRequest.getTaxCode()+"%"
                ));
            }
            if(!StringUtils.isNullOrEmptyOrBlank(filterRequest.getAddress())) {
                predicates.add(cb.like(
                        cb.lower(root.get("address")),
                        "%"+filterRequest.getAddress().toLowerCase()+"%"
                ));
            }
            if(!StringUtils.isNullOrEmptyOrBlank(filterRequest.getNotes())) {
                predicates.add(cb.like(
                        cb.lower(root.get("notes")),
                        "%"+filterRequest.getNotes().toLowerCase()+"%"
                ));
            }
            if(filterRequest.getLocationId() != null) {
                predicates.add(cb.equal(
                        root.get("locationId"),
                        filterRequest.getLocationId()
                ));
            }

            predicates.add(cb.equal(root.get("status"), RecordStatus.active));
            predicates.add(cb.equal(root.get("createdBy"), userDetails.getUsername()));

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Customer> customerPage = customerRepository.findAll(spec, pageable);

        List<Customer> customers = customerPage.getContent();

        Set<Integer> locationIds = customers.stream()
                .map(Customer::getLocationId)
                .collect(Collectors.toSet());

        Map<Integer, String> locationMap = locationRepository.findAllById(locationIds)
                .stream()
                .collect(Collectors.toMap(
                        Location::getId,
                        Location::getName
                ));

        List<CustomerResponse> listResponses = customers.stream().map(customer -> {
            CustomerResponse response = customerMapper.toResponse(customer);
            response.setLocationName(locationMap.get(customer.getLocationId()));
            return response;
        }).toList();

        return new SimplePage<>(
                listResponses,
                customerPage.getTotalElements(),
                pageable
        );
    }
}
