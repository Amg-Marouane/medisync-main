package com.medisync.admin;

import com.medisync.user.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AdminUserRequest(
        @NotBlank String firstName,
        @NotBlank String lastName,
        @Email @NotBlank String email,
        String password,
        @NotNull Role role,
        String phone,
        String specialty,
        String location,
        String spokenLanguages,
        java.math.BigDecimal consultationFee
) {}
