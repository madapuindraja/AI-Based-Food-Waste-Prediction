package com.foodrescue.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.foodrescue.entity.CartItem;
import com.foodrescue.entity.User;
import com.foodrescue.service.CartService;
import com.foodrescue.service.UserService;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "http://localhost:5173")
public class CartController {

    private final CartService cartService;
    private final UserService userService;

    public CartController(
            CartService cartService,
            UserService userService) {

        this.cartService = cartService;
        this.userService = userService;
    }

    private Long getCurrentUserId(Authentication authentication) {

        String email = authentication.getName();

        User user = userService
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        )
                );

        return user.getId();
    }

    @GetMapping
    public ResponseEntity<?> getCart(
            Authentication authentication) {

        try {

            Long userId =
                    getCurrentUserId(authentication);

            List<CartItem> cart =
                    cartService.getCart(userId);

            return ResponseEntity.ok(cart);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    @PostMapping("/add")
    public ResponseEntity<?> addToCart(
            Authentication authentication,
            @RequestParam Long foodItemId,
            @RequestParam int quantity) {

        try {

            Long userId =
                    getCurrentUserId(authentication);

            CartItem cartItem =
                    cartService.addToCart(
                            userId,
                            foodItemId,
                            quantity
                    );

            return ResponseEntity.ok(cartItem);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateQuantity(
            Authentication authentication,
            @RequestParam Long foodItemId,
            @RequestParam int quantity) {

        try {

            Long userId =
                    getCurrentUserId(authentication);

            CartItem cartItem =
                    cartService.updateQuantity(
                            userId,
                            foodItemId,
                            quantity
                    );

            return ResponseEntity.ok(cartItem);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    @DeleteMapping("/remove")
    public ResponseEntity<?> removeFromCart(
            Authentication authentication,
            @RequestParam Long foodItemId) {

        try {

            Long userId =
                    getCurrentUserId(authentication);

            cartService.removeFromCart(
                    userId,
                    foodItemId
            );

            return ResponseEntity.ok(
                    "Food removed from cart"
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    @DeleteMapping("/clear")
    public ResponseEntity<?> clearCart(
            Authentication authentication) {

        try {

            Long userId =
                    getCurrentUserId(authentication);

            cartService.clearCart(userId);

            return ResponseEntity.ok(
                    "Cart cleared successfully"
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}