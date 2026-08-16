package com.urbaneye.backend.controllers;

import com.urbaneye.backend.dto.AuthResponse;
import com.urbaneye.backend.security.UserPrincipal;
import com.urbaneye.backend.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        AuthResponse.UserDetailsDto userDetails = userService.getProfile(userPrincipal.getId());
        return ResponseEntity.ok(userDetails);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> request, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Map<String, Object> response = userService.updateProfile(userPrincipal.getId(), request);
        return ResponseEntity.ok(response);
    }
}
