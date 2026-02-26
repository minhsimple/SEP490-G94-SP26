package vn.edu.fpt.service.impl;

import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import vn.edu.fpt.dto.SimplePage;
import vn.edu.fpt.dto.request.user.UserFilterRequest;
import vn.edu.fpt.dto.request.user.UserRequest;
import vn.edu.fpt.dto.response.UserResponse;
import vn.edu.fpt.entity.Lead;
import vn.edu.fpt.entity.User;
import vn.edu.fpt.enums.RecordStatus;
import vn.edu.fpt.exception.AppException;
import vn.edu.fpt.exception.ERROR_CODE;
import vn.edu.fpt.mapper.UserMapper;
import vn.edu.fpt.respository.UserRepository;
import vn.edu.fpt.service.UserService;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserResponse createUser(UserRequest request) {
        if(userRepository.existsByEmailAndStatus(request.getEmail(), RecordStatus.active)) {
            throw new AppException(ERROR_CODE.USER_EXISTED);
        }
        User user = userMapper.toEntity(request);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setIsActive(true);
        User savedUser = userRepository.save(user);
        return userMapper.toResponse(savedUser);
    }

    @Override
    public UserResponse updateUser(Integer id, UserRequest request) {

        User user = userRepository.findByIdAndStatus(id, RecordStatus.active)
                .orElseThrow(() -> new AppException(ERROR_CODE.USER_NOT_EXISTED));

        userMapper.updateEntity(user, request);

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        User savedUser = userRepository.save(user);

        return userMapper.toResponse(savedUser);
    }


        @Override
    public SimplePage<UserResponse> getAllUsers(Pageable pageable, UserFilterRequest filter) {
        Specification<User> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter.getFullName() != null && !filter.getFullName().isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("fullName")),
                        "%" + filter.getFullName().toLowerCase() + "%"));
            }

            if (filter.getPhone() != null && !filter.getPhone().isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("phone")),
                        "%" + filter.getPhone().toLowerCase() + "%"));
            }

            if (filter.getEmail() != null && !filter.getEmail().isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("email")),
                        "%" + filter.getEmail().toLowerCase() + "%"));
            }

            if (filter.getLocationId() != null) {
                predicates.add(cb.equal(root.get("locationId"), filter.getLocationId()));
            }

            if (filter.getRoleId() != null) {
                predicates.add(cb.equal(root.get("roleId"), filter.getRoleId()));
            }

            // always filter active
            predicates.add(cb.equal(root.get("status"), RecordStatus.active));

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<User> page = userRepository.findAll(spec, pageable);

        List<UserResponse> responses = page.getContent()
                .stream()
                .map(userMapper::toResponse)
                .collect(Collectors.toList());

        return new SimplePage<>(
                responses,
                page.getTotalElements(),
                pageable
        );
    }

    @Override
    public UserResponse changeStatus(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ERROR_CODE.USER_NOT_EXISTED));

        if (user.getStatus() == RecordStatus.active) {
            user.setStatus(RecordStatus.inactive);
        } else {
            user.setStatus(RecordStatus.active);
        }

        User saved = userRepository.save(user);
        return userMapper.toResponse(saved);
    }
}
