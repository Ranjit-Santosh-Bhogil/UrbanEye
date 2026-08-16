package com.urbaneye.backend.services;

import com.urbaneye.backend.dto.AuthResponse;
import com.urbaneye.backend.dto.LoginRequest;
import com.urbaneye.backend.dto.OnboardingRequest;
import com.urbaneye.backend.dto.RegisterRequest;
import com.urbaneye.backend.exception.BadRequestException;
import com.urbaneye.backend.models.User;
import com.urbaneye.backend.models.UserRole;
import com.urbaneye.backend.repositories.UserRepository;
import com.urbaneye.backend.security.JwtTokenUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Optional;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    public AuthResponse register(RegisterRequest request) {
        logger.info("Registering new user with email: {}", request.getEmail());

        Optional<User> existingUser = userRepository.findByEmail(request.getEmail());
        if (existingUser.isPresent()) {
            logger.warn("User with email {} already exists", request.getEmail());
            throw new BadRequestException("User with this email already exists");
        }

        UserRole userRole = UserRole.citizen;
        if (StringUtils.hasText(request.getRole())) {
            try {
                userRole = UserRole.valueOf(request.getRole().toLowerCase());
            } catch (IllegalArgumentException e) {
                logger.warn("Invalid role provided: {}, defaulting to citizen", request.getRole());
            }
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(userRole)
                .onboarded(false)
                .build();

        User savedUser = userRepository.save(user);
        logger.info("User registered successfully with id: {}", savedUser.getId());

        String token = jwtTokenUtil.generateToken(savedUser.getId());

        return AuthResponse.builder()
                .token(token)
                .user(AuthResponse.UserDetailsDto.builder()
                        .id(savedUser.getId())
                        .name(savedUser.getName())
                        .email(savedUser.getEmail())
                        .role(savedUser.getRole().name())
                        .onboarded(savedUser.isOnboarded())
                        .build())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        logger.info("Login attempt for email: {}", request.getEmail());

        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()) {
            logger.warn("Login failed: user not found for email: {}", request.getEmail());
            throw new BadRequestException("Invalid Credentials");
        }

        User user = userOpt.get();
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            logger.warn("Login failed: invalid password for email: {}", request.getEmail());
            throw new BadRequestException("Invalid Credentials");
        }

        // Strict Role Enforcement
        String requestedRole = request.getRequestedRole();
        if (!StringUtils.hasText(requestedRole)) {
            requestedRole = "citizen";
        }

        if (!user.getRole().name().equalsIgnoreCase(requestedRole)) {
            logger.warn("Login denied: role mismatch for user {}, requested: {}, actual: {}",
                    request.getEmail(), requestedRole, user.getRole().name());
            throw new BadRequestException(String.format("Access denied. This account is registered as a %s. Please select the %s tab to login.",
                    user.getRole().name(), user.getRole().name()));
        }

        logger.info("User {} logged in successfully", request.getEmail());
        String token = jwtTokenUtil.generateToken(user.getId());

        return AuthResponse.builder()
                .token(token)
                .user(AuthResponse.UserDetailsDto.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .role(user.getRole().name())
                        .onboarded(user.isOnboarded())
                        .build())
                .build();
    }

    public AuthResponse addDetails(Long userId, OnboardingRequest request) {
        logger.info("Adding onboarding details for user: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("User not found"));

        if (StringUtils.hasText(request.getMobile())) {
            user.setMobile(request.getMobile());
        }
        if (StringUtils.hasText(request.getDistrict())) {
            user.setDistrict(request.getDistrict());
        }
        if (StringUtils.hasText(request.getCity())) {
            user.setCity(request.getCity());
        }
        if (StringUtils.hasText(request.getRole())) {
            try {
                user.setRole(UserRole.valueOf(request.getRole().toLowerCase()));
            } catch (IllegalArgumentException e) {
                logger.warn("Invalid role provided during onboarding: {}", request.getRole());
            }
        }
        user.setOnboarded(true);

        User updatedUser = userRepository.save(user);
        logger.info("Onboarding completed for user: {}", userId);

        String token = jwtTokenUtil.generateToken(updatedUser.getId());

        return AuthResponse.builder()
                .token(token)
                .user(AuthResponse.UserDetailsDto.builder()
                        .id(updatedUser.getId())
                        .name(updatedUser.getName())
                        .email(updatedUser.getEmail())
                        .role(updatedUser.getRole().name())
                        .onboarded(updatedUser.isOnboarded())
                        .build())
                .build();
    }
}
