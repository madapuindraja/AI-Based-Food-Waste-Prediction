package com.foodrescue.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.foodrescue.entity.CartItem;
import com.foodrescue.entity.FoodItem;
import com.foodrescue.repository.CartItemRepository;
import com.foodrescue.repository.FoodItemRepository;

@Service
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final FoodItemRepository foodItemRepository;

    public CartService(
            CartItemRepository cartItemRepository,
            FoodItemRepository foodItemRepository) {

        this.cartItemRepository = cartItemRepository;
        this.foodItemRepository = foodItemRepository;
    }

    // Get user's cart
    public List<CartItem> getCart(Long userId) {

        return cartItemRepository.findByUserId(userId);
    }

    // Add food to cart
    public CartItem addToCart(
            Long userId,
            Long foodItemId,
            int quantity) {

        if (quantity <= 0) {
            throw new RuntimeException(
                    "Quantity must be greater than zero"
            );
        }

        FoodItem foodItem = foodItemRepository
                .findById(foodItemId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Food item not found"
                        )
                );

        if (!foodItem.isAvailable()) {
            throw new RuntimeException(
                    "Food item is not available"
            );
        }

        if (foodItem.getExpiryDate() == null ||
                foodItem.getExpiryDate()
                        .isBefore(java.time.LocalDateTime.now())) {

            throw new RuntimeException(
                    "Food item has expired"
            );
        }

        if (quantity > foodItem.getQuantity()) {
            throw new RuntimeException(
                    "Requested quantity is not available"
            );
        }

        var existingItem =
                cartItemRepository.findByUserIdAndFoodItemId(
                        userId,
                        foodItemId
                );

        if (existingItem.isPresent()) {

            CartItem cartItem = existingItem.get();

            int newQuantity =
                    cartItem.getQuantity() + quantity;

            if (newQuantity > foodItem.getQuantity()) {
                throw new RuntimeException(
                        "Requested quantity exceeds available food"
                );
            }

            cartItem.setQuantity(newQuantity);

            return cartItemRepository.save(cartItem);
        }

        CartItem cartItem = new CartItem();

        cartItem.setUserId(userId);
        cartItem.setFoodItemId(foodItemId);
        cartItem.setQuantity(quantity);

        return cartItemRepository.save(cartItem);
    }

    // Update cart quantity
    public CartItem updateQuantity(
            Long userId,
            Long foodItemId,
            int quantity) {

        if (quantity <= 0) {
            throw new RuntimeException(
                    "Quantity must be greater than zero"
            );
        }

        CartItem cartItem =
                cartItemRepository
                        .findByUserIdAndFoodItemId(
                                userId,
                                foodItemId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Food item is not in cart"
                                )
                        );

        FoodItem foodItem =
                foodItemRepository
                        .findById(foodItemId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Food item not found"
                                )
                        );

        if (quantity > foodItem.getQuantity()) {
            throw new RuntimeException(
                    "Requested quantity is not available"
            );
        }

        cartItem.setQuantity(quantity);

        return cartItemRepository.save(cartItem);
    }

    // Remove one food item from cart
    public void removeFromCart(
            Long userId,
            Long foodItemId) {

        CartItem cartItem =
                cartItemRepository
                        .findByUserIdAndFoodItemId(
                                userId,
                                foodItemId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Food item is not in cart"
                                )
                        );

        cartItemRepository.delete(cartItem);
    }

    // Clear complete cart
    public void clearCart(Long userId) {

        cartItemRepository.deleteByUserId(userId);
    }
}