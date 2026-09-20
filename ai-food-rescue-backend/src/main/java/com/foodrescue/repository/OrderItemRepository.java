package com.foodrescue.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.foodrescue.entity.OrderItem;

public interface OrderItemRepository
        extends JpaRepository<OrderItem, Long> {

    // Get all items belonging to one order
    List<OrderItem> findByOrderId(Long orderId);

    // Get order items for multiple food items
    List<OrderItem> findByFoodItemIdIn(List<Long> foodItemIds);
}