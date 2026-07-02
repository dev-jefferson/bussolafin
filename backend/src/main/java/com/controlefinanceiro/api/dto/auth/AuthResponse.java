package com.controlefinanceiro.api.dto.auth;

public record AuthResponse(String token, UserResponse user) {
}
