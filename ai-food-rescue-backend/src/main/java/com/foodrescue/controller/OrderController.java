package com.foodrescue.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.foodrescue.entity.Order;
import com.foodrescue.entity.OrderItem;
import com.foodrescue.entity.User;
import com.foodrescue.service.OrderService;
import com.foodrescue.service.UserService;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:5173")
public class OrderController {

    private final OrderService orderService;
    private final UserService userService;

    public OrderController(
            OrderService orderService,
            UserService userService) {

        this.orderService = orderService;
        this.userService = userService;
    }

    // Get logged-in user's ID from JWT email
    private Long getCurrentUserId(
            Authentication authentication) {

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

    // ---------------------------------------------------------
    // PLACE ORDER
    // ---------------------------------------------------------

    @PostMapping
    public ResponseEntity<?> placeOrder(
            Authentication authentication,
            @RequestParam String deliveryAddress,
            @RequestParam String paymentMethod) {

        try {

            Long userId =
                    getCurrentUserId(authentication);

            Order order =
                    orderService.placeOrder(
                            userId,
                            deliveryAddress,
                            paymentMethod
                    );

            return ResponseEntity.ok(order);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // ---------------------------------------------------------
    // GET LOGGED-IN USER ORDERS
    // ---------------------------------------------------------

    @GetMapping("/my")
    public ResponseEntity<?> getMyOrders(
            Authentication authentication) {

        try {

            Long userId =
                    getCurrentUserId(authentication);

            List<Order> orders =
                    orderService.getUserOrders(userId);

            return ResponseEntity.ok(orders);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // ---------------------------------------------------------
    // GET PARTICULAR ORDER
    // ---------------------------------------------------------

    @GetMapping("/{orderId}")
    public ResponseEntity<?> getOrderById(
            Authentication authentication,
            @PathVariable Long orderId) {

        try {

            Long userId =
                    getCurrentUserId(authentication);

            Order order =
                    orderService.getOrderById(orderId);

            // User can only see their own order
            if (!order.getUserId().equals(userId)) {

                return ResponseEntity
                        .status(403)
                        .body(
                                "You are not allowed to view this order"
                        );
            }

            return ResponseEntity.ok(order);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // ---------------------------------------------------------
    // GET ORDER ITEMS
    // ---------------------------------------------------------

    @GetMapping("/{orderId}/items")
    public ResponseEntity<?> getOrderItems(
            Authentication authentication,
            @PathVariable Long orderId) {

        try {

            Long userId =
                    getCurrentUserId(authentication);

            Order order =
                    orderService.getOrderById(orderId);

            // User can only see items from their own order
            if (!order.getUserId().equals(userId)) {

                return ResponseEntity
                        .status(403)
                        .body(
                                "You are not allowed to view this order"
                        );
            }

            List<OrderItem> items =
                    orderService.getOrderItems(orderId);

            return ResponseEntity.ok(items);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // ---------------------------------------------------------
    // CANCEL LOGGED-IN USER ORDER
    // ---------------------------------------------------------

    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<?> cancelOrder(
            Authentication authentication,
            @PathVariable Long orderId) {

        try {

            Long userId =
                    getCurrentUserId(authentication);

            Order order =
                    orderService.cancelOrder(
                            userId,
                            orderId
                    );

            return ResponseEntity.ok(order);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // ---------------------------------------------------------
    // ADMIN - GET ALL ORDERS
    // ---------------------------------------------------------

    @GetMapping("/all")
    public ResponseEntity<?> getAllOrders() {

        try {

            return ResponseEntity.ok(
                    orderService.getAllOrders()
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // ---------------------------------------------------------
    // ADMIN - UPDATE ORDER STATUS
    // ---------------------------------------------------------

    @PutMapping("/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam String status) {

        try {

            Order order =
                    orderService.updateOrderStatus(
                            orderId,
                            status
                    );

            return ResponseEntity.ok(order);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // ---------------------------------------------------------
    // ADMIN - GET ORDERS BY STATUS
    // ---------------------------------------------------------

    @GetMapping("/status/{status}")
    public ResponseEntity<?> getOrdersByStatus(
            @PathVariable String status) {

        try {

            return ResponseEntity.ok(
                    orderService.getOrdersByStatus(status)
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}