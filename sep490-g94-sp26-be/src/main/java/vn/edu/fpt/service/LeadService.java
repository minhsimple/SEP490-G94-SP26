package vn.edu.fpt.service;

import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetails;
import vn.edu.fpt.dto.SimplePage;
import vn.edu.fpt.dto.request.lead.LeadAdditionalRequest;
import vn.edu.fpt.dto.request.lead.LeadRequest;
import vn.edu.fpt.dto.request.lead.LeadsFilterRequest;
import vn.edu.fpt.dto.response.lead.LeadResponse;


public interface LeadService {
    LeadResponse createLead(LeadRequest request);

    LeadResponse updateLead(Integer id, LeadRequest request);

    LeadResponse getLeadById(Integer id);

    SimplePage<LeadResponse> getAllLeads(Pageable pageable, LeadsFilterRequest filter);

    LeadResponse changeStatusLead(Integer id);

    void assignLeadToSales(UserDetails userDetails, Integer leadId, LeadAdditionalRequest additionalRequest);
}
