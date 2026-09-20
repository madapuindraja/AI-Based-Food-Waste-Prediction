package com.foodrescue.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.foodrescue.entity.FoodItem;

public interface FoodItemRepository extends JpaRepository<FoodItem, Long> {

    // All currently available food
    List<FoodItem> findByAvailableTrue();

    // Food by category
    List<FoodItem> findByCategory(String category);

    // Food currently having an offer
    List<FoodItem> findByOfferAvailableTrue();

    // Food with a particular rescue status
    List<FoodItem> findByStatus(String status);

    // Food that has not expired yet
    List<FoodItem> findByExpiryDateAfterAndAvailableTrue(
            LocalDateTime currentTime
    );

    // Food that has expired
    List<FoodItem> findByExpiryDateBefore(
            LocalDateTime currentTime
    );

    // Food by donor
    List<FoodItem> findByDonorName(String donorName);
}