package com.doctorroster.backend.controller;

import com.doctorroster.backend.dto.AdminSetupRequest;
import com.doctorroster.backend.model.User;
import com.doctorroster.backend.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/setup")
@CrossOrigin(origins = "http://localhost:5173")
public class SetupController {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public SetupController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/admin")
    public Map<String, String> createFirstAdmin(@RequestBody AdminSetupRequest request) {
        if (userRepository.existsByRole("manager")) {
            throw new RuntimeException("Admin account already exists");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User admin = new User();
        admin.setFullName(request.getFullName());
        admin.setEmail(request.getEmail());
        admin.setPasswordHash(encoder.encode(request.getPassword()));
        admin.setRole("manager");
        admin.setMustChangePassword(false);
        admin.setEnabled(true);

        userRepository.save(admin);

        return Map.of("message", "First admin account created successfully");
    }
}