package com.urbaneye.backend.controllers;

import com.urbaneye.backend.dto.AuthResponse;
import com.urbaneye.backend.dto.LoginRequest;
import com.urbaneye.backend.dto.OnboardingRequest;
import com.urbaneye.backend.dto.RegisterRequest;
import com.urbaneye.backend.security.UserPrincipal;
import com.urbaneye.backend.services.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse authResponse = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(authResponse);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse authResponse = authService.login(request);
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/details")
    public ResponseEntity<?> addDetails(@Valid @RequestBody OnboardingRequest request, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        AuthResponse authResponse = authService.addDetails(userPrincipal.getId(), request);
        return ResponseEntity.ok(authResponse);
    }
}
