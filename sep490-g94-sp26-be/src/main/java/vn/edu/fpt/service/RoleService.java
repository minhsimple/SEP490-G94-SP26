package vn.edu.fpt.service;

import org.springframework.data.domain.Pageable;
import vn.edu.fpt.dto.SimplePage;
import vn.edu.fpt.dto.request.role.RoleRequest;
import vn.edu.fpt.dto.response.role.RoleResponse;

public interface RoleService {

    RoleResponse createRole(RoleRequest request);

    RoleResponse updateRole(Integer id, RoleRequest request);

    RoleResponse getRoleById(Integer id);

    SimplePage<RoleResponse> getAllRoles(Pageable pageable, RoleRequest filter);

    RoleResponse changeRoleStatus(Integer id);
}
