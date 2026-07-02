package com.controlefinanceiro.api.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class JwtServiceTest {

    private static final String SECRET = "test-secret-key-at-least-256-bits-long-for-hs256!!";

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService(SECRET, 60_000);
    }

    @Test
    void generatesTokenAndParsesBackTheSameUserId() {
        UUID userId = UUID.randomUUID();

        String token = jwtService.generateToken(userId, "user@example.com");

        assertThat(jwtService.parseUserId(token)).isEqualTo(userId);
    }

    @Test
    void rejectsTamperedToken() {
        UUID userId = UUID.randomUUID();
        String token = jwtService.generateToken(userId, "user@example.com");
        String tampered = token.substring(0, token.length() - 2) + "xx";

        assertThatThrownBy(() -> jwtService.parseUserId(tampered))
                .isInstanceOf(InvalidJwtException.class);
    }

    @Test
    void rejectsExpiredToken() throws InterruptedException {
        JwtService shortLived = new JwtService(SECRET, 1);
        String token = shortLived.generateToken(UUID.randomUUID(), "user@example.com");

        Thread.sleep(10);

        assertThatThrownBy(() -> shortLived.parseUserId(token))
                .isInstanceOf(InvalidJwtException.class);
    }

    @Test
    void rejectsTokenSignedWithDifferentSecret() {
        JwtService other = new JwtService("another-test-secret-key-256-bits-long-for-hs256!", 60_000);
        String token = other.generateToken(UUID.randomUUID(), "user@example.com");

        assertThatThrownBy(() -> jwtService.parseUserId(token))
                .isInstanceOf(InvalidJwtException.class);
    }
}
