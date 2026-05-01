package vn.edu.fpt.service.impl;

import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import vn.edu.fpt.dto.SimplePage;
import vn.edu.fpt.dto.request.customer.CustomerRequest;
import vn.edu.fpt.dto.request.customer.CustomerUpdateRequest;
import vn.edu.fpt.dto.request.customer.CustomersFilterRequest;
import vn.edu.fpt.dto.response.customer.CustomerResponse;
import vn.edu.fpt.entity.*;
import vn.edu.fpt.respository.*;
import vn.edu.fpt.service.ImageAssetService;
import vn.edu.fpt.util.MediaAssetUtil;
import vn.edu.fpt.util.enums.MediaAssetOwnerType;
import vn.edu.fpt.util.enums.RecordStatus;
import vn.edu.fpt.exception.AppException;
import vn.edu.fpt.exception.ERROR_CODE;
import vn.edu.fpt.mapper.CustomerMapper;
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
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final MediaAssetRepository mediaAssetRepository;

    private final CustomerMapper customerMapper;

    private final ImageAssetService imageAssetService;

    @Override
    public CustomerResponse createCustomer(CustomerRequest request, List<MultipartFile> imageFiles) throws Exception {
        Location location = locationRepository.findByIdAndStatus(request.getLocationId(), RecordStatus.active).orElseThrow(
                () -> new AppException(ERROR_CODE.LOCATION_NOT_EXISTED)
        );

        if (customerRepository.existsByPhone(request.getPhone())) {
            throw new AppException(ERROR_CODE.CUSTOMER_PHONE_EXISTED);
        }
        if(customerRepository.existsByCitizenIdNumber(request.getCitizenIdNumber())) {
            throw new AppException(ERROR_CODE.CUSTOMER_CITIZEN_ID_NUMBER_EXISTED);
        }
        if (request.getEmail() != null && customerRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ERROR_CODE.CUSTOMER_EMAIL_EXISTED);
        }


        Customer customer = customerMapper.toEntity(request);
        Customer savedCustomer = customerRepository.save(customer);

        List<MediaAsset> mediaAssets = MediaAssetUtil.uploadListImageAssets(imageAssetService, mediaAssetRepository, imageFiles, savedCustomer.getId(), MediaAssetOwnerType.CUSTOMER_CITIZEN_ID_CARD, null);

        CustomerResponse customerResponse = customerMapper.toResponse(savedCustomer);
        customerResponse.setLocationName(location.getName());
        customerResponse.setImageUrls(MediaAssetUtil.getPresignedListImageUrls(imageAssetService, mediaAssets));

        return customerResponse;
    }

    @Transactional
    @Override
    public CustomerResponse updateCustomer(Integer id, CustomerUpdateRequest customerUpdateRequest, List<MultipartFile> imageFiles) throws Exception {
        Customer customer = customerRepository
                .findByIdAndStatus(id, RecordStatus.active)
                .orElseThrow(() -> new AppException(ERROR_CODE.CUSTOMER_NOT_EXISTED));

        if (customerUpdateRequest.getPhone() != null && customerRepository.existsByPhoneAndIdNot(customerUpdateRequest.getPhone(), id)) {
            throw new AppException(ERROR_CODE.CUSTOMER_PHONE_EXISTED);
        }
        if (customerUpdateRequest.getCitizenIdNumber() != null && customerRepository.existsByCitizenIdNumberAndIdNot(customerUpdateRequest.getCitizenIdNumber(), id)) {
            throw new AppException(ERROR_CODE.CUSTOMER_CITIZEN_ID_NUMBER_EXISTED);
        }
        if (customerUpdateRequest.getEmail() != null && customerRepository.existsByEmailAndIdNot(customerUpdateRequest.getEmail(), id)) {
            throw new AppException(ERROR_CODE.CUSTOMER_EMAIL_EXISTED);
        }

        if (customerUpdateRequest.getLocationId() != null) {
            locationRepository.findByIdAndStatus(customerUpdateRequest.getLocationId(), RecordStatus.active).orElseThrow(
                    () -> new AppException(ERROR_CODE.LOCATION_NOT_EXISTED)
            );
        }
        customerMapper.updateEntity(customer, customerUpdateRequest);

        List<MediaAsset> mediaAssetList = MediaAssetUtil.getListMediaAssetByEntityIdAndOwnerType(mediaAssetRepository, id, MediaAssetOwnerType.CUSTOMER_CITIZEN_ID_CARD);
        if (imageFiles != null && !imageFiles.isEmpty()) {
            if (imageFiles.size() != 2) {
                throw new AppException(ERROR_CODE.CUSTOMER_IMAGE_FILES_EXCEED);
            }
            if (mediaAssetList != null && !mediaAssetList.isEmpty()) {
                imageAssetService.deleteFolder(mediaAssetList.getFirst().getImageOrigKey());
            }
            mediaAssetList = MediaAssetUtil.uploadListImageAssets(imageAssetService, mediaAssetRepository, imageFiles, id, MediaAssetOwnerType.CUSTOMER_CITIZEN_ID_CARD, mediaAssetList);
        }

        CustomerResponse customerResponse = customerMapper.toResponse(customer);
        customerResponse.setLocationName(locationRepository.findById(customerResponse.getLocationId()).get().getName());
        customerResponse.setImageUrls(MediaAssetUtil.getPresignedListImageUrls(imageAssetService, mediaAssetList));

        return customerResponse;
    }

    @Override
    public CustomerResponse getCustomerById(Integer id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new AppException(ERROR_CODE.CUSTOMER_NOT_EXISTED));
        List<MediaAsset> mediaAssetList = MediaAssetUtil.getListMediaAssetByEntityIdAndOwnerType(mediaAssetRepository, id, MediaAssetOwnerType.CUSTOMER_CITIZEN_ID_CARD);

        CustomerResponse response = customerMapper.toResponse(customer);

        response.setLocationName(locationRepository
                .findById(response.getLocationId()).get().getName());
        response.setImageUrls(MediaAssetUtil.getPresignedListImageUrls(imageAssetService, mediaAssetList));

        return response;
    }

    @Transactional
    @Override
    public CustomerResponse changeStatusCustomer(Integer id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new AppException(ERROR_CODE.CUSTOMER_NOT_EXISTED));
        List<MediaAsset> mediaAssetList = MediaAssetUtil.getListMediaAssetByEntityIdAndOwnerType(mediaAssetRepository, id, MediaAssetOwnerType.CUSTOMER_CITIZEN_ID_CARD);

        if (customer.getStatus() == RecordStatus.active) {
            customer.setStatus(RecordStatus.inactive);
        } else {
            customer.setStatus(RecordStatus.active);
        }
        CustomerResponse customerResponse = customerMapper.toResponse(customer);
        customerResponse.setImageUrls(MediaAssetUtil.getPresignedListImageUrls(imageAssetService, mediaAssetList));

        return customerResponse;
    }

    @Override
    public SimplePage<CustomerResponse> getAllCustomers(UserDetails userDetails, Pageable pageable, CustomersFilterRequest filterRequest) {
        Specification<Customer> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (!StringUtils.isNullOrEmptyOrBlank(filterRequest.getFullName())) {
                predicates.add(cb.like(
                        cb.lower(root.get("fullName")),
                        "%" + filterRequest.getFullName().toLowerCase() + "%"
                ));
            }
            if (!StringUtils.isNullOrEmptyOrBlank(filterRequest.getPhone())) {
                predicates.add(cb.like(
                        root.get("phone"),
                        "%" + filterRequest.getPhone() + "%"
                ));
            }
            if (!StringUtils.isNullOrEmptyOrBlank(filterRequest.getEmail())) {
                predicates.add(cb.like(
                        cb.lower(root.get("email")),
                        "%" + filterRequest.getEmail().toLowerCase() + "%"
                ));
            }
            if (!StringUtils.isNullOrEmptyOrBlank(filterRequest.getAddress())) {
                predicates.add(cb.like(
                        cb.lower(root.get("address")),
                        "%" + filterRequest.getAddress().toLowerCase() + "%"
                ));
            }
            if (!StringUtils.isNullOrEmptyOrBlank(filterRequest.getNotes())) {
                predicates.add(cb.like(
                        cb.lower(root.get("notes")),
                        "%" + filterRequest.getNotes().toLowerCase() + "%"
                ));
            }
            if (filterRequest.getLocationId() != null) {
                predicates.add(cb.equal(
                        root.get("locationId"),
                        filterRequest.getLocationId()
                ));
            }

            if (filterRequest.getStatus() != null) {
                predicates.add(cb.equal(root.get("status"), filterRequest.getStatus()));
            }

            if(!isAdminOrManager(userDetails)) {
                predicates.add(cb.equal(root.get("createdBy"), userDetails.getUsername()));
            }
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
            List<MediaAsset> mediaAssetList = MediaAssetUtil.getListMediaAssetByEntityIdAndOwnerType(mediaAssetRepository, customer.getId(), MediaAssetOwnerType.CUSTOMER_CITIZEN_ID_CARD);
            CustomerResponse response = customerMapper.toResponse(customer);
            response.setLocationName(locationMap.get(customer.getLocationId()));
            response.setImageUrls(MediaAssetUtil.getPresignedListImageUrls(imageAssetService, mediaAssetList));
            return response;
        }).toList();

        return new SimplePage<>(
                listResponses,
                customerPage.getTotalElements(),
                pageable
        );
    }

    private boolean isAdminOrManager(UserDetails userDetails) {
        User user = userRepository.findByEmailAndStatus(userDetails.getUsername(), RecordStatus.active)
                .orElseThrow(() -> new AppException(ERROR_CODE.USER_NOT_EXISTED));
        Role role = roleRepository.findById(user.getRole_id())
                .orElseThrow(() -> new AppException(ERROR_CODE.UNAUTHORIZED));

        return role.getCode().equals("ADMIN") || role.getCode().equals("MANAGER");
    }
}
