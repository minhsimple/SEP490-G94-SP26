package vn.edu.fpt.service.impl;

import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.fpt.dto.SimplePage;
import org.springframework.data.domain.Page;
import vn.edu.fpt.dto.request.lead.LeadAdditionalRequest;
import vn.edu.fpt.dto.request.lead.LeadRequest;
import vn.edu.fpt.dto.request.lead.LeadsFilterRequest;
import vn.edu.fpt.dto.response.lead.LeadResponse;
import vn.edu.fpt.entity.*;
import vn.edu.fpt.enums.LeadState;
import vn.edu.fpt.enums.RecordStatus;
import vn.edu.fpt.exception.AppException;
import vn.edu.fpt.exception.ERROR_CODE;
import vn.edu.fpt.mapper.LeadMapper;
import vn.edu.fpt.respository.*;
import vn.edu.fpt.service.CustomerService;
import vn.edu.fpt.service.LeadService;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeadServiceImpl implements LeadService {
    private final LeadRepository leadRepository;
    private final LocationRepository locationRepository;
    private final LeadConversionRepository leadConversionRepository;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;

    private final LeadMapper leadMapper;

    @Override
    public LeadResponse createLead(LeadRequest request) {
        Lead lead = leadMapper.toEntity(request);
        lead.setLeadState(LeadState.NEW);
        Lead savedLead = leadRepository.save(lead);
        return leadMapper.toResponse(savedLead);
    }

    @Override
    public LeadResponse updateLead(Integer id, LeadRequest request) {
        Lead lead = leadRepository.findByIdAndStatus(id, RecordStatus.active)
                .orElseThrow(() ->  new AppException(ERROR_CODE.LEAD_NOT_EXISTED));

        leadMapper.updateEntity(lead, request);
        Lead updatedLead = leadRepository.save(lead);
        return leadMapper.toResponse(updatedLead);
    }

    @Override
    public LeadResponse getLeadById(Integer id) {

        Lead lead = leadRepository.findByIdAndStatus(id, RecordStatus.active)
                .orElseThrow(() -> new AppException(ERROR_CODE.LEAD_NOT_EXISTED));

        LeadResponse response = leadMapper.toResponse(lead);

        if (lead.getLocationId() != null) {
            response.setLocationName(locationRepository.findByIdAndStatus(lead.getLocationId(),
                    RecordStatus.active).getName());
        }

        return response;
    }

//    @Override
//    public SimplePage<LeadResponse> getAllLeads(Pageable pageable, LeadRequest filter) {
////        Page<Lead> page = leadRepository.findAllByStatus(RecordStatus.active, pageable);
//        Page<Lead> page = leadRepository.filterLeadsByStatus(
//                filter.getFullName(),
//                filter.getPhone(),
//                filter.getEmail(),
//                filter.getSource(),
//                filter.getNotes(),
//                filter.getAssignedSalesId(),
//                filter.getLocationId(),
//                filter.getState(),
//                RecordStatus.active, pageable);
//
//        List<LeadResponse> responses = page.getContent()
//                .stream()
//                .map(leadMapper::toResponse)
//                .toList();
//
//        return new SimplePage<>(
//                responses,
//                page.getTotalElements(),
//                pageable
//        );
//    }

@Override
public SimplePage<LeadResponse> getAllLeads(Pageable pageable, LeadsFilterRequest filter) {

    //Viết Spec để filter động, tránh lỗi postgre enum khi filter
    Specification<Lead> spec = (root, query, cb) -> {
        List<Predicate> predicates = new ArrayList<>();

        if (filter.getFullName() != null && !filter.getFullName().isBlank()) {
            predicates.add(cb.like(
                    cb.lower(root.get("fullName")),
                    "%" + filter.getFullName().toLowerCase() + "%"
            ));
        }

        if (filter.getPhone() != null && !filter.getPhone().isBlank()) {
            predicates.add(cb.like(
                    cb.lower(root.get("phone")),
                    "%" + filter.getPhone().toLowerCase() + "%"
            ));
        }

        if (filter.getEmail() != null && !filter.getEmail().isBlank()) {
            predicates.add(cb.like(
                    cb.lower(root.get("email")),
                    "%" + filter.getEmail().toLowerCase() + "%"
            ));
        }

        if (filter.getSource() != null && !filter.getSource().isBlank()) {
            predicates.add(cb.like(
                    cb.lower(root.get("source")),
                    "%" + filter.getSource().toLowerCase() + "%"
            ));
        }

        if (filter.getNotes() != null && !filter.getNotes().isBlank()) {
            predicates.add(cb.like(
                    cb.lower(root.get("notes")),
                    "%" + filter.getNotes().toLowerCase() + "%"
            ));
        }

        if (filter.getAssignedSalesId() != null) {
            predicates.add(cb.equal(root.get("assignedSalesId"), filter.getAssignedSalesId()));
        }

        if (filter.getLocationId() != null) {
            predicates.add(cb.equal(root.get("locationId"), filter.getLocationId()));
        }

        if (filter.getState() != null) {
            predicates.add(cb.equal(root.get("leadState"), filter.getState()));
        }

        // luôn filter active
        predicates.add(cb.equal(root.get("status"), RecordStatus.active));

        return cb.and(predicates.toArray(new Predicate[0]));
    };

    Page<Lead> page = leadRepository.findAll(spec, pageable);


    List<Lead> leads = page.getContent();

    Set<Integer> locationIds = leads.stream()
            .map(Lead::getLocationId)
            .filter(Objects::nonNull)
            .collect(Collectors.toSet());

    Map<Integer, String> locationMap = locationRepository
            .findAllById(locationIds)
            .stream()
            .collect(Collectors.toMap(
                    Location::getId,
                    Location::getName
            ));

    //Map sang reponse
    List<LeadResponse> responses = leads.stream()
            .map(lead -> {
                LeadResponse response = leadMapper.toResponse(lead);
                response.setLocationName(
                        locationMap.get(lead.getLocationId())
                );
                return response;
            })
            .toList();

    return new SimplePage<>(
            responses,
            page.getTotalElements(),
            pageable
    );
}

    @Override
    public LeadResponse changeStatusLead(Integer id) {
        Lead lead = leadRepository.findById(id)
                .orElseThrow(() -> new AppException(ERROR_CODE.LEAD_NOT_EXISTED));

        if (lead.getStatus() == RecordStatus.active) {
            lead.setStatus(RecordStatus.inactive);
        } else {
            lead.setStatus(RecordStatus.active);
        }

        leadRepository.save(lead);
        return leadMapper.toResponse(lead);
    }

    @Transactional
    @Override
    public void assignLeadToSales(UserDetails userDetails, Integer leadId, LeadAdditionalRequest additionalRequest) {
        Lead lead = leadRepository.findByIdAndStatus(leadId, RecordStatus.active)
                .orElseThrow(() -> new AppException(ERROR_CODE.LEAD_NOT_EXISTED));

        if (lead.getLeadState() != LeadState.NEW) {
            throw new AppException(ERROR_CODE.LEAD_NOT_IN_NEW_STATE);
        }

        userRepository.findByEmailAndStatus(userDetails.getUsername(), RecordStatus.active)
                .ifPresentOrElse(user -> {
                    if (!Objects.equals(lead.getLocationId(), user.getLocationId())) {
                        throw new AppException(ERROR_CODE.LEAD_NOT_MATCH_LOCATION);
                    }

                    lead.setAssignedSalesId(user.getId());
                    lead.setLeadState(LeadState.CONTACTING);

                    Customer customer = getCustomer(additionalRequest, lead);
                    Integer customerId = customerRepository.save(customer).getId();

                    LeadConversion leadConversion = new LeadConversion(leadId, customerId);
                    leadConversionRepository.save(leadConversion);
                }, () -> {
                    throw new AppException(ERROR_CODE.USER_NOT_EXISTED);
                });
    }

    private static @NonNull Customer getCustomer(LeadAdditionalRequest additionalRequest, Lead lead) {
        Customer customer = new Customer();
        customer.setFullName(lead.getFullName());
        customer.setPhone(lead.getPhone());
        customer.setEmail(lead.getEmail());
        customer.setLocationId(lead.getLocationId());
        customer.setNotes(lead.getNotes());
        customer.setCitizenIdNumber(additionalRequest.getCitizenIdNumber());
        customer.setTaxCode(additionalRequest.getTaxCode());
        customer.setAddress(additionalRequest.getAddress());
        return customer;
    }


}
