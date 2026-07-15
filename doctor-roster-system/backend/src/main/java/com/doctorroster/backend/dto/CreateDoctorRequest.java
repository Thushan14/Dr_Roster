package com.doctorroster.backend.dto;

public class CreateDoctorRequest {
    private String fullName;
    private String email;
    private String temporaryPassword;

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public String getTemporaryPassword() {
        return temporaryPassword;
    }
}