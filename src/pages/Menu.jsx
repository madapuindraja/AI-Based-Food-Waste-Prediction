
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/Menu.css";

function Menu() {
    const navigate = useNavigate();

    const [foodItems, setFoodItems] = useState([]);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [cartMessage, setCartMessage] = useState("");
    const [addingId, setAddingId] = useState(null);
    const [quantities, setQuantities] = useState({});

    const token = localStorage.getItem("token");
    const name = localStorage.getItem("name") || "User";

    /* =====================================================
       LOAD FOOD
    ===================================================== */

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        loadFood();
    }, [token, navigate]);

    const loadFood = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await api.getFood();

            setFoodItems(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Food loading error:", err);
            setError(err.message || "Unable to load food items.");
        } finally {
            setLoading(false);
        }
    };

    /* =====================================================
       CATEGORIES
    ===================================================== */

    const categories = useMemo(() => {
        const uniqueCategories = [
            ...new Set(
                foodItems
                    .map((item) => item.category)
                    .filter(Boolean)
            )
        ];

        return ["All", ...uniqueCategories];
    }, [foodItems]);

    /* =====================================================
       FILTER
    ===================================================== */

    const filteredFood = useMemo(() => {
        return foodItems.filter((item) => {
            const searchText = search.toLowerCase();

            const matchesSearch =
                item.name?.toLowerCase().includes(searchText) ||
                item.description?.toLowerCase().includes(searchText);

            const matchesCategory =
                category === "All" ||
                item.category === category;

            return matchesSearch && matchesCategory;
        });
    }, [foodItems, search, category]);

    /* =====================================================
       QUANTITY
    ===================================================== */

    const getQuantity = (id) => {
        return quantities[id] || 1;
    };

    const increaseQuantity = (id, maxQuantity) => {
        setQuantities((prev) => {
            const current = prev[id] || 1;

            if (current >= maxQuantity) {
                return prev;
            }

            return {
                ...prev,
                [id]: current + 1
            };
        });
    };

    const decreaseQuantity = (id) => {
        setQuantities((prev) => {
            const current = prev[id] || 1;

            if (current <= 1) {
                return prev;
            }

            return {
                ...prev,
                [id]: current - 1
            };
        });
    };

    /* =====================================================
       ADD TO CART
    ===================================================== */

    const handleAddToCart = async (food) => {
        const currentToken = localStorage.getItem("token");

        console.log("========== ADD TO CART ==========");
        console.log("Food:", food);
        console.log("Food ID:", food.id);
        console.log("Quantity:", getQuantity(food.id));
        console.log("Token exists:", !!currentToken);
        console.log("=================================");

        if (!currentToken) {
            navigate("/login");
            return;
        }

        if (!food.id) {
            setCartMessage("Food ID is missing.");
            return;
        }

        if (!food.quantity || food.quantity <= 0) {
            setCartMessage("This food item is currently unavailable.");
            return;
        }

        try {
            setAddingId(food.id);
            setCartMessage("");

            const quantity = getQuantity(food.id);

            const result = await api.addToCart(
                currentToken,
                Number(food.id),
                Number(quantity)
            );

            console.log("Add cart response:", result);

            setCartMessage(
                `✓ ${food.name} added to your cart!`
            );

            // Reset selected quantity after successful add
            setQuantities((prev) => ({
                ...prev,
                [food.id]: 1
            }));

            setTimeout(() => {
                setCartMessage("");
            }, 3000);

        } catch (err) {
            console.error("ADD TO CART ERROR:", err);

            let message = err.message || "Unable to add item to cart.";

            if (
                message.toLowerCase().includes("failed to fetch")
            ) {
                message =
                    "Cannot connect to the backend. Make sure Spring Boot is running on port 8080.";
            }

            if (
                message.includes("401") ||
                message.toLowerCase().includes("unauthorized")
            ) {
                localStorage.clear();
                navigate("/login");
                return;
            }

            setCartMessage(`⚠ ${message}`);

            setTimeout(() => {
                setCartMessage("");
            }, 5000);

        } finally {
            setAddingId(null);
        }
    };

    /* =====================================================
       LOGOUT
    ===================================================== */

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("userId");
        localStorage.removeItem("name");
        localStorage.removeItem("email");

        navigate("/");
    };

    /* =====================================================
       PRICE
    ===================================================== */

    const getDisplayPrice = (food) => {
        if (
            food.offerAvailable &&
            Number(food.offerPrice) > 0
        ) {
            return Number(food.offerPrice);
        }

        return Number(food.price || 0);
    };

    /* =====================================================
       EXPIRY
    ===================================================== */

    const formatExpiry = (expiryDate) => {
        if (!expiryDate) {
            return "Expiry not available";
        }

        const date = new Date(expiryDate);

        if (Number.isNaN(date.getTime())) {
            return "Expiry not available";
        }

        return date.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    /* =====================================================
       JSX
    ===================================================== */

    return (
        <div className="menu-page">

            {/* ================= NAVBAR ================= */}

            <header className="menu-navbar">

                <Link
                    to="/menu"
                    className="menu-brand"
                >
                    <span className="menu-brand-icon">
                        ♻
                    </span>

                    <span>
                        Food<span>Rescue</span>
                    </span>
                </Link>

                <nav className="menu-nav-links">

                    <Link
                        to="/menu"
                        className="active"
                    >
                        Discover
                    </Link>

                    <Link to="/orders">
                        My Orders
                    </Link>

                    <Link to="/profile">
                        Profile
                    </Link>

                </nav>

                <div className="menu-nav-actions">

                    <Link
                        to="/cart"
                        className="cart-button"
                    >
                        <span>🛒</span>
                        Cart
                    </Link>

                    <div className="user-menu">

                        <div className="user-avatar">
                            {name.charAt(0).toUpperCase()}
                        </div>

                        <span className="user-name">
                            {name}
                        </span>

                    </div>

                    <button
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </div>

            </header>

            {/* ================= HERO ================= */}

            <section className="menu-hero">

                <div className="menu-hero-content">

                    <span className="menu-eyebrow">
                        SAVE FOOD • SAVE MONEY • MAKE AN IMPACT
                    </span>

                    <h1>
                        Good food deserves
                        <br />
                        <span>another chance.</span>
                    </h1>

                    <p>
                        Discover quality surplus food from local
                        donors before it goes to waste.
                    </p>

                </div>

                <div className="hero-food-visual">

                    <div className="floating-food food-one">
                        🍛
                    </div>

                    <div className="floating-food food-two">
                        🥗
                    </div>

                    <div className="floating-food food-three">
                        🍞
                    </div>

                    <div className="hero-circle">
                        ♻
                    </div>

                </div>

            </section>

            {/* ================= SEARCH ================= */}

            <section className="menu-controls">

                <div className="search-box">

                    <span className="search-icon">
                        🔍
                    </span>

                    <input
                        type="text"
                        placeholder="Search food..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                    />

                    {search && (
                        <button
                            className="clear-search"
                            onClick={() => setSearch("")}
                        >
                            ×
                        </button>
                    )}

                </div>

                <div className="category-list">

                    {categories.map((item) => (
                        <button
                            key={item}
                            className={
                                category === item
                                    ? "category-button active"
                                    : "category-button"
                            }
                            onClick={() =>
                                setCategory(item)
                            }
                        >
                            {item}
                        </button>
                    ))}

                </div>

            </section>

            {/* ================= MAIN ================= */}

            <main className="menu-content">

                <div className="menu-heading-row">

                    <div>

                        <span className="section-label">
                            TODAY'S RESCUES
                        </span>

                        <h2>
                            Available food
                        </h2>

                    </div>

                    <span className="food-count">
                        {filteredFood.length} items
                    </span>

                </div>

                {/* ================= CART MESSAGE ================= */}

                {cartMessage && (
                    <div className="cart-toast">
                        <span>
                            {cartMessage.startsWith("⚠")
                                ? "⚠"
                                : "✓"}
                        </span>

                        {cartMessage
                            .replace("⚠", "")
                            .replace("✓", "")
                            .trim()}
                    </div>
                )}

                {/* ================= ERROR ================= */}

                {error && (
                    <div className="menu-error">

                        <span>⚠</span>

                        <div>

                            <strong>
                                Something went wrong
                            </strong>

                            <p>
                                {error}
                            </p>

                            <button
                                onClick={loadFood}
                            >
                                Try Again
                            </button>

                        </div>

                    </div>
                )}

                {/* ================= LOADING ================= */}

                {loading && (
                    <div className="food-grid">

                        {[1, 2, 3, 4, 5, 6].map(
                            (item) => (
                                <div
                                    className="food-card skeleton-card"
                                    key={item}
                                >

                                    <div className="skeleton image-skeleton"></div>

                                    <div className="food-card-body">

                                        <div className="skeleton text-skeleton"></div>

                                        <div className="skeleton small-skeleton"></div>

                                        <div className="skeleton price-skeleton"></div>

                                    </div>

                                </div>
                            )
                        )}

                    </div>
                )}

                {/* ================= FOOD ================= */}

                {!loading && !error && (
                    <>
                        {filteredFood.length === 0 ? (
                            <div className="empty-food">

                                <div className="empty-icon">
                                    🍽️
                                </div>

                                <h3>
                                    No food found
                                </h3>

                                <p>
                                    Try another search or category.
                                </p>

                                <button
                                    onClick={() => {
                                        setSearch("");
                                        setCategory("All");
                                    }}
                                >
                                    View All Food
                                </button>

                            </div>
                        ) : (
                            <div className="food-grid">

                                {filteredFood.map((food) => {

                                    const displayPrice =
                                        getDisplayPrice(food);

                                    const hasOffer =
                                        food.offerAvailable &&
                                        Number(food.offerPrice) > 0 &&
                                        Number(food.offerPrice) <
                                            Number(food.price);

                                    const isAdding =
                                        addingId === food.id;

                                    return (
                                        <article
                                            className="food-card"
                                            key={food.id}
                                        >

                                            {/* IMAGE */}

                                            <div className="food-image">

                                                {food.imageUrl ? (
                                                    <img
                                                        src={food.imageUrl}
                                                        alt={food.name}
                                                        onError={(e) => {
                                                            e.currentTarget.style.display =
                                                                "none";

                                                            const placeholder =
                                                                e.currentTarget
                                                                    .parentElement
                                                                    .querySelector(
                                                                        ".food-image-placeholder"
                                                                    );

                                                            if (placeholder) {
                                                                placeholder.style.display =
                                                                    "flex";
                                                            }
                                                        }}
                                                    />
                                                ) : null}

                                                <div
                                                    className="food-image-placeholder"
                                                    style={{
                                                        display:
                                                            food.imageUrl
                                                                ? "none"
                                                                : "flex"
                                                    }}
                                                >
                                                    🍲
                                                </div>

                                                {hasOffer && (
                                                    <span className="offer-badge">
                                                        OFFER
                                                    </span>
                                                )}

                                                <span className="category-badge">
                                                    {food.category}
                                                </span>

                                            </div>

                                            {/* BODY */}

                                            <div className="food-card-body">

                                                <div className="food-title-row">

                                                    <h3>
                                                        {food.name}
                                                    </h3>

                                                    <span className="available-dot">
                                                        ●
                                                    </span>

                                                </div>

                                                <p className="food-description">
                                                    {food.description ||
                                                        "Fresh surplus food available for rescue."}
                                                </p>

                                                <div className="food-meta">

                                                    <span>
                                                        📦 {food.quantity} available
                                                    </span>

                                                    <span>
                                                        ⏰ {formatExpiry(food.expiryDate)}
                                                    </span>

                                                </div>

                                                <div className="donor-info">

                                                    <span className="donor-icon">
                                                        🤝
                                                    </span>

                                                    <div>

                                                        <small>
                                                            Donated by
                                                        </small>

                                                        <strong>
                                                            {food.donorName ||
                                                                "Local donor"}
                                                        </strong>

                                                    </div>

                                                </div>

                                                <div className="food-bottom">

                                                    <div className="price-area">

                                                        <span className="price">
                                                            ₹
                                                            {displayPrice.toFixed(
                                                                2
                                                            )}
                                                        </span>

                                                        {hasOffer && (
                                                            <span className="old-price">
                                                                ₹
                                                                {Number(
                                                                    food.price
                                                                ).toFixed(2)}
                                                            </span>
                                                        )}

                                                    </div>

                                                    <div className="quantity-control">

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                decreaseQuantity(
                                                                    food.id
                                                                )
                                                            }
                                                            disabled={
                                                                isAdding
                                                            }
                                                        >
                                                            −
                                                        </button>

                                                        <span>
                                                            {getQuantity(
                                                                food.id
                                                            )}
                                                        </span>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                increaseQuantity(
                                                                    food.id,
                                                                    Number(
                                                                        food.quantity
                                                                    )
                                                                )
                                                            }
                                                            disabled={
                                                                isAdding ||
                                                                getQuantity(
                                                                    food.id
                                                                ) >=
                                                                    Number(
                                                                        food.quantity
                                                                    )
                                                            }
                                                        >
                                                            +
                                                        </button>

                                                    </div>

                                                </div>

                                                {/* ADD CART */}

                                                <button
                                                    type="button"
                                                    className="add-cart-button"
                                                    onClick={() =>
                                                        handleAddToCart(
                                                            food
                                                        )
                                                    }
                                                    disabled={isAdding}
                                                >

                                                    <span>
                                                        {isAdding
                                                            ? "⏳"
                                                            : "🛒"}
                                                    </span>

                                                    {isAdding
                                                        ? "Adding..."
                                                        : "Add to Cart"}

                                                </button>

                                            </div>

                                        </article>
                                    );
                                })}

                            </div>
                        )}
                    </>
                )}

            </main>

            {/* ================= IMPACT ================= */}

            <section className="menu-impact">

                <div className="impact-content">

                    <div className="impact-icon">
                        ♻
                    </div>

                    <div>

                        <strong>
                            Your order makes an impact
                        </strong>

                        <span>
                            Every rescued meal helps keep good food
                            out of the waste stream.
                        </span>

                    </div>

                </div>

                <Link
                    to="/profile"
                    className="impact-link"
                >
                    View your impact →
                </Link>

            </section>

            {/* ================= FOOTER ================= */}

            <footer className="menu-footer">

                <div>

                    <strong>
                        FoodRescue
                    </strong>

                    <span>
                        Give good food another chance.
                    </span>

                </div>

                <span>
                    © 2026 FoodRescue
                </span>

            </footer>

        </div>
    );
}

export default Menu;

