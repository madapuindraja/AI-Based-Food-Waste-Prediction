package com.foodrescue.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.foodrescue.dto.AuthResponse;
import com.foodrescue.dto.LoginRequest;
import com.foodrescue.dto.RegisterRequest;
import com.foodrescue.entity.User;
import com.foodrescue.security.JwtService;
import com.foodrescue.service.UserService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final UserService userService;
    private final JwtService jwtService;

    public AuthController(UserService userService,
                          JwtService jwtService) {

        this.userService = userService;
        this.jwtService = jwtService;
    }

    // =========================
    // REGISTER
    // =========================

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody RegisterRequest request) {

        try {

            User user = new User();

            user.setName(request.getName());
            user.setEmail(request.getEmail());
            user.setPassword(request.getPassword());
            user.setPhone(request.getPhone());
            user.setAddress(request.getAddress());

            User savedUser = userService.registerUser(user);

            return ResponseEntity.ok(
                    new AuthResponse(
                            "Registration successful",
                            null,
                            savedUser.getRole(),
                            savedUser.getId(),
                            savedUser.getName(),
                            savedUser.getEmail()
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // =========================
    // LOGIN
    // =========================

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request) {

        return userService
                .findByEmail(request.getEmail())
                .map(user -> {

                    // Check password
                    if (!userService.checkPassword(
                            request.getPassword(),
                            user.getPassword())) {

                        return ResponseEntity
                                .badRequest()
                                .body("Invalid email or password");
                    }

                    // Generate JWT token
                    String token = jwtService.generateToken(
                            user.getEmail(),
                            user.getRole()
                    );

                    // Return login response
                    return ResponseEntity.ok(
                            new AuthResponse(
                                    "Login successful",
                                    token,
                                    user.getRole(),
                                    user.getId(),
                                    user.getName(),
                                    user.getEmail()
                            )
                    );

                })
                .orElseGet(() ->
                        ResponseEntity
                                .badRequest()
                                .body("Invalid email or password")
                );
    }
}

