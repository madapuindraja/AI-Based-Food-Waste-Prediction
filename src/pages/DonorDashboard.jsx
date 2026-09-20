import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/DonorDashboard.css";

const API_BASE_URL = "http://localhost:8080/api";

/* =========================
AUTOMATIC FOOD IMAGES
========================= */

const FOOD_IMAGES = {

biryani:
    "https://images.unsplash.com/photo-1563379091339-03246963d96c?auto=format&fit=crop&w=900&q=80",

rice:
    "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=900&q=80",

meal:
    "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80",

pizza:
    "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=80",

burger:
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80",

bread:
    "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80",

cake:
    "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80",

fruits:
    "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=900&q=80",

vegetables:
    "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=80",

dairy:
    "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=900&q=80",

snacks:
    "https://images.unsplash.com/photo-1621939514649-280e2aa1f05a?auto=format&fit=crop&w=900&q=80",

curry:
    "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=80",

default:
    "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=900&q=80"

};

/* =========================
AUTOMATIC IMAGE SELECTION
========================= */

const getAutomaticFoodImage = (name, category) => {

const foodName =
    (name || "").toLowerCase();

const foodCategory =
    (category || "").toLowerCase();


if (foodName.includes("biryani")) {
    return FOOD_IMAGES.biryani;
}

if (foodName.includes("pizza")) {
    return FOOD_IMAGES.pizza;
}

if (foodName.includes("burger")) {
    return FOOD_IMAGES.burger;
}

if (
    foodName.includes("bread") ||
    foodName.includes("bun")
) {
    return FOOD_IMAGES.bread;
}

if (
    foodName.includes("cake") ||
    foodName.includes("pastry")
) {
    return FOOD_IMAGES.cake;
}

if (
    foodName.includes("curry") ||
    foodName.includes("dal") ||
    foodName.includes("gravy")
) {
    return FOOD_IMAGES.curry;
}

if (foodName.includes("rice")) {
    return FOOD_IMAGES.rice;
}

if (
    foodName.includes("fruit") ||
    foodName.includes("apple") ||
    foodName.includes("banana") ||
    foodName.includes("orange") ||
    foodName.includes("mango")
) {
    return FOOD_IMAGES.fruits;
}

if (
    foodName.includes("vegetable") ||
    foodName.includes("veggie")
) {
    return FOOD_IMAGES.vegetables;
}

if (
    foodName.includes("milk") ||
    foodName.includes("curd") ||
    foodName.includes("yogurt") ||
    foodName.includes("cheese")
) {
    return FOOD_IMAGES.dairy;
}

if (
    foodName.includes("snack") ||
    foodName.includes("samosa") ||
    foodName.includes("pakora") ||
    foodName.includes("chips")
) {
    return FOOD_IMAGES.snacks;
}

if (foodCategory.includes("rice")) {
    return FOOD_IMAGES.rice;
}

if (foodCategory.includes("meal")) {
    return FOOD_IMAGES.meal;
}

if (foodCategory.includes("bakery")) {
    return FOOD_IMAGES.bread;
}

if (foodCategory.includes("snack")) {
    return FOOD_IMAGES.snacks;
}

if (foodCategory.includes("fruit")) {
    return FOOD_IMAGES.fruits;
}

if (foodCategory.includes("vegetable")) {
    return FOOD_IMAGES.vegetables;
}

if (foodCategory.includes("dairy")) {
    return FOOD_IMAGES.dairy;
}

return FOOD_IMAGES.default;

};

/* =========================
ORDER STATUS FLOW
========================= */

const getNextOrderAction = (status) => {

const currentStatus =
    String(status || "PLACED").toUpperCase();

switch (currentStatus) {

    case "PLACED":
        return {
            nextStatus: "ACCEPTED",
            label: "Accept Order"
        };

    case "ACCEPTED":
        return {
            nextStatus: "PREPARING",
            label: "Start Preparing"
        };

    case "PREPARING":
        return {
            nextStatus: "READY_FOR_PICKUP",
            label: "Ready for Pickup"
        };

    case "READY_FOR_PICKUP":
        return {
            nextStatus: "OUT_FOR_DELIVERY",
            label: "Out for Delivery"
        };

    case "OUT_FOR_DELIVERY":
        return {
            nextStatus: "DELIVERED",
            label: "Mark Delivered"
        };

    default:
        return null;
}

};

/* =========================
STATUS LABEL
========================= */

const getStatusLabel = (status) => {

const value =
    String(status || "PLACED").toUpperCase();

switch (value) {

    case "READY_FOR_PICKUP":
        return "READY FOR PICKUP";

    case "OUT_FOR_DELIVERY":
        return "OUT FOR DELIVERY";

    case "PREPARING":
        return "PREPARING";

    case "ACCEPTED":
        return "ACCEPTED";

    case "DELIVERED":
        return "DELIVERED";

    case "CANCELLED":
        return "CANCELLED";

    case "PLACED":
    default:
        return "PLACED";
}

};

