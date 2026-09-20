package com.foodrescue.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.foodrescue.entity.FoodItem;
import com.foodrescue.repository.FoodItemRepository;

@Service
public class FoodItemService {

    private final FoodItemRepository foodItemRepository;

    public FoodItemService(FoodItemRepository foodItemRepository) {
        this.foodItemRepository = foodItemRepository;
    }

    // Get all food items
    public List<FoodItem> getAllFoodItems() {
        return foodItemRepository.findAll();
    }

    // Get food that is available and not expired
    public List<FoodItem> getAvailableFoodItems() {

        LocalDateTime now = LocalDateTime.now();

        return foodItemRepository
                .findByExpiryDateAfterAndAvailableTrue(now);
    }

    // Get food by category
    public List<FoodItem> getByCategory(String category) {
        return foodItemRepository.findByCategory(category);
    }

    // Get food items with offers
    public List<FoodItem> getOfferItems() {
        return foodItemRepository.findByOfferAvailableTrue();
    }

    // Get food by status
    public List<FoodItem> getByStatus(String status) {
        return foodItemRepository.findByStatus(status);
    }

    // Get food that has not expired
    public List<FoodItem> getNonExpiredFoodItems() {

        LocalDateTime now = LocalDateTime.now();

        return foodItemRepository
                .findByExpiryDateAfterAndAvailableTrue(now);
    }

    // Get expired food
    public List<FoodItem> getExpiredFoodItems() {

        LocalDateTime now = LocalDateTime.now();

        return foodItemRepository
                .findByExpiryDateBefore(now);
    }

    // Get food by donor
    public List<FoodItem> getByDonor(String donorName) {
        return foodItemRepository.findByDonorName(donorName);
    }

    // Get food item by ID
    public FoodItem getFoodItemById(Long id) {

        return foodItemRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Food item not found with ID: " + id
                        )
                );
    }

    // Add new food
    public FoodItem addFoodItem(FoodItem foodItem) {

        if (foodItem.getQuantity() <= 0) {
            throw new RuntimeException(
                    "Food quantity must be greater than zero"
            );
        }

        if (foodItem.getExpiryDate() == null) {
            throw new RuntimeException(
                    "Expiry date is required"
            );
        }

        if (foodItem.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException(
                    "Expiry date must be in the future"
            );
        }

        if (foodItem.getDonorName() == null ||
                foodItem.getDonorName().trim().isEmpty()) {

            throw new RuntimeException(
                    "Donor name is required"
            );
        }

        foodItem.setStatus("AVAILABLE");
        foodItem.setAvailable(true);

        if (!foodItem.isOfferAvailable()) {
            foodItem.setOfferPrice(foodItem.getPrice());
        }

        return foodItemRepository.save(foodItem);
    }

    // Update food
    public FoodItem updateFoodItem(
            Long id,
            FoodItem updatedFoodItem) {

        FoodItem existingFoodItem =
                getFoodItemById(id);

        existingFoodItem.setName(
                updatedFoodItem.getName()
        );

        existingFoodItem.setDescription(
                updatedFoodItem.getDescription()
        );

        existingFoodItem.setPrice(
                updatedFoodItem.getPrice()
        );

        existingFoodItem.setCategory(
                updatedFoodItem.getCategory()
        );

        existingFoodItem.setImageUrl(
                updatedFoodItem.getImageUrl()
        );

        existingFoodItem.setQuantity(
                updatedFoodItem.getQuantity()
        );

        existingFoodItem.setExpiryDate(
                updatedFoodItem.getExpiryDate()
        );

        existingFoodItem.setPickupAddress(
                updatedFoodItem.getPickupAddress()
        );

        existingFoodItem.setDonorName(
                updatedFoodItem.getDonorName()
        );

        existingFoodItem.setAvailable(
                updatedFoodItem.isAvailable()
        );

        existingFoodItem.setOfferAvailable(
                updatedFoodItem.isOfferAvailable()
        );

        existingFoodItem.setOfferPrice(
                updatedFoodItem.getOfferPrice()
        );

        existingFoodItem.setStatus(
                updatedFoodItem.getStatus()
        );

        return foodItemRepository.save(existingFoodItem);
    }

    // Delete food
    public void deleteFoodItem(Long id) {

        if (!foodItemRepository.existsById(id)) {

            throw new RuntimeException(
                    "Food item not found with ID: " + id
            );
        }

        foodItemRepository.deleteById(id);
    }
}