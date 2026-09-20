import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/Orders.css";

function Orders() {
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [cancellingId, setCancellingId] = useState(null);

    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        loadOrders();
    }, [token, navigate]);

    const loadOrders = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await api.getMyOrders(token);

            setOrders(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Orders loading error:", err);

            setError(
                err.message ||
                "Unable to load your orders."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async (orderId) => {
        const confirmed = window.confirm(
            "Are you sure you want to cancel this order?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setCancellingId(orderId);
            setError("");

            await api.cancelOrder(token, orderId);

            await loadOrders();
        } catch (err) {
            console.error("Cancel order error:", err);

            setError(
                err.message ||
                "Unable to cancel this order."
            );
        } finally {
            setCancellingId(null);
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

    const getStatusClass = (status) => {
        switch (status?.toUpperCase()) {
            case "PLACED":
                return "status-placed";

            case "CONFIRMED":
                return "status-confirmed";

            case "PREPARING":
                return "status-preparing";

            case "OUT_FOR_DELIVERY":
                return "status-delivery";

            case "COMPLETED":
                return "status-completed";

            case "CANCELLED":
                return "status-cancelled";

            default:
                return "status-default";
        }
    };

    const formatStatus = (status) => {
        if (!status) {
            return "UNKNOWN";
        }

        return status
            .toLowerCase()
            .split("_")
            .map(
                word =>
                    word.charAt(0).toUpperCase() +
                    word.slice(1)
            )
            .join(" ");
    };

    const formatDate = (date) => {
        if (!date) {
            return "Date unavailable";
        }

        try {
            return new Date(date).toLocaleString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                }
            );
        } catch {
            return date;
        }
    };

    if (loading) {
        return (
            <div className="orders-page">
                <div className="orders-loading">
                    <div className="orders-spinner"></div>

                    <h3>
                        Loading your orders...
                    </h3>

                    <p>
                        Please wait a moment.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="orders-page">

            {/* NAVBAR */}
            <nav className="orders-navbar">

                <Link
                    to="/"
                    className="orders-logo"
                >
                    <span className="orders-logo-icon">
                        🍲
                    </span>

                    <span>
                        Food<span>Rescue</span>
                    </span>
                </Link>

                <div className="orders-nav-links">

                    <Link to="/menu">
                        Menu
                    </Link>

                    <Link to="/cart">
                        Cart
                    </Link>

                    <Link
                        to="/orders"
                        className="active"
                    >
                        Orders
                    </Link>

                    <Link to="/profile">
                        Profile
                    </Link>

                    <button
                        className="orders-logout-btn"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </div>

            </nav>

            {/* HEADER */}
            <section className="orders-header">

                <div>
                    <p className="orders-eyebrow">
                        ORDER HISTORY
                    </p>

                    <h1>
                        My <span>Orders</span>
                    </h1>

                    <p>
                        Track your rescued food and manage
                        your previous orders.
                    </p>
                </div>

                <div className="orders-count-card">
                    <span>📦</span>

                    <div>
                        <strong>
                            {orders.length}
                        </strong>

                        <small>
                            Total Orders
                        </small>
                    </div>
                </div>

            </section>

            {/* ERROR */}
            {error && (
                <div className="orders-alert">
                    <span>⚠️</span>

                    <div>
                        <strong>
                            Something went wrong
                        </strong>

                        <p>
                            {error}
                        </p>
                    </div>
                </div>
            )}

            {/* CONTENT */}
            <main className="orders-container">

                {orders.length === 0 ? (

                    <div className="orders-empty">

                        <div className="empty-icon">
                            📦
                        </div>

                        <h2>
                            No Orders Yet
                        </h2>

                        <p>
                            You haven't placed any food rescue
                            orders yet.
                        </p>

                        <Link
                            to="/menu"
                            className="browse-food-btn"
                        >
                            Browse Available Food
                            <span>→</span>
                        </Link>

                    </div>

                ) : (

                    <div className="orders-list">

                        {orders.map((order) => {

                            const canCancel =
                                order.status === "PLACED" ||
                                order.status === "CONFIRMED";

                            return (
                                <article
                                    className="order-card"
                                    key={order.id}
                                >

                                    {/* ORDER TOP */}
                                    <div className="order-card-top">

                                        <div>
                                            <p className="order-label">
                                                ORDER
                                            </p>

                                            <h2>
                                                #{order.id}
                                            </h2>
                                        </div>

                                        <span
                                            className={`order-status ${getStatusClass(
                                                order.status
                                            )}`}
                                        >
                                            {formatStatus(
                                                order.status
                                            )}
                                        </span>

                                    </div>

                                    {/* ORDER DETAILS */}
                                    <div className="order-details">

                                        <div className="order-detail">

                                            <span className="detail-icon">
                                                📅
                                            </span>

                                            <div>
                                                <small>
                                                    Ordered On
                                                </small>

                                                <strong>
                                                    {formatDate(
                                                        order.orderDate
                                                    )}
                                                </strong>
                                            </div>

                                        </div>

                                        <div className="order-detail">

                                            <span className="detail-icon">
                                                💳
                                            </span>

                                            <div>
                                                <small>
                                                    Payment
                                                </small>

                                                <strong>
                                                    {order.paymentMethod ||
                                                        "Not specified"}
                                                </strong>
                                            </div>

                                        </div>

                                        <div className="order-detail">

                                            <span className="detail-icon">
                                                📍
                                            </span>

                                            <div>
                                                <small>
                                                    Delivery Address
                                                </small>

                                                <strong>
                                                    {order.deliveryAddress ||
                                                        "Not available"}
                                                </strong>
                                            </div>

                                        </div>

                                    </div>

                                    {/* ORDER BOTTOM */}
                                    <div className="order-card-bottom">

                                        <div className="order-total">

                                            <small>
                                                Order Total
                                            </small>

                                            <strong>
                                                ₹
                                                {Number(
                                                    order.totalAmount || 0
                                                ).toFixed(2)}
                                            </strong>

                                        </div>

                                        <div className="order-actions">

                                            {canCancel && (
                                                <button
                                                    className="cancel-order-btn"
                                                    onClick={() =>
                                                        handleCancelOrder(
                                                            order.id
                                                        )
                                                    }
                                                    disabled={
                                                        cancellingId ===
                                                        order.id
                                                    }
                                                >
                                                    {cancellingId ===
                                                    order.id
                                                        ? "Cancelling..."
                                                        : "Cancel Order"}
                                                </button>
                                            )}

                                        </div>

                                    </div>

                                </article>
                            );
                        })}

                    </div>
                )}

            </main>

        </div>
    );
}

export default Orders;
