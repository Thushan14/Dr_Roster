package com.doctorroster.backend.controller;

import com.doctorroster.backend.dto.CreateDoctorRequest;
import com.doctorroster.backend.model.User;
import com.doctorroster.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/doctors")
@CrossOrigin(origins = "http://localhost:5173")
public class DoctorController {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder encoder =
            new BCryptPasswordEncoder();

    public DoctorController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<?> createDoctor(
            @RequestBody CreateDoctorRequest request
    ) {
        String fullName = request.getFullName() == null
                ? ""
                : request.getFullName().trim();

        String email = request.getEmail() == null
                ? ""
                : request.getEmail().trim().toLowerCase();

        String temporaryPassword =
                request.getTemporaryPassword() == null
                        ? ""
                        : request.getTemporaryPassword();

        if (fullName.isBlank()) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Doctor name is required")
            );
        }

        if (email.isBlank()) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Doctor email is required")
            );
        }

        if (temporaryPassword.length() < 8) {
            return ResponseEntity.badRequest().body(
                    Map.of(
                            "message",
                            "Temporary password must have at least 8 characters"
                    )
            );
        }

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Email already exists")
            );
        }

        User doctor = new User();
        doctor.setFullName(fullName);
        doctor.setEmail(email);
        doctor.setPasswordHash(
                encoder.encode(temporaryPassword)
        );
        doctor.setRole("doctor");
        doctor.setMustChangePassword(true);
        doctor.setEnabled(true);

        User savedDoctor = userRepository.save(doctor);

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Doctor account created successfully",
                        "id",
                        savedDoctor.getId(),
                        "name",
                        savedDoctor.getFullName(),
                        "email",
                        savedDoctor.getEmail(),
                        "enabled",
                        savedDoctor.isEnabled()
                )
        );
    }

    @GetMapping
    public ResponseEntity<?> getDoctors() {
        return ResponseEntity.ok(
                userRepository.findAll()
                        .stream()
                        .filter(
                                user ->
                                        "doctor".equalsIgnoreCase(
                                                user.getRole()
                                        )
                        )
                        .map(
                                user ->
                                        Map.of(
                                                "id",
                                                user.getId(),
                                                "name",
                                                user.getFullName(),
                                                "email",
                                                user.getEmail(),
                                                "enabled",
                                                user.isEnabled(),
                                                "mustChangePassword",
                                                user.isMustChangePassword()
                                        )
                        )
                        .toList()
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDoctor(
            @PathVariable Long id
    ) {
        Optional<User> optionalUser =
                userRepository.findById(id);

        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(404).body(
                    Map.of("message", "Doctor not found")
            );
        }

        User user = optionalUser.get();

        if (!"doctor".equalsIgnoreCase(user.getRole())) {
            return ResponseEntity.badRequest().body(
                    Map.of(
                            "message",
                            "The selected account is not a doctor"
                    )
            );
        }

        userRepository.delete(user);

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Doctor deleted successfully"
                )
        );
    }
}