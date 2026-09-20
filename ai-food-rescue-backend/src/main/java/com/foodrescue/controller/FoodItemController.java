package com.foodrescue.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.foodrescue.entity.FoodItem;
import com.foodrescue.service.FoodItemService;

@RestController
@RequestMapping("/api/food")
@CrossOrigin(origins = "http://localhost:5173")
public class FoodItemController {

    private final FoodItemService foodItemService;

    public FoodItemController(FoodItemService foodItemService) {
        this.foodItemService = foodItemService;
    }

    // --------------------------------------------------
    // GET ALL FOOD
    // --------------------------------------------------

    @GetMapping("/all")
    public ResponseEntity<List<FoodItem>> getAllFoodItems() {

        return ResponseEntity.ok(
                foodItemService.getAllFoodItems()
        );
    }

    // --------------------------------------------------
    // GET AVAILABLE FOOD
    // --------------------------------------------------

    @GetMapping("/available")
    public ResponseEntity<List<FoodItem>> getAvailableFoodItems() {

        return ResponseEntity.ok(
                foodItemService.getAvailableFoodItems()
        );
    }

    // --------------------------------------------------
    // GET FOOD BY CATEGORY
    // --------------------------------------------------

    @GetMapping("/category/{category}")
    public ResponseEntity<List<FoodItem>> getByCategory(
            @PathVariable String category) {

        return ResponseEntity.ok(
                foodItemService.getByCategory(category)
        );
    }

    // --------------------------------------------------
    // GET FOOD WITH OFFERS
    // --------------------------------------------------

    @GetMapping("/offers")
    public ResponseEntity<List<FoodItem>> getOfferItems() {

        return ResponseEntity.ok(
                foodItemService.getOfferItems()
        );
    }

    // --------------------------------------------------
    // GET FOOD BY STATUS
    // --------------------------------------------------

    @GetMapping("/status/{status}")
    public ResponseEntity<List<FoodItem>> getByStatus(
            @PathVariable String status) {

        return ResponseEntity.ok(
                foodItemService.getByStatus(status)
        );
    }

    // --------------------------------------------------
    // GET NON-EXPIRED FOOD
    // --------------------------------------------------

    @GetMapping("/not-expired")
    public ResponseEntity<List<FoodItem>> getNonExpiredFoodItems() {

        return ResponseEntity.ok(
                foodItemService.getNonExpiredFoodItems()
        );
    }

    // --------------------------------------------------
    // GET EXPIRED FOOD
    // --------------------------------------------------

    @GetMapping("/expired")
    public ResponseEntity<List<FoodItem>> getExpiredFoodItems() {

        return ResponseEntity.ok(
                foodItemService.getExpiredFoodItems()
        );
    }

    // --------------------------------------------------
    // GET FOOD BY DONOR
    // --------------------------------------------------

    @GetMapping("/donor/{donorName}")
    public ResponseEntity<List<FoodItem>> getByDonor(
            @PathVariable String donorName) {

        return ResponseEntity.ok(
                foodItemService.getByDonor(donorName)
        );
    }

    // --------------------------------------------------
    // GET FOOD BY ID
    // --------------------------------------------------

    @GetMapping("/{id}")
    public ResponseEntity<FoodItem> getFoodItem(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                foodItemService.getFoodItemById(id)
        );
    }

    // --------------------------------------------------
    // ADD FOOD
    // --------------------------------------------------

    @PostMapping
    public ResponseEntity<?> addFoodItem(
            @RequestBody FoodItem foodItem) {

        try {

            FoodItem savedFood =
                    foodItemService.addFoodItem(foodItem);

            return ResponseEntity.ok(savedFood);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // --------------------------------------------------
    // UPDATE FOOD
    // --------------------------------------------------

    @PutMapping("/{id}")
    public ResponseEntity<?> updateFoodItem(
            @PathVariable Long id,
            @RequestBody FoodItem foodItem) {

        try {

            FoodItem updatedFood =
                    foodItemService.updateFoodItem(
                            id,
                            foodItem
                    );

            return ResponseEntity.ok(updatedFood);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // --------------------------------------------------
    // DELETE FOOD
    // --------------------------------------------------

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFoodItem(
            @PathVariable Long id) {

        try {

            foodItemService.deleteFoodItem(id);

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