import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/Checkout.css";

function Checkout() {
    const navigate = useNavigate();

    const [cart, setCart] = useState([]);
    const [foodDetails, setFoodDetails] = useState({});
    const [address, setAddress] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("COD");

    const [loading, setLoading] = useState(true);
    const [placingOrder, setPlacingOrder] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        loadCheckoutData();
    }, [token, navigate]);

    const loadCheckoutData = async () => {
        try {
            setLoading(true);
            setError("");

            const [cartData, profileData] = await Promise.all([
                api.getCart(token),
                api.getProfile(token)
            ]);

            const cartItems = Array.isArray(cartData) ? cartData : [];
            setCart(cartItems);

            if (profileData?.address) {
                setAddress(profileData.address);
            }

            const details = {};

            await Promise.all(
                cartItems.map(async (item) => {
                    try {
                        const food = await api.getFoodById(item.foodItemId);
                        details[item.foodItemId] = food;
                    } catch (err) {
                        console.error(
                            `Failed to load food ${item.foodItemId}`,
                            err
                        );
                    }
                })
            );

            setFoodDetails(details);

            if (cartItems.length === 0) {
                setError("Your cart is empty.");
            }
        } catch (err) {
            console.error("Checkout loading error:", err);

            setError(
                err.message ||
                "Unable to load checkout details."
            );
        } finally {
            setLoading(false);
        }
    };

    const orderItems = useMemo(() => {
        return cart.map((item) => {
            const food = foodDetails[item.foodItemId];

            if (!food) {
                return {
                    ...item,
                    name: "Loading item...",
                    price: 0,
                    subtotal: 0
                };
            }

            const price =
                food.offerAvailable &&
                food.offerPrice != null &&
                Number(food.offerPrice) < Number(food.price)
                    ? Number(food.offerPrice)
                    : Number(food.price);

            return {
                ...item,
                name: food.name,
                price,
                originalPrice: Number(food.price),
                offerAvailable: food.offerAvailable,
                subtotal: price * Number(item.quantity)
            };
        });
    }, [cart, foodDetails]);

    const subtotal = useMemo(() => {
        return orderItems.reduce(
            (total, item) => total + item.subtotal,
            0
        );
    }, [orderItems]);

    const deliveryFee = 0;
    const serviceFee = 0;

    const totalAmount =
        subtotal + deliveryFee + serviceFee;

    const handlePlaceOrder = async () => {
        if (!address.trim()) {
            setError("Please enter your delivery address.");
            return;
        }

        if (cart.length === 0) {
            setError("Your cart is empty.");
            return;
        }

        try {
            setPlacingOrder(true);
            setError("");
            setSuccess("");

            const order = await api.placeOrder(
                token,
                address.trim(),
                paymentMethod
            );

            console.log("Order placed:", order);

            setSuccess(
                `Order placed successfully! Order #${order.id}`
            );

            setTimeout(() => {
                navigate("/orders");
            }, 1800);

        } catch (err) {
            console.error("Place order error:", err);

            setError(
                err.message ||
                "Unable to place your order."
            );
        } finally {
            setPlacingOrder(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("userId");
        localStorage.removeItem("name");
        localStorage.removeItem("email");

        navigate("/login");
    };

    if (loading) {
        return (
            <div className="checkout-page">
                <div className="checkout-loading">
                    <div className="checkout-spinner"></div>
                    <h3>Preparing your checkout...</h3>
                    <p>Please wait a moment.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-page">

            {/* NAVBAR */}
            <nav className="checkout-navbar">

                <Link to="/" className="checkout-logo">
                    <span className="logo-icon">🍲</span>
                    <span>
                        Food<span>Rescue</span>
                    </span>
                </Link>

                <div className="checkout-nav-links">
                    <Link to="/menu">Menu</Link>
                    <Link to="/cart">Cart</Link>
                    <Link to="/orders">Orders</Link>
                    <Link to="/profile">Profile</Link>

                    <button
                        className="checkout-logout-btn"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>

            </nav>

            {/* HEADER */}
            <section className="checkout-header">
                <div>
                    <p className="checkout-eyebrow">
                        SECURE CHECKOUT
                    </p>

                    <h1>
                        Complete Your <span>Order</span>
                    </h1>

                    <p>
                        Review your rescued food, confirm delivery
                        details and place your order.
                    </p>
                </div>

                <div className="checkout-step">
                    <span className="active">1</span>
                    <span className="line"></span>
                    <span className="active">2</span>
                    <span className="line"></span>
                    <span>3</span>
                </div>
            </section>

            {/* ERROR */}
            {error && (
                <div className="checkout-alert error-alert">
                    <span>⚠️</span>
                    <div>
                        <strong>Something went wrong</strong>
                        <p>{error}</p>
                    </div>
                </div>
            )}

            {/* SUCCESS */}
            {success && (
                <div className="checkout-alert success-alert">
                    <span>✓</span>
                    <div>
                        <strong>Order Confirmed!</strong>
                        <p>{success}</p>
                    </div>
                </div>
            )}

            {cart.length > 0 && (
                <main className="checkout-container">

                    {/* LEFT SIDE */}
                    <div className="checkout-main">

                        {/* DELIVERY ADDRESS */}
                        <section className="checkout-card">

                            <div className="checkout-card-title">
                                <div className="title-icon">
                                    📍
                                </div>

                                <div>
                                    <h2>Delivery Address</h2>
                                    <p>
                                        Where should we deliver your order?
                                    </p>
                                </div>
                            </div>

                            <label>
                                Delivery Address
                            </label>

                            <textarea
                                value={address}
                                onChange={(e) =>
                                    setAddress(e.target.value)
                                }
                                placeholder="Enter your complete delivery address"
                                rows="4"
                            />

                            <div className="address-note">
                                <span>🔒</span>
                                Your address is used only for order delivery.
                            </div>

                        </section>

                        {/* PAYMENT */}
                        <section className="checkout-card">

                            <div className="checkout-card-title">
                                <div className="title-icon">
                                    💳
                                </div>

                                <div>
                                    <h2>Payment Method</h2>
                                    <p>
                                        Choose how you want to pay.
                                    </p>
                                </div>
                            </div>

                            <div className="payment-options">

                                <button
                                    type="button"
                                    className={
                                        paymentMethod === "COD"
                                            ? "payment-option selected"
                                            : "payment-option"
                                    }
                                    onClick={() =>
                                        setPaymentMethod("COD")
                                    }
                                >
                                    <div className="payment-icon">
                                        💵
                                    </div>

                                    <div className="payment-content">
                                        <strong>
                                            Cash on Delivery
                                        </strong>

                                        <span>
                                            Pay when your order arrives
                                        </span>
                                    </div>

                                    <div className="radio-circle">
                                        {paymentMethod === "COD" && (
                                            <span></span>
                                        )}
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    className={
                                        paymentMethod === "UPI"
                                            ? "payment-option selected"
                                            : "payment-option"
                                    }
                                    onClick={() =>
                                        setPaymentMethod("UPI")
                                    }
                                >
                                    <div className="payment-icon">
                                        📱
                                    </div>

                                    <div className="payment-content">
                                        <strong>
                                            UPI
                                        </strong>

                                        <span>
                                            Pay securely using UPI
                                        </span>
                                    </div>

                                    <div className="radio-circle">
                                        {paymentMethod === "UPI" && (
                                            <span></span>
                                        )}
                                    </div>
                                </button>

                            </div>

                            {paymentMethod === "UPI" && (
                                <div className="upi-info">
                                    <span>ℹ️</span>
                                    UPI payment integration can be connected
                                    to a payment gateway later. For now,
                                    the order will be recorded with UPI
                                    as the selected payment method.
                                </div>
                            )}

                        </section>

                        {/* ORDER ITEMS */}
                        <section className="checkout-card">

                            <div className="checkout-card-title">
                                <div className="title-icon">
                                    🛒
                                </div>

                                <div>
                                    <h2>Your Items</h2>
                                    <p>
                                        {cart.length} item
                                        {cart.length !== 1 ? "s" : ""} in
                                        your order
                                    </p>
                                </div>
                            </div>

                            <div className="checkout-items">

                                {orderItems.map((item) => (
                                    <div
                                        className="checkout-item"
                                        key={item.id}
                                    >
                                        <div className="checkout-item-image">
                                            {foodDetails[item.foodItemId]?.imageUrl ? (
                                                <img
                                                    src={
                                                        foodDetails[
                                                            item.foodItemId
                                                        ].imageUrl
                                                    }
                                                    alt={item.name}
                                                />
                                            ) : (
                                                <span>🍲</span>
                                            )}
                                        </div>

                                        <div className="checkout-item-info">
                                            <h3>{item.name}</h3>

                                            <p>
                                                Quantity:{" "}
                                                <strong>
                                                    {item.quantity}
                                                </strong>
                                            </p>

                                            <span className="checkout-item-price">
                                                ₹{item.price.toFixed(2)} each
                                            </span>
                                        </div>

                                        <div className="checkout-item-total">
                                            ₹{item.subtotal.toFixed(2)}
                                        </div>
                                    </div>
                                ))}

                            </div>

                        </section>

                    </div>

                    {/* RIGHT SIDE */}
                    <aside className="checkout-summary">

                        <div className="summary-card">

                            <div className="summary-header">
                                <h2>Order Summary</h2>
                                <span>
                                    {cart.length} item
                                    {cart.length !== 1 ? "s" : ""}
                                </span>
                            </div>

                            <div className="summary-items">

                                {orderItems.map((item) => (
                                    <div
                                        className="summary-item"
                                        key={item.id}
                                    >
                                        <span>
                                            {item.name} × {item.quantity}
                                        </span>

                                        <strong>
                                            ₹{item.subtotal.toFixed(2)}
                                        </strong>
                                    </div>
                                ))}

                            </div>

                            <div className="summary-divider"></div>

                            <div className="summary-row">
                                <span>Subtotal</span>
                                <strong>
                                    ₹{subtotal.toFixed(2)}
                                </strong>
                            </div>

                            <div className="summary-row">
                                <span>Delivery</span>
                                <strong className="free-text">
                                    FREE
                                </strong>
                            </div>

                            <div className="summary-row">
                                <span>Service Fee</span>
                                <strong>
                                    ₹0.00
                                </strong>
                            </div>

                            <div className="summary-divider"></div>

                            <div className="summary-total">
                                <span>Total</span>
                                <strong>
                                    ₹{totalAmount.toFixed(2)}
                                </strong>
                            </div>

                            <button
                                className="place-order-btn"
                                onClick={handlePlaceOrder}
                                disabled={placingOrder}
                            >
                                {placingOrder ? (
                                    <>
                                        <span className="button-spinner"></span>
                                        Placing Order...
                                    </>
                                ) : (
                                    <>
                                        Place Order
                                        <span>→</span>
                                    </>
                                )}
                            </button>

                            <div className="secure-checkout">
                                <span>🔒</span>
                                Secure checkout
                            </div>

                        </div>

                        <Link
                            to="/cart"
                            className="back-cart-btn"
                        >
                            ← Back to Cart
                        </Link>

                    </aside>

                </main>
            )}

        </div>
    );
}

export default Checkout;
