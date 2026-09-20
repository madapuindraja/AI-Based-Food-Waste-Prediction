
package com.foodrescue.service;

import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.foodrescue.entity.User;
import com.foodrescue.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // --------------------------------------------------
    // REGISTER USER
    // --------------------------------------------------

    public User registerUser(User user) {

        if (userRepository.existsByEmail(user.getEmail())) {

            throw new RuntimeException(
                    "Email already registered"
            );
        }

        user.setPassword(
                passwordEncoder.encode(
                        user.getPassword()
                )
        );

        // Normal registration always creates USER
        user.setRole("USER");

        return userRepository.save(user);
    }

    // --------------------------------------------------
    // FIND USER BY EMAIL
    // --------------------------------------------------

    public Optional<User> findByEmail(String email) {

        return userRepository.findByEmail(email);
    }

    // --------------------------------------------------
    // CHECK PASSWORD
    // --------------------------------------------------

    public boolean checkPassword(
            String rawPassword,
            String encodedPassword) {

        return passwordEncoder.matches(
                rawPassword,
                encodedPassword
        );
    }

    // --------------------------------------------------
    // GET USER BY ID
    // --------------------------------------------------

    public User getUserById(Long id) {

        return userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found with ID: " + id
                        )
                );
    }

    // --------------------------------------------------
    // GET ALL USERS
    // --------------------------------------------------

    public java.util.List<User> getAllUsers() {

        return userRepository.findAll();
    }

    // --------------------------------------------------
    // UPDATE CURRENT USER PROFILE
    // --------------------------------------------------

    public User updateUser(User user) {

        return userRepository.save(user);
    }

    // --------------------------------------------------
    // UPDATE USER ROLE
    // --------------------------------------------------

    public User updateRole(
            Long userId,
            String role) {

        User user = getUserById(userId);

        String newRole = role.toUpperCase();

        if (!newRole.equals("USER") &&
                !newRole.equals("DONOR") &&
                !newRole.equals("ADMIN")) {

            throw new RuntimeException(
                    "Invalid role. Use USER, DONOR or ADMIN"
            );
        }

        user.setRole(newRole);

        return userRepository.save(user);
    }

    // --------------------------------------------------
    // DELETE USER
    // --------------------------------------------------

    public void deleteUser(Long userId) {

        if (!userRepository.existsById(userId)) {

            throw new RuntimeException(
                    "User not found with ID: " + userId
            );
        }

        userRepository.deleteById(userId);
    }
}
