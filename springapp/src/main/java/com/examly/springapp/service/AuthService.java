package com.examly.springapp.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.examly.springapp.config.JwtService;
import com.examly.springapp.dto.AuthResponse;
import com.examly.springapp.dto.LoginRequest;
import com.examly.springapp.dto.RegisterRequest;
import com.examly.springapp.entity.Role;
import com.examly.springapp.entity.User;
import com.examly.springapp.repository.UserRepository;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        if (userRepository.count() == 0) {
            user.setRole(Role.ADMIN);
        } else {
            throw new RuntimeException(
                "Registration is disabled. Only Admin can create users.");
        }

        userRepository.save(user);

        String token = jwtService.generateToken(user);
        String roleStr = user.getRole() != null ? user.getRole().name() : "USER";
        String empId = user.getEmployeeId() != null ? user.getEmployeeId() : user.getId().toString();

        return new AuthResponse(token, "Admin Registered Successfully", roleStr, user.getEmail(), user.getName(), empId);
    }

    public AuthResponse login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()));

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtService.generateToken(user);
        String roleStr = user.getRole() != null ? user.getRole().name() : "USER";
        String empId = user.getEmployeeId() != null ? user.getEmployeeId() : user.getId().toString();

        return new AuthResponse(token, "Login Successful", roleStr, user.getEmail(), user.getName(), empId);
    }

}