function DonorDashboard() {

const navigate = useNavigate();

const token =
    localStorage.getItem("token");

const role =
    (localStorage.getItem("role") || "").toUpperCase();


const [foodItems, setFoodItems] =
    useState([]);

const [donorOrders, setDonorOrders] =
    useState([]);

const [loading, setLoading] =
    useState(true);

const [ordersLoading, setOrdersLoading] =
    useState(true);

const [saving, setSaving] =
    useState(false);

const [deletingId, setDeletingId] =
    useState(null);

const [updatingOrderId, setUpdatingOrderId] =
    useState(null);

const [showForm, setShowForm] =
    useState(false);

const [editingId, setEditingId] =
    useState(null);

const [error, setError] =
    useState("");

const [success, setSuccess] =
    useState("");


const emptyForm = {

    name: "",
    description: "",
    price: "",
    category: "",
    quantity: "",
    expiryDate: "",
    pickupAddress: "",
    offerAvailable: false,
    offerPrice: "",
    status: "AVAILABLE"
};


const [form, setForm] =
    useState(emptyForm);


/* =========================
   AUTHENTICATION
========================= */

useEffect(() => {

    if (!token) {

        navigate("/login");
        return;
    }

    if (role !== "DONOR") {

        if (role === "USER") {
            navigate("/menu");
        } else if (role === "ADMIN") {
            navigate("/admin");
        } else {
            navigate("/login");
        }

        return;
    }

    loadFoodItems();
    loadDonorOrders();

}, [token, role, navigate]);


/* =========================
   RESPONSE HANDLER
========================= */

const readResponse = async (response) => {

    const text =
        await response.text();

    if (!text) {
        return null;
    }

    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
};


/* =========================
   LOAD FOOD
========================= */

const loadFoodItems = async () => {

    try {

        setLoading(true);
        setError("");

        const response =
            await fetch(
                `${API_BASE_URL}/donor/food`,
                {
                    method: "GET",
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                        Accept:
                            "application/json"
                    }
                }
            );

        const data =
            await readResponse(response);

        if (!response.ok) {

            throw new Error(
                typeof data === "string"
                    ? data
                    : data?.message ||
                      "Unable to load your food listings."
            );
        }

        setFoodItems(
            Array.isArray(data)
                ? data
                : []
        );

    } catch (err) {

        console.error(
            "Donor food loading error:",
            err
        );

        setError(
            err.message ||
            "Unable to load your food listings."
        );

    } finally {

        setLoading(false);
    }
};


/* =========================
   LOAD DONOR ORDERS
========================= */

const loadDonorOrders = async () => {

    try {

        setOrdersLoading(true);

        const response =
            await fetch(
                `${API_BASE_URL}/donor/orders`,
                {
                    method: "GET",
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                        Accept:
                            "application/json"
                    }
                }
            );

        const data =
            await readResponse(response);

        if (!response.ok) {

            throw new Error(
                typeof data === "string"
                    ? data
                    : data?.message ||
                      "Unable to load received orders."
            );
        }

        setDonorOrders(
            Array.isArray(data)
                ? data
                : []
        );

    } catch (err) {

        console.error(
            "Donor orders loading error:",
            err
        );

        setError(
            err.message ||
            "Unable to load received orders."
        );

    } finally {

        setOrdersLoading(false);
    }
};


/* =========================
   UPDATE ORDER STATUS
========================= */

const updateOrderStatus = async (
    orderId,
    nextStatus
) => {

    if (!orderId || !nextStatus) {
        return;
    }

    try {

        setUpdatingOrderId(orderId);

        setError("");
        setSuccess("");

        const response =
            await fetch(
                `${API_BASE_URL}/orders/${orderId}/status?status=${encodeURIComponent(nextStatus)}`,
                {
                    method: "PUT",

                    headers: {
                        Authorization:
                            `Bearer ${token}`,

                        Accept:
                            "application/json"
                    }
                }
            );

        const data =
            await readResponse(response);

        if (!response.ok) {

            throw new Error(
                typeof data === "string"
                    ? data
                    : data?.message ||
                      data?.error ||
                      `Unable to update order status. Server returned ${response.status}.`
            );
        }

        setSuccess(
            `Order #${orderId} updated to ${getStatusLabel(nextStatus)}.`
        );

        await loadDonorOrders();

    } catch (err) {

        console.error(
            "Order status update error:",
            err
        );

        setError(
            err.message ||
            "Unable to update order status."
        );

    } finally {

        setUpdatingOrderId(null);
    }
};


/* =========================
   INPUT CHANGE
========================= */

const handleInputChange = (e) => {

    const {
        name,
        value,
        type,
        checked
    } = e.target;

    setForm(
        (previous) => ({
            ...previous,

            [name]:
                type === "checkbox"
                    ? checked
                    : value
        })
    );
};


/* =========================
   OPEN ADD FORM
========================= */

const openAddForm = () => {

    setForm({
        ...emptyForm
    });

    setEditingId(null);
    setError("");
    setSuccess("");
    setShowForm(true);

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
};


/* =========================
   OPEN EDIT FORM
========================= */

