package com.urbaneye.backend.services;

import com.urbaneye.backend.dto.AuthResponse;
import com.urbaneye.backend.exception.BadRequestException;
import com.urbaneye.backend.exception.ResourceNotFoundException;
import com.urbaneye.backend.models.User;
import com.urbaneye.backend.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    @Autowired
    private UserRepository userRepository;

    public AuthResponse.UserDetailsDto getProfile(Long userId) {
        logger.info("Fetching profile for user: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return AuthResponse.UserDetailsDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .onboarded(user.isOnboarded())
                .build();
    }

    public Map<String, Object> updateProfile(Long userId, Map<String, String> updates) {
        logger.info("Updating profile for user: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Check if trying to update email - ensure uniqueness
        if (updates.containsKey("email")) {
            String newEmail = updates.get("email");
            if (StringUtils.hasText(newEmail) && !newEmail.equals(user.getEmail())) {
                Optional<User> existingUser = userRepository.findByEmail(newEmail);
                if (existingUser.isPresent()) {
                    logger.warn("Email {} already in use by another user", newEmail);
                    throw new BadRequestException("Email already in use");
                }
                user.setEmail(newEmail);
            }
        }

        if (updates.containsKey("name") && StringUtils.hasText(updates.get("name"))) {
            user.setName(updates.get("name"));
        }
        if (updates.containsKey("mobile") && StringUtils.hasText(updates.get("mobile"))) {
            user.setMobile(updates.get("mobile"));
        }
        if (updates.containsKey("district") && StringUtils.hasText(updates.get("district"))) {
            user.setDistrict(updates.get("district"));
        }
        if (updates.containsKey("city") && StringUtils.hasText(updates.get("city"))) {
            user.setCity(updates.get("city"));
        }
        if (updates.containsKey("address") && StringUtils.hasText(updates.get("address"))) {
            user.setAddress(updates.get("address"));
        }

        User updatedUser = userRepository.save(user);
        logger.info("Profile updated for user: {}", userId);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Profile updated successfully");
        response.put("user", updatedUser);

        return response;
    }
}
