package com.foodrescue.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.foodrescue.entity.User;
import com.foodrescue.service.UserService;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    private final UserService userService;

    public AdminController(UserService userService) {
        this.userService = userService;
    }

    // --------------------------------------------------
    // GET ALL USERS
    // --------------------------------------------------

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {

        try {

            List<User> users = userService.getAllUsers();

            return ResponseEntity.ok(users);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // --------------------------------------------------
    // GET USER BY ID
    // --------------------------------------------------

    @GetMapping("/users/{userId}")
    public ResponseEntity<?> getUser(
            @PathVariable Long userId) {

        try {

            return ResponseEntity.ok(
                    userService.getUserById(userId)
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // --------------------------------------------------
    // CHANGE USER ROLE
    // --------------------------------------------------

    @PutMapping("/users/{userId}/role")
    public ResponseEntity<?> updateRole(
            @PathVariable Long userId,
            @RequestParam String role) {

        try {

            User updatedUser =
                    userService.updateRole(
                            userId,
                            role
                    );

            return ResponseEntity.ok(updatedUser);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // --------------------------------------------------
    // DELETE USER
    // --------------------------------------------------

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(
            @PathVariable Long userId) {

        try {

            userService.deleteUser(userId);

            return ResponseEntity.ok(
                    "User deleted successfully"
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}