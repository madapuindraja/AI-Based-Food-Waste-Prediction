package com.foodrescue.service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.foodrescue.entity.CartItem;
import com.foodrescue.entity.FoodItem;
import com.foodrescue.entity.Order;
import com.foodrescue.entity.OrderItem;
import com.foodrescue.repository.CartItemRepository;
import com.foodrescue.repository.FoodItemRepository;
import com.foodrescue.repository.OrderItemRepository;
import com.foodrescue.repository.OrderRepository;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartItemRepository cartItemRepository;
    private final FoodItemRepository foodItemRepository;

    public OrderService(
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            CartItemRepository cartItemRepository,
            FoodItemRepository foodItemRepository) {

        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartItemRepository = cartItemRepository;
        this.foodItemRepository = foodItemRepository;
    }

    // --------------------------------------------------
    // PLACE ORDER
    // --------------------------------------------------

    @Transactional
    public Order placeOrder(
            Long userId,
            String deliveryAddress,
            String paymentMethod) {

        if (deliveryAddress == null ||
                deliveryAddress.trim().isEmpty()) {

            throw new RuntimeException(
                    "Delivery address is required"
            );
        }

        if (paymentMethod == null ||
                paymentMethod.trim().isEmpty()) {

            throw new RuntimeException(
                    "Payment method is required"
            );
        }

        List<CartItem> cartItems =
                cartItemRepository.findByUserId(userId);

        if (cartItems.isEmpty()) {

            throw new RuntimeException(
                    "Cart is empty"
            );
        }

        double totalAmount = 0;

        List<OrderItem> orderItems =
                new ArrayList<>();

        // Check all cart items before creating order
        for (CartItem cartItem : cartItems) {

            FoodItem foodItem =
                    foodItemRepository
                            .findById(cartItem.getFoodItemId())
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Food item not found: "
                                                    + cartItem.getFoodItemId()
                                    )
                            );

            // Check availability
            if (!foodItem.isAvailable()) {

                throw new RuntimeException(
                        foodItem.getName()
                                + " is currently unavailable"
                );
            }

            // Check expiry
            if (foodItem.getExpiryDate() == null ||
                    foodItem.getExpiryDate()
                            .isBefore(
                                    java.time.LocalDateTime.now()
                            )) {

                throw new RuntimeException(
                        foodItem.getName()
                                + " has expired"
                );
            }

            // Check quantity
            if (cartItem.getQuantity()
                    > foodItem.getQuantity()) {

                throw new RuntimeException(
                        "Only "
                                + foodItem.getQuantity()
                                + " quantity available for "
                                + foodItem.getName()
                );
            }

            // Determine actual price
            double actualPrice =
                    foodItem.getPrice();

            if (foodItem.isOfferAvailable() &&
                    foodItem.getOfferPrice() > 0) {

                actualPrice =
                        foodItem.getOfferPrice();
            }

            double subtotal =
                    actualPrice *
                            cartItem.getQuantity();

            totalAmount += subtotal;

            OrderItem orderItem =
                    new OrderItem();

            orderItem.setFoodItemId(
                    foodItem.getId()
            );

            orderItem.setFoodName(
                    foodItem.getName()
            );

            orderItem.setQuantity(
                    cartItem.getQuantity()
            );

            orderItem.setPrice(
                    actualPrice
            );

            orderItem.setSubtotal(
                    subtotal
            );

            orderItems.add(orderItem);
        }

        // --------------------------------------------------
        // CREATE ORDER
        // --------------------------------------------------

        Order order = new Order();

        order.setUserId(userId);
        order.setTotalAmount(totalAmount);
        order.setStatus("PLACED");

        order.setDeliveryAddress(
                deliveryAddress
        );

        order.setPaymentMethod(
                paymentMethod
        );

        Order savedOrder =
                orderRepository.save(order);

        // --------------------------------------------------
        // SAVE ORDER ITEMS + REDUCE FOOD QUANTITY
        // --------------------------------------------------

        for (int i = 0;
             i < cartItems.size();
             i++) {

            CartItem cartItem =
                    cartItems.get(i);

            OrderItem orderItem =
                    orderItems.get(i);

            orderItem.setOrderId(
                    savedOrder.getId()
            );

            orderItemRepository.save(
                    orderItem
            );

            FoodItem foodItem =
                    foodItemRepository
                            .findById(
                                    cartItem.getFoodItemId()
                            )
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Food item not found"
                                    )
                            );

            int remainingQuantity =
                    foodItem.getQuantity()
                            - cartItem.getQuantity();

            foodItem.setQuantity(
                    remainingQuantity
            );

            if (remainingQuantity <= 0) {

                foodItem.setQuantity(0);
                foodItem.setAvailable(false);
                foodItem.setStatus("SOLD_OUT");
            }

            foodItemRepository.save(
                    foodItem
            );
        }

        // --------------------------------------------------
        // CLEAR CART
        // --------------------------------------------------

        cartItemRepository.deleteByUserId(
                userId
        );

        return savedOrder;
    }

    // --------------------------------------------------
    // GET USER ORDERS
    // --------------------------------------------------

    public List<Order> getUserOrders(Long userId) {

        return orderRepository.findByUserId(userId);
    }

    // --------------------------------------------------
    // GET ALL ORDERS
    // --------------------------------------------------

    public List<Order> getAllOrders() {

        return orderRepository.findAll();
    }

    // --------------------------------------------------
    // GET DONOR ORDERS
    //
    // Returns only orders containing food
    // donated by the logged-in donor.
    // --------------------------------------------------

    public List<Map<String, Object>> getDonorOrders(
            String donorName) {

        if (donorName == null ||
                donorName.trim().isEmpty()) {

            throw new RuntimeException(
                    "Donor name is required"
            );
        }

        // Find all food belonging to this donor
        List<FoodItem> donorFood =
                foodItemRepository.findByDonorName(
                        donorName
                );

        List<Map<String, Object>> result =
                new ArrayList<>();

        if (donorFood.isEmpty()) {
            return result;
        }

        // Get donor food IDs
        List<Long> donorFoodIds =
                donorFood.stream()
                        .map(FoodItem::getId)
                        .toList();

        // Find order items containing donor food
        List<OrderItem> donorOrderItems =
                orderItemRepository
                        .findByFoodItemIdIn(
                                donorFoodIds
                        );

        if (donorOrderItems.isEmpty()) {
            return result;
        }

        /*
         * Group order items by order ID.
         *
         * This is important because one order can contain
         * food from multiple donors.
         */
        Map<Long, List<OrderItem>> itemsByOrder =
                new LinkedHashMap<>();

        for (OrderItem item :
                donorOrderItems) {

            itemsByOrder
                    .computeIfAbsent(
                            item.getOrderId(),
                            key -> new ArrayList<>()
                    )
                    .add(item);
        }

        // Build donor-specific order response
        for (Map.Entry<Long, List<OrderItem>> entry :
                itemsByOrder.entrySet()) {

            Long orderId =
                    entry.getKey();

            Order order =
                    orderRepository
                            .findById(orderId)
                            .orElse(null);

            if (order == null) {
                continue;
            }

            Map<String, Object> orderData =
                    new LinkedHashMap<>();

            orderData.put(
                    "orderId",
                    order.getId()
            );

            orderData.put(
                    "userId",
                    order.getUserId()
            );

            orderData.put(
                    "status",
                    order.getStatus()
            );

            orderData.put(
                    "deliveryAddress",
                    order.getDeliveryAddress()
            );

            orderData.put(
                    "paymentMethod",
                    order.getPaymentMethod()
            );

            orderData.put(
                    "orderDate",
                    order.getOrderDate()
            );

            /*
             * Calculate only this donor's amount,
             * not the complete order amount.
             */
            double donorTotal = 0;

            for (OrderItem item :
                    entry.getValue()) {

                donorTotal +=
                        item.getSubtotal();
            }

            orderData.put(
                    "donorTotal",
                    donorTotal
            );

            orderData.put(
                    "items",
                    entry.getValue()
            );

            result.add(orderData);
        }

        return result;
    }

    // --------------------------------------------------
    // GET ORDER BY ID
    // --------------------------------------------------

    public Order getOrderById(Long orderId) {

        return orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Order not found with ID: "
                                        + orderId
                        )
                );
    }

    // --------------------------------------------------
    // GET ORDER ITEMS
    // --------------------------------------------------

    public List<OrderItem> getOrderItems(
            Long orderId) {

        getOrderById(orderId);

        return orderItemRepository
                .findByOrderId(orderId);
    }

    // --------------------------------------------------
    // CANCEL ORDER
    // --------------------------------------------------

    @Transactional
    public Order cancelOrder(
            Long userId,
            Long orderId) {

        Order order =
                getOrderById(orderId);

        if (!order.getUserId().equals(userId)) {

            throw new RuntimeException(
                    "You cannot cancel this order"
            );
        }

        if ("CANCELLED".equals(
                order.getStatus())) {

            throw new RuntimeException(
                    "Order is already cancelled"
            );
        }

        if ("COMPLETED".equals(
                order.getStatus())) {

            throw new RuntimeException(
                    "Completed order cannot be cancelled"
            );
        }

        List<OrderItem> orderItems =
                orderItemRepository
                        .findByOrderId(orderId);

        // Return food quantity to inventory
        for (OrderItem orderItem :
                orderItems) {

            FoodItem foodItem =
                    foodItemRepository
                            .findById(
                                    orderItem.getFoodItemId()
                            )
                            .orElse(null);

            if (foodItem != null) {

                int restoredQuantity =
                        foodItem.getQuantity()
                                + orderItem.getQuantity();

                foodItem.setQuantity(
                        restoredQuantity
                );

                if (foodItem.getExpiryDate() != null &&
                        foodItem.getExpiryDate()
                                .isAfter(
                                        java.time.LocalDateTime.now()
                                )) {

                    foodItem.setAvailable(true);
                    foodItem.setStatus(
                            "AVAILABLE"
                    );
                }

                foodItemRepository.save(
                        foodItem
                );
            }
        }

        order.setStatus(
                "CANCELLED"
        );

        return orderRepository.save(
                order
        );
    }

    // --------------------------------------------------
    // UPDATE ORDER STATUS
    // --------------------------------------------------

    public Order updateOrderStatus(
            Long orderId,
            String status) {

        Order order =
                getOrderById(orderId);

        order.setStatus(
                status.toUpperCase()
        );

        return orderRepository.save(
                order
        );
    }

    // --------------------------------------------------
    // GET ORDERS BY STATUS
    // --------------------------------------------------

    public List<Order> getOrdersByStatus(
            String status) {

        return orderRepository
                .findByStatus(
                        status.toUpperCase()
                );
    }
}