const openEditForm = (food) => {

    let expiryValue = "";

    if (food.expiryDate) {

        expiryValue =
            food.expiryDate.substring(
                0,
                16
            );
    }

    setForm({

        name:
            food.name || "",

        description:
            food.description || "",

        price:
            food.price ?? "",

        category:
            food.category || "",

        quantity:
            food.quantity ?? "",

        expiryDate:
            expiryValue,

        pickupAddress:
            food.pickupAddress || "",

        offerAvailable:
            Boolean(
                food.offerAvailable
            ),

        offerPrice:
            food.offerPrice ?? "",

        status:
            food.status ||
            "AVAILABLE"
    });

    setEditingId(food.id);

    setError("");
    setSuccess("");
    setShowForm(true);

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
};


/* =========================
   CLOSE FORM
========================= */

const closeForm = () => {

    if (saving) {
        return;
    }

    setShowForm(false);
    setEditingId(null);

    setForm({
        ...emptyForm
    });

    setError("");
};


/* =========================
   SAVE FOOD
========================= */

const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");
    setSuccess("");


    if (!form.name.trim()) {

        setError(
            "Food name is required."
        );

        return;
    }


    if (!form.category.trim()) {

        setError(
            "Please select a food category."
        );

        return;
    }


    if (
        !form.price ||
        Number(form.price) <= 0
    ) {

        setError(
            "Please enter a valid price."
        );

        return;
    }


    if (
        !form.quantity ||
        Number(form.quantity) <= 0
    ) {

        setError(
            "Quantity must be greater than zero."
        );

        return;
    }


    if (!form.expiryDate) {

        setError(
            "Expiry date and time is required."
        );

        return;
    }


    const expiryDate =
        new Date(
            form.expiryDate
        );


    if (
        Number.isNaN(
            expiryDate.getTime()
        )
    ) {

        setError(
            "Please enter a valid expiry date."
        );

        return;
    }


    if (
        expiryDate <=
        new Date()
    ) {

        setError(
            "Expiry date must be in the future."
        );

        return;
    }


    if (
        !form.pickupAddress.trim()
    ) {

        setError(
            "Pickup address is required."
        );

        return;
    }


    if (
        form.offerAvailable &&
        (
            !form.offerPrice ||
            Number(form.offerPrice) <= 0
        )
    ) {

        setError(
            "Please enter a valid offer price."
        );

        return;
    }


    if (
        form.offerAvailable &&
        Number(form.offerPrice) >=
        Number(form.price)
    ) {

        setError(
            "Offer price should be lower than the original price."
        );

        return;
    }


    try {

        setSaving(true);


        const automaticImage =
            getAutomaticFoodImage(
                form.name,
                form.category
            );


        const foodData = {

            name:
                form.name.trim(),

            description:
                form.description.trim(),

            price:
                Number(form.price),

            category:
                form.category.trim(),

            imageUrl:
                automaticImage,

            quantity:
                Number(form.quantity),

            expiryDate:
                form.expiryDate,

            pickupAddress:
                form.pickupAddress.trim(),

            offerAvailable:
                Boolean(
                    form.offerAvailable
                ),

            offerPrice:
                form.offerAvailable
                    ? Number(
                          form.offerPrice
                      )
                    : Number(
                          form.price
                      ),

            available:
                true,

            status:
                "AVAILABLE"
        };


        const url =
            editingId
                ? `${API_BASE_URL}/donor/food/${editingId}`
                : `${API_BASE_URL}/donor/food`;


        const method =
            editingId
                ? "PUT"
                : "POST";


        const response =
            await fetch(
                url,
                {
                    method,

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`,

                        Accept:
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            foodData
                        )
                }
            );


        const data =
            await readResponse(
                response
            );


        if (!response.ok) {

            throw new Error(

                typeof data === "string"
                    ? data
                    : data?.message
                        ? data.message
                        : data?.error
                            ? data.error
                            : `Unable to save food. Server returned ${response.status}.`
            );
        }


        setSuccess(
            editingId
                ? "Food item updated successfully."
                : "Food item added successfully."
        );


        setShowForm(false);
        setEditingId(null);

        setForm({
            ...emptyForm
        });


        await loadFoodItems();

        await loadDonorOrders();

    } catch (err) {

        console.error(
            "Food save error:",
            err
        );

        setError(
            err.message ||
            "Unable to save food item."
        );

    } finally {

        setSaving(false);
    }
};


/* =========================
   DELETE FOOD
========================= */

const handleDelete = async (foodId) => {

    const confirmed =
        window.confirm(
            "Are you sure you want to delete this food listing?"
        );

    if (!confirmed) {
        return;
    }


    try {

        setDeletingId(foodId);

        setError("");
        setSuccess("");


        const response =
            await fetch(
                `${API_BASE_URL}/donor/food/${foodId}`,
                {
                    method: "DELETE",

                    headers: {
                        Authorization:
                            `Bearer ${token}`,

                        Accept:
                            "application/json"
                    }
                }
            );


        const data =
            await readResponse(
                response
            );


        if (!response.ok) {

            throw new Error(

                typeof data === "string"
                    ? data
                    : data?.message ||
                      "Unable to delete food."
            );
        }


        setSuccess(
            "Food item deleted successfully."
        );


        await loadFoodItems();

        await loadDonorOrders();

    } catch (err) {

        console.error(
            "Delete food error:",
            err
        );

        setError(
            err.message ||
            "Unable to delete food item."
        );

    } finally {

        setDeletingId(null);
    }
};


/* =========================
   LOGOUT
========================= */

const handleLogout = () => {

    localStorage.removeItem(
        "token"
    );

    localStorage.removeItem(
        "role"
    );

    localStorage.removeItem(
        "userId"
    );

    localStorage.removeItem(
        "name"
    );

    localStorage.removeItem(
        "email"
    );

    navigate("/login");
};


/* =========================
   STATISTICS
========================= */

const stats = useMemo(() => {

    const total =
        foodItems.length;


    const available =
        foodItems.filter(
            (item) =>
                item.available === true &&
                item.status !== "SOLD_OUT" &&
                Number(
                    item.quantity || 0
                ) > 0 &&
                !(
                    item.expiryDate &&
                    new Date(
                        item.expiryDate
                    ) < new Date()
                )
        ).length;


    const soldOut =
        foodItems.filter(
            (item) =>
                item.status ===
                    "SOLD_OUT" ||
                Number(
                    item.quantity || 0
                ) === 0
        ).length;


    const totalQuantity =
        foodItems.reduce(
            (sum, item) =>
                sum +
                Number(
                    item.quantity || 0
                ),
            0
        );


    return {
        total,
        available,
        soldOut,
        totalQuantity
    };

}, [foodItems]);


/* =========================
   ORDER STATISTICS
========================= */

const orderStats = useMemo(() => {

    const received =
        donorOrders.length;

    const delivered =
        donorOrders.filter(
            (order) =>
                String(
                    order.status || ""
                ).toUpperCase() ===
                "DELIVERED"
        ).length;

    const active =
        donorOrders.filter(
            (order) => {

                const status =
                    String(
                        order.status || ""
                    ).toUpperCase();

                return (
                    status !== "DELIVERED" &&
                    status !== "CANCELLED"
                );
            }
        ).length;

    return {
        received,
        delivered,
        active
    };

}, [donorOrders]);


/* =========================
   FORMAT DATE
========================= */

const formatDate = (date) => {

    if (!date) {
        return "Not available";
    }

    try {

        return new Date(
            date
        ).toLocaleString(
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


/* =========================
   EXPIRED CHECK
========================= */

const isExpired = (date) => {

    if (!date) {
        return false;
    }

    return (
        new Date(date) <
        new Date()
    );
};


/* =========================
   LOADING
========================= */

if (loading) {

    return (

        <div className="donor-page">

            <div className="donor-loading">

                <div className="donor-spinner"></div>

                <h3>
                    Loading donor dashboard...
                </h3>

                <p>
                    Please wait a moment.
                </p>

            </div>

        </div>
    );
}


return (

    <div className="donor-page">

        {/* =========================
            NAVBAR
        ========================= */}

        <nav className="donor-navbar">

            <Link
                to="/"
                className="donor-logo"
            >

                <span className="donor-logo-icon">
                    🍲
                </span>

                <span>
                    Food<span>Rescue</span>
                </span>

            </Link>


            <div className="donor-nav-links">

                <Link to="/">
                    Home
                </Link>

                <Link
                    to="/donor"
                    className="active"
                >
                    Dashboard
                </Link>

                <Link to="/menu">
                    Browse Food
                </Link>

                <Link to="/cart">
                    Cart
                </Link>

                <Link to="/orders">
                    My Orders
                </Link>

                <Link to="/donor/profile">
                    Profile
                </Link>

                <button
                    className="donor-logout-btn"
                    onClick={handleLogout}
                >
                    Logout
                </button>

            </div>

        </nav>


        {/* =========================
            HEADER
        ========================= */}

        <header className="donor-header">

            <div>

                <p className="donor-eyebrow">
                    DONOR DASHBOARD
                </p>

                <h1>
                    Rescue More.
                    <span>
                        Waste Less.
                    </span>
                </h1>

                <p>
                    Share your surplus food
                    with people who need it
                    and help reduce food waste.
                </p>

            </div>


            <button
                type="button"
                className="add-food-header-btn"
                onClick={openAddForm}
                disabled={saving}
            >

                <span>
                    ＋
                </span>

                Add Food

            </button>

        </header>


        {/* =========================
            ALERTS
        ========================= */}

        {error && (

            <div className="donor-alert error-alert">

                <span>
                    ⚠️
                </span>

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


        {success && (

            <div className="donor-alert success-alert">

                <span>
                    ✓
                </span>

                <div>

                    <strong>
                        Success
                    </strong>

                    <p>
                        {success}
                    </p>

                </div>

            </div>
        )}


        <main className="donor-container">

            {/* =========================
                FOOD STATISTICS
            ========================= */}

            <section className="donor-stats">

                <div className="stat-card">

                    <div className="stat-icon orange">
                        🍲
                    </div>

                    <div>

                        <span>
                            Total Listings
                        </span>

                        <strong>
                            {stats.total}
                        </strong>

                    </div>

                </div>


                <div className="stat-card">

                    <div className="stat-icon green">
                        ✓
                    </div>

                    <div>

                        <span>
                            Available
                        </span>

                        <strong>
                            {stats.available}
                        </strong>

                    </div>

                </div>


                <div className="stat-card">

                    <div className="stat-icon blue">
                        📦
                    </div>

                    <div>

                        <span>
                            Total Quantity
                        </span>

                        <strong>
                            {stats.totalQuantity}
                        </strong>

                    </div>

                </div>


                <div className="stat-card">

                    <div className="stat-icon red">
                        ⏳
                    </div>

                    <div>

                        <span>
                            Sold Out
                        </span>

                        <strong>
                            {stats.soldOut}
                        </strong>

                    </div>

                </div>

            </section>


            {/* =========================
                ORDER STATISTICS
            ========================= */}

            <section className="donor-stats">

                <div className="stat-card">

                    <div className="stat-icon orange">
                        📦
                    </div>

                    <div>

                        <span>
                            Orders Received
                        </span>

                        <strong>
                            {orderStats.received}
                        </strong>

                    </div>

                </div>


                <div className="stat-card">

                    <div className="stat-icon blue">
                        🚚
                    </div>

                    <div>

                        <span>
                            Active Orders
                        </span>

                        <strong>
                            {orderStats.active}
                        </strong>

                    </div>

                </div>


                <div className="stat-card">

                    <div className="stat-icon green">
                        ✓
                    </div>

                    <div>

                        <span>
                            Delivered
                        </span>

                        <strong>
                            {orderStats.delivered}
                        </strong>

                    </div>

                </div>

            </section>


            {/* =========================
                ADD / EDIT FORM
            ========================= */}

            {showForm && (

                <section className="donor-form-card">

                    <div className="donor-form-header">

                        <div>

                            <p className="form-eyebrow">

                                {editingId
                                    ? "EDIT LISTING"
                                    : "NEW LISTING"}

                            </p>

                            <h2>

                                {editingId
                                    ? "Update Food"
                                    : "Add Surplus Food"}

                            </h2>

                            <p>
                                Provide details about
                                the food you want to
                                rescue from waste.
                            </p>

                        </div>


                        <button
                            type="button"
                            className="close-form-btn"
                            onClick={closeForm}
                            disabled={saving}
                        >
                            ×
                        </button>

                    </div>


                    <form
                        className="donor-form"
                        onSubmit={
                            handleSubmit
                        }
                    >

                        <div className="form-field">

                            <label>
                                Food Name *
                            </label>

                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={
                                    handleInputChange
                                }
                                placeholder="e.g. Vegetable Biryani"
                            />

                        </div>


                        <div className="form-field">

                            <label>
                                Category *
                            </label>

                            <select
                                name="category"
                                value={
                                    form.category
                                }
                                onChange={
                                    handleInputChange
                                }
                            >

                                <option value="">
                                    Select category
                                </option>

                                <option value="Rice">
                                    Rice
                                </option>

                                <option value="Meals">
                                    Meals
                                </option>

                                <option value="Bakery">
                                    Bakery
                                </option>

                                <option value="Snacks">
                                    Snacks
                                </option>

                                <option value="Fruits">
                                    Fruits
                                </option>

                                <option value="Vegetables">
                                    Vegetables
                                </option>

                                <option value="Dairy">
                                    Dairy
                                </option>

                                <option value="Other">
                                    Other
                                </option>

                            </select>

                        </div>


                        <div className="form-field">

                            <label>
                                Original Price (₹) *
                            </label>

                            <input
                                type="number"
                                name="price"
                                min="1"
                                step="0.01"
                                value={
                                    form.price
                                }
                                onChange={
                                    handleInputChange
                                }
                                placeholder="120"
                            />

                        </div>


                        <div className="form-field">

                            <label>
                                Quantity *
                            </label>

                            <input
                                type="number"
                                name="quantity"
                                min="1"
                                value={
                                    form.quantity
                                }
                                onChange={
                                    handleInputChange
                                }
                                placeholder="10"
                            />

                        </div>


                        <div className="form-field">

                            <label>
                                Expiry Date & Time *
                            </label>

                            <input
                                type="datetime-local"
                                name="expiryDate"
                                value={
                                    form.expiryDate
                                }
                                onChange={
                                    handleInputChange
                                }
                            />

                        </div>


                        <div className="form-field">

                            <label>
                                Pickup Address *
                            </label>

                            <input
                                type="text"
                                name="pickupAddress"
                                value={
                                    form.pickupAddress
                                }
                                onChange={
                                    handleInputChange
                                }
                                placeholder="Restaurant / shop address"
                            />

                        </div>


                        <div className="form-field full-width">

                            <label>
                                Description
                            </label>

                            <textarea
                                name="description"
                                value={
                                    form.description
                                }
                                onChange={
                                    handleInputChange
                                }
                                rows="3"
                                placeholder="Describe the food, ingredients, packaging, etc."
                            />

                        </div>


                        {/* AUTOMATIC IMAGE */}

                        <div className="form-field full-width">

                            <label>
                                Food Image
                            </label>

                            <div
                                style={{
                                    display:
                                        "flex",
                                    alignItems:
                                        "center",
                                    gap: "14px",
                                    padding:
                                        "10px",
                                    border:
                                        "1px solid #d9e3dc",
                                    borderRadius:
                                        "9px",
                                    background:
                                        "#fcfdfc"
                                }}
                            >

                                <img
                                    src={
                                        getAutomaticFoodImage(
                                            form.name,
                                            form.category
                                        )
                                    }
                                    alt="Food preview"
                                    style={{
                                        width:
                                            "85px",
                                        height:
                                            "65px",
                                        objectFit:
                                            "cover",
                                        borderRadius:
                                            "8px"
                                    }}
                                />

                                <div>

                                    <strong
                                        style={{
                                            display:
                                                "block",
                                            color:
                                                "#26392e",
                                            fontSize:
                                                "13px"
                                        }}
                                    >
                                        Automatic Image
                                    </strong>

                                    <span
                                        style={{
                                            display:
                                                "block",
                                            marginTop:
                                                "4px",
                                            color:
                                                "#7b857f",
                                            fontSize:
                                                "11px"
                                        }}
                                    >
                                        Image is selected
                                        automatically from
                                        the food name/category.
                                    </span>

                                </div>

                            </div>

                        </div>


                        {/* OFFER */}

                        <div className="offer-section">

                            <label className="offer-checkbox">

                                <input
                                    type="checkbox"
                                    name="offerAvailable"
                                    checked={
                                        form.offerAvailable
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                />

                                <span>
                                    Enable special offer
                                </span>

                            </label>


                            {form.offerAvailable && (

                                <div className="offer-price-field">

                                    <label>
                                        Rescue Price (₹) *
                                    </label>

                                    <input
                                        type="number"
                                        name="offerPrice"
                                        min="1"
                                        step="0.01"
                                        value={
                                            form.offerPrice
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        placeholder="90"
                                    />

                                </div>

                            )}

                        </div>


                        {/* ACTIONS */}

                        <div className="form-actions">

                            <button
                                type="button"
                                className="form-cancel-btn"
                                onClick={
                                    closeForm
                                }
                                disabled={saving}
                            >
                                Cancel
                            </button>


                            <button
                                type="submit"
                                className="form-save-btn"
                                disabled={saving}
                            >

                                {saving ? (

                                    <>
                                        <span className="button-spinner"></span>
                                        Saving...
                                    </>

                                ) : (

                                    editingId
                                        ? "✓ Update Food"
                                        : "＋ Add Food"

                                )}

                            </button>

                        </div>

                    </form>

                </section>
            )}


            {/* =========================
                LISTINGS
            ========================= */}

            <section className="donor-listings">

                <div className="listings-header">

                    <div>

                        <p className="listings-eyebrow">
                            YOUR FOOD
                        </p>

                        <h2>
                            My Listings
                        </h2>

                    </div>


                    <button
                        type="button"
                        className="add-food-btn"
                        onClick={
                            openAddForm
                        }
                        disabled={saving}
                    >
                        ＋ Add Food
                    </button>

                </div>


                {foodItems.length === 0 ? (

                    <div className="donor-empty">

                        <div className="empty-icon">
                            🍲
                        </div>

                        <h3>
                            No Food Listings Yet
                        </h3>

                        <p>
                            Start rescuing surplus food
                            by creating your first listing.
                        </p>

                        <button
                            type="button"
                            className="empty-add-btn"
                            onClick={
                                openAddForm
                            }
                            disabled={saving}
                        >
                            ＋ Add Your First Food
                        </button>

                    </div>

                ) : (

                    <div className="food-grid">

                        {foodItems.map(
                            (food) => {

                                const expired =
                                    isExpired(
                                        food.expiryDate
                                    );

                                const soldOut =
                                    food.status ===
                                        "SOLD_OUT" ||
                                    Number(
                                        food.quantity
                                    ) === 0;

                                const image =
                                    food.imageUrl ||
                                    getAutomaticFoodImage(
                                        food.name,
                                        food.category
                                    );


                                return (

                                    <article
                                        className="donor-food-card"
                                        key={
                                            food.id
                                        }
                                    >

                                        <div className="food-card-image">

                                            <img
                                                src={
                                                    image
                                                }
                                                alt={
                                                    food.name
                                                }
                                                onError={
                                                    (e) => {
                                                        e.currentTarget.src =
                                                            FOOD_IMAGES.default;
                                                    }
                                                }
                                            />

                                            <span
                                                className={
                                                    soldOut
                                                        ? "food-status sold"
                                                        : expired
                                                            ? "food-status expired"
                                                            : "food-status available"
                                                }
                                            >

                                                {soldOut
                                                    ? "SOLD OUT"
                                                    : expired
                                                        ? "EXPIRED"
                                                        : "AVAILABLE"}

                                            </span>

                                        </div>


                                        <div className="food-card-content">

                                            <div className="food-card-title">

                                                <div>

                                                    <span className="food-category">
                                                        {
                                                            food.category ||
                                                            "Food"
                                                        }
                                                    </span>

                                                    <h3>
                                                        {
                                                            food.name
                                                        }
                                                    </h3>

                                                </div>

                                            </div>


                                            <p className="food-description">

                                                {
                                                    food.description ||
                                                    "No description provided."
                                                }

                                            </p>


                                            <div className="food-info-grid">

                                                <div>

                                                    <small>
                                                        Quantity
                                                    </small>

                                                    <strong>
                                                        {
                                                            food.quantity
                                                        }
                                                    </strong>

                                                </div>


                                                <div>

                                                    <small>
                                                        Price
                                                    </small>

                                                    <strong>
                                                        ₹
                                                        {Number(
                                                            food.price ||
                                                            0
                                                        ).toFixed(2)}
                                                    </strong>

                                                </div>


                                                <div>

                                                    <small>
                                                        Rescue
                                                    </small>

                                                    <strong>

                                                        {
                                                            food.offerAvailable &&
                                                            food.offerPrice != null
                                                                ? `₹${Number(
                                                                    food.offerPrice
                                                                ).toFixed(2)}`
                                                                : "No offer"
                                                        }

                                                    </strong>

                                                </div>

                                            </div>


                                            <div className="food-expiry">

                                                <span>
                                                    ⏰
                                                </span>

                                                <div>

                                                    <small>
                                                        Expires
                                                    </small>

                                                    <strong
                                                        className={
                                                            expired
                                                                ? "expired-text"
                                                                : ""
                                                        }
                                                    >
                                                        {
                                                            formatDate(
                                                                food.expiryDate
                                                            )
                                                        }
                                                    </strong>

                                                </div>

                                            </div>


                                            <div className="food-pickup">

                                                <span>
                                                    📍
                                                </span>

                                                <p>
                                                    {
                                                        food.pickupAddress ||
                                                        "Pickup address not provided"
                                                    }
                                                </p>

                                            </div>


                                            <div className="food-card-actions">

                                                <button
                                                    type="button"
                                                    className="edit-food-btn"
                                                    onClick={() =>
                                                        openEditForm(
                                                            food
                                                        )
                                                    }
                                                    disabled={
                                                        saving
                                                    }
                                                >
                                                    ✏️ Edit
                                                </button>


                                                <button
                                                    type="button"
                                                    className="delete-food-btn"
                                                    onClick={() =>
                                                        handleDelete(
                                                            food.id
                                                        )
                                                    }
                                                    disabled={
                                                        deletingId ===
                                                            food.id ||
                                                        saving
                                                    }
                                                >

                                                    {
                                                        deletingId ===
                                                        food.id
                                                            ? "Deleting..."
                                                            : "🗑️ Delete"
                                                    }

                                                </button>

                                            </div>

                                        </div>

                                    </article>
                                );
                            })}

                    </div>
                )}

            </section>


            {/* =================================================
                ORDERS RECEIVED
            ================================================= */}

            <section className="donor-orders-section">

                <div className="orders-section-header">

                    <div>

                        <p className="listings-eyebrow">
                            CUSTOMER ORDERS
                        </p>

                        <h2>
                            Orders Received
                        </h2>

                        <p className="orders-section-subtitle">
                            Manage orders placed by customers
                            for your donated food.
                        </p>

                    </div>


                    <button
                        type="button"
                        className="refresh-orders-btn"
                        onClick={
                            loadDonorOrders
                        }
                        disabled={
                            ordersLoading
                        }
                    >

                        {ordersLoading
                            ? "Loading..."
                            : "↻ Refresh"}

                    </button>

                </div>


                {ordersLoading ? (

                    <div className="orders-loading-box">

                        <div className="donor-spinner"></div>

                        <p>
                            Loading received orders...
                        </p>

                    </div>

                ) : donorOrders.length === 0 ? (

                    <div className="donor-orders-empty">

                        <div className="orders-empty-icon">
                            📦
                        </div>

                        <h3>
                            No Orders Received Yet
                        </h3>

                        <p>
                            When customers order your
                            donated food, their orders
                            will appear here.
                        </p>

                        <Link
                            to="/menu"
                            className="view-food-orders-btn"
                        >
                            View Food Listings
                        </Link>

                    </div>

                ) : (

                    <div className="donor-orders-list">

                        {donorOrders.map(
                            (order) => {

                                const orderStatus =
                                    String(
                                        order.status ||
                                        "PLACED"
                                    ).toUpperCase();

                                const nextAction =
                                    getNextOrderAction(
                                        orderStatus
                                    );


                                return (

                                    <article
                                        className="donor-order-card"
                                        key={
                                            order.orderId
                                        }
                                    >

                                        {/* ORDER HEADER */}

                                        <div className="donor-order-top">

                                            <div>

                                                <span className="order-label">
                                                    ORDER
                                                </span>

                                                <h3>
                                                    #
                                                    {
                                                        order.orderId
                                                    }
                                                </h3>

                                            </div>


                                            <span
                                                className={`donor-order-status ${orderStatus.toLowerCase()}`}
                                            >
                                                {
                                                    getStatusLabel(
                                                        orderStatus
                                                    )
                                                }
                                            </span>

                                        </div>


                                        {/* ORDER DETAILS */}

                                        <div className="donor-order-details">

                                            <div className="donor-order-detail">

                                                <span>
                                                    👤
                                                </span>

                                                <div>

                                                    <small>
                                                        Customer
                                                    </small>

                                                    <strong>
                                                        Customer ID #
                                                        {
                                                            order.userId
                                                        }
                                                    </strong>

                                                </div>

                                            </div>


                                            <div className="donor-order-detail">

                                                <span>
                                                    📅
                                                </span>

                                                <div>

                                                    <small>
                                                        Order Date
                                                    </small>

                                                    <strong>
                                                        {
                                                            formatDate(
                                                                order.orderDate
                                                            )
                                                        }
                                                    </strong>

                                                </div>

                                            </div>


                                            <div className="donor-order-detail">

                                                <span>
                                                    💳
                                                </span>

                                                <div>

                                                    <small>
                                                        Payment
                                                    </small>

                                                    <strong>
                                                        {
                                                            order.paymentMethod ||
                                                            "N/A"
                                                        }
                                                    </strong>

                                                </div>

                                            </div>


                                            <div className="donor-order-detail">

                                                <span>
                                                    💰
                                                </span>

                                                <div>

                                                    <small>
                                                        Your Order Amount
                                                    </small>

                                                    <strong>
                                                        ₹
                                                        {Number(
                                                            order.donorTotal ||
                                                            0
                                                        ).toFixed(2)}
                                                    </strong>

                                                </div>

                                            </div>

                                        </div>


                                        {/* DELIVERY ADDRESS */}

                                        <div className="donor-order-address">

                                            <span>
                                                📍
                                            </span>

                                            <div>

                                                <small>
                                                    Delivery Address
                                                </small>

                                                <p>
                                                    {
                                                        order.deliveryAddress ||
                                                        "Address not available"
                                                    }
                                                </p>

                                            </div>

                                        </div>


                                        {/* FOOD ITEMS */}

                                        <div className="donor-order-items">

                                            <div className="donor-order-items-title">
                                                Food Ordered
                                            </div>


                                            {Array.isArray(
                                                order.items
                                            ) &&
                                                order.items.map(
                                                    (item) => (

                                                        <div
                                                            className="donor-order-item"
                                                            key={
                                                                item.id
                                                            }
                                                        >

                                                            <div>

                                                                <strong>
                                                                    {
                                                                        item.foodName
                                                                    }
                                                                </strong>

                                                                <span>
                                                                    Quantity:{" "}
                                                                    {
                                                                        item.quantity
                                                                    }
                                                                </span>

                                                            </div>


                                                            <div className="donor-order-item-price">

                                                                <span>
                                                                    ₹
                                                                    {Number(
                                                                        item.price ||
                                                                        0
                                                                    ).toFixed(2)}

                                                                    {" × "}

                                                                    {
                                                                        item.quantity
                                                                    }
                                                                </span>

                                                                <strong>
                                                                    ₹
                                                                    {Number(
                                                                        item.subtotal ||
                                                                        0
                                                                    ).toFixed(2)}
                                                                </strong>

                                                            </div>

                                                        </div>

                                                    )
                                                )}

                                        </div>


                                        {/* ORDER STATUS ACTION */}

                                        <div className="donor-order-management">

                                            <div>

                                                <small>
                                                    ORDER PROGRESS
                                                </small>

                                                <strong>
                                                    {
                                                        getStatusLabel(
                                                            orderStatus
                                                        )
                                                    }
                                                </strong>

                                            </div>


                                            {nextAction && (

                                                <button
                                                    type="button"
                                                    className="donor-order-update-btn"
                                                    onClick={() =>
                                                        updateOrderStatus(
                                                            order.orderId,
                                                            nextAction.nextStatus
                                                        )
                                                    }
                                                    disabled={
                                                        updatingOrderId ===
                                                        order.orderId
                                                    }
                                                >

                                                    {updatingOrderId ===
                                                    order.orderId
                                                        ? "Updating..."
                                                        : nextAction.label}

                                                </button>

                                            )}


                                            {(
                                                orderStatus !== "DELIVERED" &&
                                                orderStatus !== "CANCELLED"
                                            ) && (

                                                <button
                                                    type="button"
                                                    className="donor-order-cancel-btn"
                                                    onClick={() =>
                                                        updateOrderStatus(
                                                            order.orderId,
                                                            "CANCELLED"
                                                        )
                                                    }
                                                    disabled={
                                                        updatingOrderId ===
                                                        order.orderId
                                                    }
                                                >
                                                    Cancel Order
                                                </button>

                                            )}

                                        </div>


                                        {/* ORDER FOOTER */}

                                        <div className="donor-order-footer">

                                            <span>
                                                Customer order for
                                                your donated food
                                            </span>

                                            <strong>
                                                ₹
                                                {Number(
                                                    order.donorTotal ||
                                                    0
                                                ).toFixed(2)}
                                            </strong>

                                        </div>

                                    </article>

                                );
                            })}

                    </div>

                )}

            </section>

        </main>

    </div>
);

}

export default DonorDashboard;