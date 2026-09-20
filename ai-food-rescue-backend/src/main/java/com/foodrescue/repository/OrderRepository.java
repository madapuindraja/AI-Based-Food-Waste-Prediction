package com.foodrescue.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.foodrescue.entity.Order;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserId(Long userId);

    List<Order> findByStatus(String status);

    List<Order> findByUserIdAndStatus(
            Long userId,
            String status
    );
}