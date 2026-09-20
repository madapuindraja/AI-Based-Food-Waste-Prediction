package com.foodrescue.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.foodrescue.entity.CartItem;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    List<CartItem> findByUserId(Long userId);

    Optional<CartItem> findByUserIdAndFoodItemId(
            Long userId,
            Long foodItemId
    );

    void deleteByUserId(Long userId);

    boolean existsByUserIdAndFoodItemId(
            Long userId,
            Long foodItemId
    );
}