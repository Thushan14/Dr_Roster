package com.doctorroster.backend.controller;

import com.doctorroster.backend.dto.ChangePasswordRequest;
import com.doctorroster.backend.dto.LoginRequest;
import com.doctorroster.backend.dto.VerifyOtpRequest;
import com.doctorroster.backend.model.LoginOtp;
import com.doctorroster.backend.model.User;
import com.doctorroster.backend.repository.LoginOtpRepository;
import com.doctorroster.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final UserRepository userRepository;
    private final LoginOtpRepository otpRepository;
    private final JavaMailSender mailSender;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public AuthController(
            UserRepository userRepository,
            LoginOtpRepository otpRepository,
            JavaMailSender mailSender
    ) {
        this.userRepository = userRepository;
        this.otpRepository = otpRepository;
        this.mailSender = mailSender;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Optional<User> optionalUser = userRepository.findByEmail(request.getEmail());

        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid email or password"));
        }

        User user = optionalUser.get();

        if (!user.isEnabled()) {
            return ResponseEntity.status(403).body(Map.of("message", "Account disabled"));
        }

        if (!encoder.matches(request.getPassword(), user.getPasswordHash())) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid email or password"));
        }

        String otp = String.valueOf(100000 + new Random().nextInt(900000));

        LoginOtp loginOtp = new LoginOtp();
        loginOtp.setUserId(user.getId());
        loginOtp.setOtpCode(otp);
        loginOtp.setExpiresAt(LocalDateTime.now().plusMinutes(5));
        loginOtp.setUsed(false);

        otpRepository.save(loginOtp);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(user.getEmail());
        message.setSubject("Doctor Roster Login OTP");
        message.setText("Your login OTP is: " + otp + "\n\nThis code expires in 5 minutes.");

        mailSender.send(message);

        return ResponseEntity.ok(Map.of(
                "message", "OTP sent to email",
                "email", user.getEmail(),
                "otpRequired", true
        ));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody VerifyOtpRequest request) {
        Optional<User> optionalUser = userRepository.findByEmail(request.getEmail());

        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("message", "User not found"));
        }

        User user = optionalUser.get();

        Optional<LoginOtp> optionalOtp =
                otpRepository.findTopByUserIdAndOtpCodeAndUsedFalseOrderByIdDesc(
                        user.getId(),
                        request.getOtpCode()
                );

        if (optionalOtp.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid OTP"));
        }

        LoginOtp otp = optionalOtp.get();

        if (otp.getExpiresAt().isBefore(LocalDateTime.now())) {
            return ResponseEntity.status(401).body(Map.of("message", "OTP expired"));
        }

        otp.setUsed(true);
        otpRepository.save(otp);

        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "name", user.getFullName(),
                "email", user.getEmail(),
                "role", user.getRole(),
                "mustChangePassword", user.isMustChangePassword()
        ));
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request) {
        Optional<User> optionalUser = userRepository.findByEmail(request.getEmail());

        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("message", "User not found"));
        }

        User user = optionalUser.get();

        if (!encoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            return ResponseEntity.status(401).body(Map.of("message", "Current password is incorrect"));
        }

        user.setPasswordHash(encoder.encode(request.getNewPassword()));
        user.setMustChangePassword(false);

        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }
}