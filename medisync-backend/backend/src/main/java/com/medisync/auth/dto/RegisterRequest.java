package com.medisync.auth.dto;

import com.medisync.user.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record RegisterRequest(
        @NotBlank String firstName,
        @NotBlank String lastName,
        @Email @NotBlank String email,
        String phone,
        String socialSecurityNumber,
        @Pattern(
                regexp = "^(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,}$",
                message = "Password must contain 8 characters, 1 uppercase letter, 1 number and 1 special character"
        )
        String password,
        Role role
) {
    public Role effectiveRole() {
        return role != null ? role : Role.PATIENT;
    }
}
