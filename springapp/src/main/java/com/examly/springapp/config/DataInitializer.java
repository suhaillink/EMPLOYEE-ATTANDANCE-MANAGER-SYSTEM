package com.examly.springapp.config;

import java.time.LocalDate;
import java.util.Optional;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.examly.springapp.entity.Role;
import com.examly.springapp.entity.User;
import com.examly.springapp.repository.UserRepository;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // Ensure Admin user exists with ADMIN role and admin123 password
        Optional<User> adminOpt = userRepository.findByEmail("admin@gmail.com");
        if (adminOpt.isEmpty()) {
            User admin = new User();
            admin.setName("Admin User");
            admin.setEmail("admin@gmail.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ADMIN);
            admin.setEmployeeId("EMP001");
            admin.setDepartment("Management");
            admin.setPosition("System Administrator");
            admin.setJoiningDate(LocalDate.now());
            userRepository.save(admin);
            System.out.println(">>> [DataInitializer] Admin user (admin@gmail.com / admin123) initialized with ADMIN role.");
        } else {
            User admin = adminOpt.get();
            admin.setRole(Role.ADMIN);
            admin.setPassword(passwordEncoder.encode("admin123"));
            if (admin.getEmployeeId() == null) {
                admin.setEmployeeId("EMP001");
            }
            userRepository.save(admin);
            System.out.println(">>> [DataInitializer] Admin user (admin@gmail.com) verified with ADMIN role.");
        }
    }
}
