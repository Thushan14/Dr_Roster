package com.doctorroster.backend.dto;

public class AdminSetupRequest {
    private String fullName;
    private String email;
    private String password;

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }
}