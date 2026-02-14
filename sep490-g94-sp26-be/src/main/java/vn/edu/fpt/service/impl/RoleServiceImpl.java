package vn.edu.fpt.service.impl;

import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import vn.edu.fpt.dto.SimplePage;
import vn.edu.fpt.dto.request.role.RoleRequest;
import vn.edu.fpt.dto.response.role.RoleResponse;
import vn.edu.fpt.entity.Role;
import vn.edu.fpt.enums.RecordStatus;
import vn.edu.fpt.exception.AppException;
import vn.edu.fpt.exception.ERROR_CODE;
import vn.edu.fpt.mapper.RoleMapper;
import vn.edu.fpt.respository.RoleRepository;
import vn.edu.fpt.service.RoleService;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {
    private final RoleRepository roleRepository;
    private final RoleMapper roleMapper;

    @Override
    public RoleResponse createRole(RoleRequest request) {
        if (request == null) {
            throw new AppException(ERROR_CODE.INVALID_REQUEST);
        }

        if (roleRepository.existsByCodeAndStatus(request.getCode(), RecordStatus.active)) {
            throw new AppException(ERROR_CODE.ROLE_EXISTED);
        }

        Role role = roleMapper.toEntity(request);
        Role saved = roleRepository.save(role);
        return roleMapper.toResponse(saved);
    }

    @Override
    public RoleResponse updateRole(Integer id, RoleRequest request) {
        Role role = roleRepository.findByIdAndStatus(id, RecordStatus.active)
                .orElseThrow(() -> new AppException(ERROR_CODE.ROLE_NOT_EXISTED));

        roleMapper.updateEntity(role, request);
        Role saved = roleRepository.save(role);
        return roleMapper.toResponse(saved);
    }

    @Override
    public RoleResponse getRoleById(Integer id) {
        Role role = roleRepository.findByIdAndStatus(id, RecordStatus.active)
                .orElseThrow(() -> new AppException(ERROR_CODE.ROLE_NOT_EXISTED));

        return roleMapper.toResponse(role);
    }

    @Override
    public SimplePage<RoleResponse> getAllRoles(Pageable pageable, RoleRequest filter) {
        Specification<Role> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter != null) {
                if (filter.getCode() != null && !filter.getCode().isBlank()) {
                    predicates.add(cb.like(cb.lower(root.get("code")),
                            "%" + filter.getCode().toLowerCase() + "%"));
                }

                if (filter.getName() != null && !filter.getName().isBlank()) {
                    predicates.add(cb.like(cb.lower(root.get("name")),
                            "%" + filter.getName().toLowerCase() + "%"));
                }
            }

            predicates.add(cb.equal(root.get("status"), RecordStatus.active));

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Role> page = roleRepository.findAll(spec, pageable);

        List<RoleResponse> responses = page.getContent()
                .stream()
                .map(roleMapper::toResponse)
                .collect(Collectors.toList());

        return new SimplePage<>(
                responses,
                page.getTotalElements(),
                pageable
        );
    }

    @Override
    public RoleResponse changeRoleStatus(Integer id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new AppException(ERROR_CODE.ROLE_NOT_EXISTED));

        if (role.getStatus() == RecordStatus.active) {
            role.setStatus(RecordStatus.inactive);
        } else {
            role.setStatus(RecordStatus.active);
        }

        Role saved = roleRepository.save(role);
        return roleMapper.toResponse(saved);
    }
}
