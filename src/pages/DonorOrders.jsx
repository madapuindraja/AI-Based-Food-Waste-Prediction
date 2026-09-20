import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/DonorOrders.css";

function DonorOrders() {
const navigate = useNavigate();


const [orders, setOrders] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [updatingOrderId, setUpdatingOrderId] = useState(null);

const token = localStorage.getItem("token");
const role = (localStorage.getItem("role") || "")
    .replace("ROLE_", "")
    .trim()
    .toUpperCase();

useEffect(() => {
    if (!token) {
        navigate("/login");
        return;
    }

    if (role !== "DONOR") {
        navigate(role === "ADMIN" ? "/admin" : "/menu");
        return;
    }

    loadOrders();
}, [navigate, token, role]);

const loadOrders = async () => {
    try {
        setLoading(true);
        setError("");

        const response = await fetch(
            "http://localhost:8080/api/donor/orders",
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        if (!response.ok) {
            throw new Error("Unable to load received orders.");
        }

        const data = await response.json();

        setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
        console.error("Load donor orders error:", err);
        setError(err.message || "Unable to load orders.");
    } finally {
        setLoading(false);
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

const formatDate = (dateString) => {
    if (!dateString) {
        return "-";
    }

    try {
        return new Date(dateString).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return dateString;
    }
};

const normalizeStatus = (status) => {
    return (status || "PLACED")
        .toString()
        .trim()
        .toUpperCase();
};

const getNextStatus = (status) => {
    const currentStatus = normalizeStatus(status);

    const statusFlow = {
        PLACED: "ACCEPTED",
        ACCEPTED: "PREPARING",
        PREPARING: "READY_FOR_PICKUP",
        READY_FOR_PICKUP: "OUT_FOR_DELIVERY",
        OUT_FOR_DELIVERY: "DELIVERED",
    };

    return statusFlow[currentStatus] || null;
};

const getActionLabel = (status) => {
    const currentStatus = normalizeStatus(status);

    const labels = {
        PLACED: "Accept Order",
        ACCEPTED: "Start Preparing",
        PREPARING: "Ready for Pickup",
        READY_FOR_PICKUP: "Start Delivery",
        OUT_FOR_DELIVERY: "Mark Delivered",
    };

    return labels[currentStatus] || "";
};

const getStatusLabel = (status) => {
    const currentStatus = normalizeStatus(status);

    const labels = {
        PLACED: "Placed",
        ACCEPTED: "Accepted",
        PREPARING: "Preparing",
        READY_FOR_PICKUP: "Ready for Pickup",
        OUT_FOR_DELIVERY: "Out for Delivery",
        DELIVERED: "Delivered",
        COMPLETED: "Completed",
        CANCELLED: "Cancelled",
        REJECTED: "Rejected",
    };

    return labels[currentStatus] || currentStatus;
};

const getStatusClass = (status) => {
    const currentStatus = normalizeStatus(status);

    if (currentStatus === "DELIVERED" || currentStatus === "COMPLETED") {
        return "status-delivered";
    }

    if (
        currentStatus === "CANCELLED" ||
        currentStatus === "REJECTED"
    ) {
        return "status-cancelled";
    }

    if (currentStatus === "OUT_FOR_DELIVERY") {
        return "status-out-delivery";
    }

    if (currentStatus === "READY_FOR_PICKUP") {
        return "status-ready";
    }

    if (
        currentStatus === "PREPARING" ||
        currentStatus === "ACCEPTED"
    ) {
        return "status-processing";
    }

    return "status-placed";
};

const updateOrderStatus = async (order) => {
    const nextStatus = getNextStatus(order.status);

    if (!nextStatus) {
        return;
    }

    try {
        setUpdatingOrderId(order.orderId);
        setError("");

        const response = await fetch(
            `http://localhost:8080/api/orders/${order.orderId}/status?status=${encodeURIComponent(
                nextStatus
            )}`,
            {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        if (!response.ok) {
            const message = await response.text();
            throw new Error(
                message || "Unable to update delivery status."
            );
        }

        setOrders((previousOrders) =>
            previousOrders.map((item) =>
                item.orderId === order.orderId
                    ? {
                          ...item,
                          status: nextStatus,
                      }
                    : item
            )
        );
    } catch (err) {
        console.error("Update delivery status error:", err);
        setError(
            err.message || "Unable to update delivery status."
        );
    } finally {
        setUpdatingOrderId(null);
    }
};

const getOrderTotal = (order) => {
    if (
        order.donorTotal !== undefined &&
        order.donorTotal !== null
    ) {
        return Number(order.donorTotal).toFixed(2);
    }

    if (!Array.isArray(order.items)) {
        return "0.00";
    }

    return order.items
        .reduce(
            (total, item) =>
                total + Number(item.subtotal || 0),
            0
        )
        .toFixed(2);
};

const getTotalOrders = () => orders.length;

const getActiveOrders = () => {
    return orders.filter((order) => {
        const status = normalizeStatus(order.status);

        return ![
            "DELIVERED",
            "COMPLETED",
            "CANCELLED",
            "REJECTED",
        ].includes(status);
    }).length;
};

const getDeliveredOrders = () => {
    return orders.filter((order) => {
        const status = normalizeStatus(order.status);

        return (
            status === "DELIVERED" ||
            status === "COMPLETED"
        );
    }).length;
};

const getCancelledOrders = () => {
    return orders.filter((order) => {
        const status = normalizeStatus(order.status);

        return (
            status === "CANCELLED" ||
            status === "REJECTED"
        );
    }).length;
};

return (
    <div className="donor-orders-page">

        {/* NAVBAR */}
        <nav className="donor-orders-navbar">

            <div
                className="donor-orders-logo"
                onClick={() => navigate("/donor")}
            >
                <div className="donor-orders-logo-icon">
                    FR
                </div>

                <div>
                    <strong>FoodRescue</strong>
                    <span>Donor Portal</span>
                </div>
            </div>

            <div className="donor-orders-nav-links">

                <button
                    className="donor-orders-nav-btn"
                    onClick={() => navigate("/donor")}
                >
                    Dashboard
                </button>

                <button
                    className="donor-orders-nav-btn"
                    onClick={() => navigate("/menu")}
                >
                    Browse Food
                </button>

                <button
                    className="donor-orders-nav-btn"
                    onClick={() => navigate("/donor/cart")}
                >
                    Cart
                </button>

                <button
                    className="donor-orders-nav-btn active"
                    onClick={() => navigate("/donor/orders")}
                >
                    My Orders
                </button>

                <button
                    className="donor-orders-nav-btn"
                    onClick={() => navigate("/donor/profile")}
                >
                    Profile
                </button>

                <button
                    className="donor-orders-logout-btn"
                    onClick={handleLogout}
                >
                    Logout
                </button>

            </div>
        </nav>

        {/* HEADER */}
        <header className="donor-orders-header">

            <div>
                <p className="donor-orders-eyebrow">
                    DONOR PORTAL
                </p>

                <h1>Received Orders</h1>

                <p>
                    Manage customer orders and update delivery
                    status from acceptance to delivery.
                </p>
            </div>

            <button
                className="back-dashboard-btn"
                onClick={() => navigate("/donor")}
            >
                ← Dashboard
            </button>

        </header>

        {/* MAIN */}
        <main className="donor-orders-container">

            {error && (
                <div className="donor-orders-alert">
                    <span>⚠</span>
                    <span>{error}</span>
                    <button onClick={() => setError("")}>
                        ×
                    </button>
                </div>
            )}

            {/* SUMMARY */}
            <section className="orders-summary">

                <div className="orders-summary-card">
                    <div className="summary-icon total-icon">
                        📦
                    </div>

                    <div>
                        <span>Total Orders</span>
                        <strong>{getTotalOrders()}</strong>
                    </div>
                </div>

                <div className="orders-summary-card">
                    <div className="summary-icon active-icon">
                        🚚
                    </div>

                    <div>
                        <span>Active Deliveries</span>
                        <strong>{getActiveOrders()}</strong>
                    </div>
                </div>

                <div className="orders-summary-card">
                    <div className="summary-icon delivered-icon">
                        ✓
                    </div>

                    <div>
                        <span>Delivered</span>
                        <strong>{getDeliveredOrders()}</strong>
                    </div>
                </div>

                <div className="orders-summary-card">
                    <div className="summary-icon cancelled-icon">
                        !
                    </div>

                    <div>
                        <span>Cancelled</span>
                        <strong>{getCancelledOrders()}</strong>
                    </div>
                </div>

            </section>

            {/* ORDERS TABLE */}
            <section className="received-orders-section">

                <div className="received-orders-heading">

                    <div>
                        <p>ORDER MANAGEMENT</p>
                        <h2>Customer Deliveries</h2>
                    </div>

                    <button
                        className="refresh-orders-btn"
                        onClick={loadOrders}
                        disabled={loading}
                    >
                        ↻ Refresh
                    </button>

                </div>

                {loading ? (
                    <div className="donor-orders-loading">
                        <div className="loading-spinner"></div>
                        <p>Loading received orders...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="donor-orders-empty">
                        <div className="empty-icon">
                            📦
                        </div>

                        <h3>No Orders Yet</h3>

                        <p>
                            Customer orders for your food items
                            will appear here.
                        </p>

                        <button
                            onClick={() => navigate("/donor")}
                        >
                            Go to Dashboard
                        </button>
                    </div>
                ) : (
                    <div className="orders-table-wrapper">

                        <table className="received-orders-table">

                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Customer</th>
                                    <th>Food Items</th>
                                    <th>Delivery Address</th>
                                    <th>Payment</th>
                                    <th>Order Date</th>
                                    <th>Total</th>
                                    <th>Delivery Status</th>
                                    <th>Update Delivery</th>
                                </tr>
                            </thead>

                            <tbody>

                                {orders.map((order) => {

                                    const status =
                                        normalizeStatus(
                                            order.status
                                        );

                                    const nextStatus =
                                        getNextStatus(status);

                                    return (
                                        <tr key={order.orderId}>

                                            <td>
                                                <span className="table-order-id">
                                                    #{order.orderId}
                                                </span>
                                            </td>

                                            <td>
                                                <div className="table-customer">
                                                    <div className="customer-avatar">
                                                        C
                                                    </div>

                                                    <div>
                                                        <strong>
                                                            Customer #
                                                            {order.userId}
                                                        </strong>

                                                        <span>
                                                            User ID:{" "}
                                                            {order.userId}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td>
                                                <div className="table-food-items">

                                                    {Array.isArray(
                                                        order.items
                                                    ) &&
                                                        order.items.map(
                                                            (
                                                                item,
                                                                index
                                                            ) => (
                                                                <div
                                                                    className="table-food-item"
                                                                    key={
                                                                        item.id ||
                                                                        index
                                                                    }
                                                                >
                                                                    <strong>
                                                                        {
                                                                            item.foodName
                                                                        }
                                                                    </strong>

                                                                    <span>
                                                                        Qty:{" "}
                                                                        {
                                                                            item.quantity
                                                                        }
                                                                        {" × "}
                                                                        ₹
                                                                        {Number(
                                                                            item.price ||
                                                                                0
                                                                        ).toFixed(
                                                                            2
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            )
                                                        )}

                                                </div>
                                            </td>

                                            <td>
                                                <div className="table-address">
                                                    <span className="address-icon">
                                                        📍
                                                    </span>

                                                    <span>
                                                        {order.deliveryAddress ||
                                                            "Address not available"}
                                                    </span>
                                                </div>
                                            </td>

                                            <td>
                                                <span className="payment-badge">
                                                    {order.paymentMethod ||
                                                        "COD"}
                                                </span>
                                            </td>

                                            <td>
                                                <span className="table-date">
                                                    {formatDate(
                                                        order.orderDate
                                                    )}
                                                </span>
                                            </td>

                                            <td>
                                                <strong className="table-total">
                                                    ₹
                                                    {getOrderTotal(
                                                        order
                                                    )}
                                                </strong>
                                            </td>

                                            <td>
                                                <span
                                                    className={`received-order-status ${getStatusClass(
                                                        status
                                                    )}`}
                                                >
                                                    <span className="status-dot"></span>

                                                    {getStatusLabel(
                                                        status
                                                    )}
                                                </span>
                                            </td>

                                            <td>

                                                {nextStatus ? (
                                                    <button
                                                        className="order-status-btn"
                                                        onClick={() =>
                                                            updateOrderStatus(
                                                                order
                                                            )
                                                        }
                                                        disabled={
                                                            updatingOrderId ===
                                                            order.orderId
                                                        }
                                                    >
                                                        {updatingOrderId ===
                                                        order.orderId ? (
                                                            <>
                                                                <span className="button-spinner"></span>
                                                                Updating...
                                                            </>
                                                        ) : (
                                                            <>
                                                                {getActionLabel(
                                                                    status
                                                                )}
                                                                <span>
                                                                    →
                                                                </span>
                                                            </>
                                                        )}
                                                    </button>
                                                ) : (
                                                    <span className="order-complete-text">
                                                        {status ===
                                                            "DELIVERED" ||
                                                        status ===
                                                            "COMPLETED"
                                                            ? "✓ Delivery Completed"
                                                            : "No Action"}
                                                    </span>
                                                )}

                                            </td>

                                        </tr>
                                    );
                                })}

                            </tbody>

                        </table>

                    </div>
                )}

            </section>

        </main>
    </div>
);


}

export default DonorOrders;
