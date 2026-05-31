package com.medisync.auth.dto;

import com.medisync.user.UserSummary;

public record AuthResponse(String token, UserSummary user, boolean requiresTwoFactor) {
    public AuthResponse(String token, UserSummary user) {
        this(token, user, false);
    }
}
