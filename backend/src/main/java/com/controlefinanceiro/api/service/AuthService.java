package com.controlefinanceiro.api.service;

import com.controlefinanceiro.api.domain.User;
import com.controlefinanceiro.api.dto.auth.AuthResponse;
import com.controlefinanceiro.api.dto.auth.LoginRequest;
import com.controlefinanceiro.api.dto.auth.RegisterRequest;
import com.controlefinanceiro.api.dto.auth.UserResponse;
import com.controlefinanceiro.api.exception.DuplicateResourceException;
import com.controlefinanceiro.api.mapper.UserMapper;
import com.controlefinanceiro.api.repository.UserRepository;
import com.controlefinanceiro.api.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserMapper userMapper;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new DuplicateResourceException("Email já cadastrado");
        }

        User user = User.builder()
                .name(request.name())
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .build();
        userRepository.save(user);

        return buildAuthResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password()));

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found"));

        return buildAuthResponse(user);
    }

    public UserResponse me(java.util.UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found"));
        return userMapper.toResponse(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        String token = jwtService.generateToken(user.getId(), user.getEmail());
        return new AuthResponse(token, userMapper.toResponse(user));
    }
}
