package vn.edu.fpt.service;

import org.springframework.data.domain.Pageable;
import vn.edu.fpt.dto.SimplePage;
import vn.edu.fpt.dto.request.lead.LeadRequest;
import vn.edu.fpt.dto.request.lead.LeadsFilterRequest;
import vn.edu.fpt.dto.request.user.UserFilterRequest;
import vn.edu.fpt.dto.request.user.UserRequest;
import vn.edu.fpt.dto.response.UserResponse;
import vn.edu.fpt.dto.response.lead.LeadResponse;

public interface UserService {
    UserResponse createUser(UserRequest request);

    UserResponse updateUser(Integer id, UserRequest request);

    SimplePage<UserResponse> getAllUsers(Pageable pageable, UserFilterRequest filter);

    UserResponse changeStatus(Integer id);

}
