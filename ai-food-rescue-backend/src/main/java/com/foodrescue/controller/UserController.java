package com.foodrescue.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.foodrescue.entity.User;
import com.foodrescue.service.UserService;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // --------------------------------------------------
    // GET CURRENT USER PROFILE
    // --------------------------------------------------

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(
            Authentication authentication) {

        try {

            String email = authentication.getName();

            User user = userService
                    .findByEmail(email)
                    .orElseThrow(() ->
                            new RuntimeException("User not found")
                    );

            return ResponseEntity.ok(
                    Map.of(
                            "id", user.getId(),
                            "name", user.getName(),
                            "email", user.getEmail(),
                            "phone", user.getPhone(),
                            "address", user.getAddress(),
                            "role", user.getRole()
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // --------------------------------------------------
    // UPDATE CURRENT USER PROFILE
    // --------------------------------------------------

    @PutMapping("/me")
    public ResponseEntity<?> updateCurrentUser(
            Authentication authentication,
            @RequestBody Map<String, String> request) {

        try {

            String email = authentication.getName();

            User user = userService
                    .findByEmail(email)
                    .orElseThrow(() ->
                            new RuntimeException("User not found")
                    );

            String name = request.get("name");
            String phone = request.get("phone");
            String address = request.get("address");

            if (name == null || name.trim().isEmpty()) {
                return ResponseEntity
                        .badRequest()
                        .body("Name is required");
            }

            if (phone == null || phone.trim().isEmpty()) {
                return ResponseEntity
                        .badRequest()
                        .body("Phone number is required");
            }

            if (address == null || address.trim().isEmpty()) {
                return ResponseEntity
                        .badRequest()
                        .body("Address is required");
            }

            user.setName(name.trim());
            user.setPhone(phone.trim());
            user.setAddress(address.trim());

            User updatedUser = userService.updateUser(user);

            return ResponseEntity.ok(
                    Map.of(
                            "message", "Profile updated successfully",
                            "id", updatedUser.getId(),
                            "name", updatedUser.getName(),
                            "email", updatedUser.getEmail(),
                            "phone", updatedUser.getPhone(),
                            "address", updatedUser.getAddress(),
                            "role", updatedUser.getRole()
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}
