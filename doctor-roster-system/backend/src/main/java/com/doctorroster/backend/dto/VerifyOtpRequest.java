package com.doctorroster.backend.dto;

public class VerifyOtpRequest {
    private String email;
    private String otpCode;

    public String getEmail() { return email; }
    public String getOtpCode() { return otpCode; }
}