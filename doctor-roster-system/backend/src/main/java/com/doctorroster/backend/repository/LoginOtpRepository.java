package com.doctorroster.backend.repository;

import com.doctorroster.backend.model.LoginOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface LoginOtpRepository extends JpaRepository<LoginOtp, Long> {
    Optional<LoginOtp> findTopByUserIdAndOtpCodeAndUsedFalseOrderByIdDesc(
            Long userId,
            String otpCode
    );
}