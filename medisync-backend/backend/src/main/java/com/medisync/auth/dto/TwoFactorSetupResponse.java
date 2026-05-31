package com.medisync.auth.dto;

public record TwoFactorSetupResponse(String secret, String qrDataUri) {}
