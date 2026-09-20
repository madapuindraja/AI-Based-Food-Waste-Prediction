package com.foodrescue.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.foodrescue.entity.FoodItem;
import com.foodrescue.entity.User;
import com.foodrescue.service.FoodItemService;
import com.foodrescue.service.OrderService;
import com.foodrescue.service.UserService;

@RestController
@RequestMapping("/api/donor")
@CrossOrigin(origins = "http://localhost:5173")
public class DonorController {

    private final FoodItemService foodItemService;
    private final UserService userService;
    private final OrderService orderService;

    public DonorController(
            FoodItemService foodItemService,
            UserService userService,
            OrderService orderService) {

        this.foodItemService = foodItemService;
        this.userService = userService;
        this.orderService = orderService;
    }

    // --------------------------------------------------
    // GET LOGGED-IN DONOR
    // --------------------------------------------------

    private User getLoggedInDonor(
            Authentication authentication) {

        if (authentication == null ||
                authentication.getName() == null) {

            throw new RuntimeException(
                    "User is not authenticated"
            );
        }

        return userService
                .findByEmail(
                        authentication.getName()
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "User account not found"
                        )
                );
    }

    // --------------------------------------------------
    // ADD FOOD
    // --------------------------------------------------

    @PostMapping("/food")
    public ResponseEntity<?> addFood(
            Authentication authentication,
            @RequestBody FoodItem foodItem) {

        try {

            User donor =
                    getLoggedInDonor(authentication);

            if (!"DONOR".equalsIgnoreCase(
                    donor.getRole())) {

                return ResponseEntity
                        .status(403)
                        .body(
                                "Only donor accounts can add food"
                        );
            }

            foodItem.setDonorName(
                    donor.getName()
            );

            FoodItem savedFood =
                    foodItemService.addFoodItem(
                            foodItem
                    );

            return ResponseEntity.ok(
                    savedFood
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // --------------------------------------------------
    // GET LOGGED-IN DONOR FOOD
    // --------------------------------------------------

    @GetMapping("/food")
    public ResponseEntity<?> getDonorFood(
            Authentication authentication) {

        try {

            User donor =
                    getLoggedInDonor(authentication);

            if (!"DONOR".equalsIgnoreCase(
                    donor.getRole())) {

                return ResponseEntity
                        .status(403)
                        .body(
                                "Only donor accounts can access donor food"
                        );
            }

            List<FoodItem> food =
                    foodItemService.getByDonor(
                            donor.getName()
                    );

            return ResponseEntity.ok(
                    food
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // --------------------------------------------------
    // GET ORDERS RECEIVED
    // --------------------------------------------------

    @GetMapping("/orders")
    public ResponseEntity<?> getDonorOrders(
            Authentication authentication) {

        try {

            User donor =
                    getLoggedInDonor(authentication);

            if (!"DONOR".equalsIgnoreCase(
                    donor.getRole())) {

                return ResponseEntity
                        .status(403)
                        .body(
                                "Only donor accounts can access received orders"
                        );
            }

            List<Map<String, Object>> orders =
                    orderService.getDonorOrders(
                            donor.getName()
                    );

            return ResponseEntity.ok(
                    orders
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // --------------------------------------------------
    // UPDATE FOOD
    // --------------------------------------------------

    @PutMapping("/food/{foodId}")
    public ResponseEntity<?> updateFood(
            Authentication authentication,
            @PathVariable Long foodId,
            @RequestBody FoodItem foodItem) {

        try {

            User donor =
                    getLoggedInDonor(authentication);

            if (!"DONOR".equalsIgnoreCase(
                    donor.getRole())) {

                return ResponseEntity
                        .status(403)
                        .body(
                                "Only donor accounts can update food"
                        );
            }

            FoodItem existingFood =
                    foodItemService.getFoodItemById(
                            foodId
                    );

            if (!donor.getName().equalsIgnoreCase(
                    existingFood.getDonorName())) {

                return ResponseEntity
                        .status(403)
                        .body(
                                "You can update only your own food"
                        );
            }

            foodItem.setDonorName(
                    donor.getName()
            );

            FoodItem updatedFood =
                    foodItemService.updateFoodItem(
                            foodId,
                            foodItem
                    );

            return ResponseEntity.ok(
                    updatedFood
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // --------------------------------------------------
    // DELETE FOOD
    // --------------------------------------------------

    @DeleteMapping("/food/{foodId}")
    public ResponseEntity<?> deleteFood(
            Authentication authentication,
            @PathVariable Long foodId) {

        try {

            User donor =
                    getLoggedInDonor(authentication);

            if (!"DONOR".equalsIgnoreCase(
                    donor.getRole())) {

                return ResponseEntity
                        .status(403)
                        .body(
                                "Only donor accounts can delete food"
                        );
            }

            FoodItem existingFood =
                    foodItemService.getFoodItemById(
                            foodId
                    );

            if (!donor.getName().equalsIgnoreCase(
                    existingFood.getDonorName())) {

                return ResponseEntity
                        .status(403)
                        .body(
                                "You can delete only your own food"
                        );
            }

            foodItemService.deleteFoodItem(
                    foodId
            );

            return ResponseEntity.ok(
                    "Food item deleted successfully"
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}