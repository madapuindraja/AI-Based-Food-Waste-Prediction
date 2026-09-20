import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/Cart.css";

function Cart() {

    const navigate = useNavigate();

    const [cartItems, setCartItems] = useState([]);
    const [foodDetails, setFoodDetails] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState(null);

    const token = localStorage.getItem("token");
    const name = localStorage.getItem("name") || "User";


    useEffect(() => {

        if (!token) {
            navigate("/login");
            return;
        }

        loadCart();

    }, [token, navigate]);


    const loadCart = async () => {

        try {

            setLoading(true);
            setError("");

            const cart = await api.getCart(token);

            setCartItems(
                Array.isArray(cart)
                    ? cart
                    : []
            );

            /*
             * Cart API returns:
             * userId
             * foodItemId
             * quantity
             *
             * Load full food information for each item.
             */
            const details = {};

            for (const item of cart) {

                try {

                    const food =
                        await api.getFoodById(
                            item.foodItemId
                        );

                    details[item.foodItemId] = food;

                } catch {
                    // Ignore unavailable food details
                }
            }

            setFoodDetails(details);

        } catch (err) {

            setError(
                err.message ||
                "Unable to load your cart."
            );

        } finally {

            setLoading(false);
        }
    };


    const getFood = (foodItemId) => {
        return foodDetails[foodItemId];
    };


    const getPrice = (food) => {

        if (
            food &&
            food.offerAvailable &&
            food.offerPrice > 0
        ) {
            return food.offerPrice;
        }

        return food?.price || 0;
    };


    const getSubtotal = (item) => {

        const food = getFood(item.foodItemId);

        return getPrice(food) * item.quantity;
    };


    const getTotal = () => {

        return cartItems.reduce(
            (total, item) =>
                total + getSubtotal(item),
            0
        );
    };


    const updateQuantity = async (
        item,
        newQuantity
    ) => {

        if (newQuantity < 1) {
            return;
        }

        const food = getFood(item.foodItemId);

        if (
            food &&
            newQuantity > food.quantity
        ) {
            return;
        }

        try {

            setUpdatingId(item.foodItemId);

            const updated =
                await api.updateCart(
                    token,
                    item.foodItemId,
                    newQuantity
                );

            setCartItems(prev =>
                prev.map(cartItem =>
                    cartItem.foodItemId ===
                    item.foodItemId
                        ? updated
                        : cartItem
                )
            );

        } catch (err) {

            setError(
                err.message ||
                "Unable to update quantity."
            );

        } finally {

            setUpdatingId(null);
        }
    };


    const removeItem = async (foodItemId) => {

        try {

            setUpdatingId(foodItemId);

            await api.removeFromCart(
                token,
                foodItemId
            );

            setCartItems(prev =>
                prev.filter(
                    item =>
                        item.foodItemId !==
                        foodItemId
                )
            );

        } catch (err) {

            setError(
                err.message ||
                "Unable to remove item."
            );

        } finally {

            setUpdatingId(null);
        }
    };


    const handleLogout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("userId");
        localStorage.removeItem("name");
        localStorage.removeItem("email");

        navigate("/");
    };


    const handleCheckout = () => {

        if (cartItems.length === 0) {
            return;
        }

        navigate("/checkout");
    };


    return (
        <div className="cart-page">

            {/* ================= NAVBAR ================= */}

            <header className="cart-navbar">

                <Link
                    to="/menu"
                    className="cart-brand"
                >
                    <span className="cart-brand-icon">
                        ♻
                    </span>

                    <span>
                        Food<span>Rescue</span>
                    </span>
                </Link>


                <nav className="cart-nav-links">

                    <Link to="/menu">
                        Discover
                    </Link>

                    <Link
                        to="/cart"
                        className="active"
                    >
                        Cart
                    </Link>

                    <Link to="/orders">
                        My Orders
                    </Link>

                    <Link to="/profile">
                        Profile
                    </Link>

                </nav>


                <div className="cart-nav-right">

                    <div className="cart-user">

                        <span className="cart-avatar">
                            {name
                                .charAt(0)
                                .toUpperCase()}
                        </span>

                        <span>
                            {name}
                        </span>

                    </div>

                    <button
                        onClick={handleLogout}
                        className="cart-logout"
                    >
                        Logout
                    </button>

                </div>

            </header>


            {/* ================= PAGE HEADER ================= */}

            <section className="cart-header">

                <Link
                    to="/menu"
                    className="back-menu"
                >
                    ← Continue browsing
                </Link>

                <div className="cart-title-row">

                    <div>

                        <span className="cart-eyebrow">
                            YOUR RESCUED FOOD
                        </span>

                        <h1>
                            Your Cart
                        </h1>

                        <p>
                            Review your rescued food before
                            placing your order.
                        </p>

                    </div>

                    {!loading && (
                        <div className="cart-item-count">
                            {cartItems.length}
                            <span>
                                {cartItems.length === 1
                                    ? " item"
                                    : " items"}
                            </span>
                        </div>
                    )}

                </div>

            </section>


            {/* ================= CONTENT ================= */}

            <main className="cart-content">

                {error && (

                    <div className="cart-error">

                        <span>⚠</span>

                        <div>
                            {error}
                        </div>

                        <button
                            onClick={() => setError("")}
                        >
                            ×
                        </button>

                    </div>

                )}


                {loading ? (

                    <div className="cart-layout">

                        <div className="cart-items-section">

                            {[1, 2].map(item => (

                                <div
                                    className="cart-skeleton"
                                    key={item}
                                >

                                    <div className="skeleton-cart-image"></div>

                                    <div className="skeleton-cart-content">

                                        <div className="skeleton-line large"></div>
                                        <div className="skeleton-line"></div>
                                        <div className="skeleton-line short"></div>

                                    </div>

                                </div>

                            ))}

                        </div>

                    </div>

                ) : cartItems.length === 0 ? (

                    /* EMPTY CART */

                    <div className="empty-cart">

                        <div className="empty-cart-icon">
                            🛒
                        </div>

                        <h2>
                            Your cart is empty
                        </h2>

                        <p>
                            Discover surplus food and rescue
                            your first meal today.
                        </p>

                        <Link
                            to="/menu"
                            className="browse-food-button"
                        >
                            Discover Food →
                        </Link>

                    </div>

                ) : (

                    <div className="cart-layout">

                        {/* ================= ITEMS ================= */}

                        <section className="cart-items-section">

                            <div className="cart-section-heading">

                                <h2>
                                    Selected Food
                                </h2>

                                <span>
                                    {cartItems.length} products
                                </span>

                            </div>


                            <div className="cart-items">

                                {cartItems.map(item => {

                                    const food =
                                        getFood(
                                            item.foodItemId
                                        );

                                    if (!food) {

                                        return (
                                            <div
                                                className="missing-food"
                                                key={item.id}
                                            >
                                                <span>
                                                    Food item unavailable
                                                </span>

                                                <button
                                                    onClick={() =>
                                                        removeItem(
                                                            item.foodItemId
                                                        )
                                                    }
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        );
                                    }


                                    const price =
                                        getPrice(food);

                                    const hasOffer =
                                        food.offerAvailable &&
                                        food.offerPrice > 0 &&
                                        food.offerPrice <
                                            food.price;


                                    return (

                                        <article
                                            className="cart-item"
                                            key={item.id}
                                        >

                                            {/* IMAGE */}

                                            <div className="cart-item-image">

                                                {food.imageUrl ? (

                                                    <img
                                                        src={
                                                            food.imageUrl
                                                        }
                                                        alt={
                                                            food.name
                                                        }
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = "none";
                                                            e.currentTarget.nextSibling.style.display = "flex";
                                                        }}
                                                    />

                                                ) : null}

                                                <div
                                                    className="cart-image-placeholder"
                                                    style={{
                                                        display:
                                                            food.imageUrl
                                                                ? "none"
                                                                : "flex"
                                                    }}
                                                >
                                                    🍲
                                                </div>

                                            </div>


                                            {/* INFO */}

                                            <div className="cart-item-info">

                                                <div className="cart-item-top">

                                                    <div>

                                                        <span className="cart-category">
                                                            {food.category}
                                                        </span>

                                                        <h3>
                                                            {food.name}
                                                        </h3>

                                                    </div>

                                                    <button
                                                        className="remove-button"
                                                        onClick={() =>
                                                            removeItem(
                                                                food.id
                                                            )
                                                        }
                                                        disabled={
                                                            updatingId ===
                                                            food.id
                                                        }
                                                        title="Remove"
                                                    >
                                                        🗑
                                                    </button>

                                                </div>


                                                <p className="cart-description">
                                                    {food.description}
                                                </p>


                                                <div className="cart-item-details">

                                                    <span>
                                                        🤝 {food.donorName}
                                                    </span>

                                                    <span>
                                                        📦 {food.quantity} available
                                                    </span>

                                                </div>


                                                <div className="cart-item-bottom">

                                                    <div className="cart-price">

                                                        <strong>
                                                            ₹{price.toFixed(2)}
                                                        </strong>

                                                        {hasOffer && (
                                                            <span>
                                                                ₹{food.price.toFixed(2)}
                                                            </span>
                                                        )}

                                                    </div>


                                                    <div className="cart-quantity">

                                                        <button
                                                            onClick={() =>
                                                                updateQuantity(
                                                                    item,
                                                                    item.quantity - 1
                                                                )
                                                            }
                                                            disabled={
                                                                updatingId ===
                                                                item.foodItemId ||
                                                                item.quantity <= 1
                                                            }
                                                        >
                                                            −
                                                        </button>

                                                        <span>
                                                            {item.quantity}
                                                        </span>

                                                        <button
                                                            onClick={() =>
                                                                updateQuantity(
                                                                    item,
                                                                    item.quantity + 1
                                                                )
                                                            }
                                                            disabled={
                                                                updatingId ===
                                                                item.foodItemId ||
                                                                item.quantity >=
                                                                    food.quantity
                                                            }
                                                        >
                                                            +
                                                        </button>

                                                    </div>


                                                    <strong className="item-subtotal">
                                                        ₹{(
                                                            price *
                                                            item.quantity
                                                        ).toFixed(2)}
                                                    </strong>

                                                </div>

                                            </div>

                                        </article>

                                    );

                                })}

                            </div>


                            <Link
                                to="/menu"
                                className="continue-shopping"
                            >
                                ← Add more food
                            </Link>

                        </section>


                        {/* ================= SUMMARY ================= */}

                        <aside className="cart-summary">

                            <div className="summary-header">

                                <h2>
                                    Order Summary
                                </h2>

                                <span>
                                    {cartItems.length} items
                                </span>

                            </div>


                            <div className="summary-lines">

                                <div>
                                    <span>
                                        Food subtotal
                                    </span>

                                    <strong>
                                        ₹{getTotal().toFixed(2)}
                                    </strong>
                                </div>


                                <div>
                                    <span>
                                        Delivery
                                    </span>

                                    <strong className="free">
                                        FREE
                                    </strong>
                                </div>


                                <div>
                                    <span>
                                        Service fee
                                    </span>

                                    <strong>
                                        ₹0.00
                                    </strong>
                                </div>

                            </div>


                            <div className="summary-total">

                                <span>
                                    Total
                                </span>

                                <strong>
                                    ₹{getTotal().toFixed(2)}
                                </strong>

                            </div>


                            <div className="summary-note">

                                <span>♻</span>

                                <p>
                                    You're helping prevent good
                                    food from going to waste.
                                </p>

                            </div>


                            <button
                                className="checkout-button"
                                onClick={handleCheckout}
                            >
                                Proceed to Checkout
                                <span>→</span>
                            </button>


                            <div className="secure-note">
                                🔒 Secure checkout
                            </div>

                        </aside>

                    </div>

                )}

            </main>


            {/* ================= FOOTER ================= */}

            <footer className="cart-footer">

                <strong>
                    FoodRescue
                </strong>

                <span>
                    Give good food another chance. © 2026
                </span>

            </footer>

        </div>
    );
}

export default Cart;