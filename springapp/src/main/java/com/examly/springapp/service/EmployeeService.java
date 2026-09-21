package com.examly.springapp.service;

import java.util.List;
import java.util.regex.Pattern;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.examly.springapp.dto.EmployeeDto;
import com.examly.springapp.entity.Role;
import com.examly.springapp.entity.User;
import com.examly.springapp.exception.ResourceNotFoundException;
import com.examly.springapp.repository.UserRepository;

@Service
public class EmployeeService {

    private static final Pattern EMP_ID_PATTERN = Pattern.compile("^EMP\\d{3}$");
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public EmployeeService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User createEmployee(EmployeeDto dto) {
        if (dto.getEmployeeId() == null || !EMP_ID_PATTERN.matcher(dto.getEmployeeId()).matches()) {
            throw new RuntimeException("Employee ID must follow format 'EMP' followed by 3 digits");
        }

        if (userRepository.existsByEmployeeId(dto.getEmployeeId())) {
            throw new RuntimeException("Employee ID must be unique");
        }

        if (dto.getEmail() == null || !EMAIL_PATTERN.matcher(dto.getEmail()).matches()) {
            throw new RuntimeException("Must be a valid email");
        }

        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email address already in use");
        }

        User user = new User();
        user.setEmployeeId(dto.getEmployeeId());
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setDepartment(dto.getDepartment());
        user.setPosition(dto.getPosition());
        user.setJoiningDate(dto.getJoiningDate());

        String rawPassword = (dto.getPassword() != null && !dto.getPassword().isBlank()) 
                ? dto.getPassword() : "Default@123";
        user.setPassword(passwordEncoder.encode(rawPassword));

        if (dto.getRole() != null && dto.getRole().equalsIgnoreCase("ADMIN")) {
            user.setRole(Role.ADMIN);
        } else {
            user.setRole(Role.USER);
        }

        return userRepository.save(user);
    }

    public List<User> getAllEmployees(String department) {
        if (department != null && !department.trim().isEmpty() && !"All".equalsIgnoreCase(department.trim())) {
            return userRepository.findByDepartment(department.trim());
        }
        return userRepository.findAll();
    }

    public User getEmployeeById(String identifier) {
        // Try finding by employeeId first
        User user = userRepository.findByEmployeeId(identifier).orElse(null);
        if (user != null) {
            return user;
        }

        // Try finding by numeric id
        try {
            Long numericId = Long.parseLong(identifier);
            user = userRepository.findById(numericId).orElse(null);
            if (user != null) {
                return user;
            }
        } catch (NumberFormatException ignored) {
        }

        throw new ResourceNotFoundException("Employee not found");
    }

    public User updateEmployee(String identifier, EmployeeDto dto) {
        User user = getEmployeeById(identifier);

        if (dto.getName() != null) user.setName(dto.getName());
        if (dto.getDepartment() != null) user.setDepartment(dto.getDepartment());
        if (dto.getPosition() != null) user.setPosition(dto.getPosition());
        if (dto.getJoiningDate() != null) user.setJoiningDate(dto.getJoiningDate());

        if (dto.getEmail() != null && !dto.getEmail().equals(user.getEmail())) {
            if (!EMAIL_PATTERN.matcher(dto.getEmail()).matches()) {
                throw new RuntimeException("Must be a valid email");
            }
            if (userRepository.existsByEmail(dto.getEmail())) {
                throw new RuntimeException("Email address already in use");
            }
            user.setEmail(dto.getEmail());
        }

        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
        }

        return userRepository.save(user);
    }

    public void deleteEmployee(String identifier) {
        User user = getEmployeeById(identifier);

        org.springframework.security.core.Authentication authentication =
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getName() != null) {
            String currentPrincipal = authentication.getName();
            if (user.getEmail() != null && user.getEmail().equalsIgnoreCase(currentPrincipal)) {
                throw new RuntimeException("You cannot delete your own account.");
            }
        }

        if (user.getRole() == Role.ADMIN) {
            throw new RuntimeException("Admin accounts cannot be deleted.");
        }

        userRepository.delete(user);
    }
}
