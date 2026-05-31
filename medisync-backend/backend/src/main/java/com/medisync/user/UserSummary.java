package com.medisync.user;

public record UserSummary(Long id, String firstName, String lastName, String email, String role, boolean enabled) {
    public static UserSummary from(User user) {
        String role = user.getRoles().stream()
                .findFirst()
                .map(r -> r.name().toLowerCase())
                .orElse("patient");
        return new UserSummary(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                role,
                user.isEnabled()
        );
    }
}
