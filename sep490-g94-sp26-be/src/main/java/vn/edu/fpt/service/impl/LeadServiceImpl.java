package vn.edu.fpt.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import vn.edu.fpt.dto.SimplePage;
import org.springframework.data.domain.Page;
import vn.edu.fpt.dto.request.lead.LeadRequest;
import vn.edu.fpt.dto.response.lead.LeadResponse;
import vn.edu.fpt.entity.Lead;
import vn.edu.fpt.enums.LeadState;
import vn.edu.fpt.enums.RecordStatus;
import vn.edu.fpt.exception.AppException;
import vn.edu.fpt.exception.ERROR_CODE;
import vn.edu.fpt.mapper.LeadMapper;
import vn.edu.fpt.respository.LeadRepository;
import vn.edu.fpt.service.LeadService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LeadServiceImpl implements LeadService {
    private final LeadRepository leadRepository;
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
                .orElseThrow(() ->  new AppException(ERROR_CODE.LEAD_NOT_EXISTED));
        return leadMapper.toResponse(lead);
    }

    @Override
    public SimplePage<LeadResponse> getAllLeads(Pageable pageable, LeadRequest filter) {
//        Page<Lead> page = leadRepository.findAllByStatus(RecordStatus.active, pageable);
        Page<Lead> page = leadRepository.filterLeadsByStatus(
                filter.getFullName(),
                filter.getPhone(),
                filter.getEmail(),
                filter.getSource(),
                filter.getNotes(),
                filter.getAssignedSalesId(),
                filter.getLocationId(),
                filter.getState(),
                RecordStatus.active, pageable);

        List<LeadResponse> responses = page.getContent()
                .stream()
                .map(leadMapper::toResponse)
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
}
