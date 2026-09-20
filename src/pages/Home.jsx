import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/Home.css";

function Home() {

    const [foodCount, setFoodCount] = useState(0);

    useEffect(() => {

        fetch("http://localhost:8080/api/food/available")
            .then(response => response.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setFoodCount(data.length);
                }
            })
            .catch(() => {
                setFoodCount(0);
            });

    }, []);

    return (
        <div className="home-page">

            {/* NAVBAR */}

            <nav className="home-navbar">

                <Link to="/" className="brand">
                    <span className="brand-icon">♻</span>
                    <span>Food<span>Rescue</span></span>
                </Link>

                <div className="nav-links">
                    <a href="#how-it-works">How It Works</a>
                    <a href="#impact">Our Impact</a>
                    <a href="#donate">Donate Food</a>

                    <Link
                        to="/login"
                        className="nav-login"
                    >
                        Login
                    </Link>

                    <Link
                        to="/register"
                        className="nav-register"
                    >
                        Get Started
                    </Link>
                </div>

            </nav>


            {/* HERO */}

            <section className="hero-section">

                <div className="hero-content">

                    <div className="hero-badge">
                        🌱 Fighting food waste, together
                    </div>

                    <h1>
                        Good food deserves
                        <span> another chance.</span>
                    </h1>

                    <p className="hero-description">
                        Every day, perfectly edible food is lost to
                        overproduction, unsold inventory and approaching
                        expiry dates. FoodRescue connects surplus food
                        with people and organizations who can put it
                        to good use.
                    </p>

                    <div className="hero-buttons">

                        <Link
                            to="/menu"
                            className="primary-button"
                        >
                            Explore Food
                            <span>→</span>
                        </Link>

                        <Link
                            to="/register"
                            className="secondary-button"
                        >
                            Become a Donor
                        </Link>

                    </div>

                    <div className="hero-trust">
                        <div className="trust-item">
                            <strong>♻</strong>
                            <span>Reduce waste</span>
                        </div>

                        <div className="trust-item">
                            <strong>♥</strong>
                            <span>Support communities</span>
                        </div>

                        <div className="trust-item">
                            <strong>🌎</strong>
                            <span>Protect our planet</span>
                        </div>
                    </div>

                </div>


                {/* HERO VISUAL */}

                <div className="hero-visual">

                    <div className="hero-circle"></div>

                    <div className="food-card main-food-card">

                        <div className="food-image">
                            🍛
                        </div>

                        <div className="food-card-info">
                            <span>Fresh surplus</span>
                            <h3>Veg Biryani</h3>
                            <p>Available for rescue</p>
                        </div>

                        <div className="food-price">
                            ₹90
                        </div>

                    </div>


                    <div className="floating-card rescued-card">

                        <div className="floating-icon">
                            ♻
                        </div>

                        <div>
                            <strong>{foodCount}+</strong>
                            <span>Food items available</span>
                        </div>

                    </div>


                    <div className="floating-card community-card">

                        <div className="community-avatars">
                            👩 👨 👩
                        </div>

                        <div>
                            <strong>Community</strong>
                            <span>making a difference</span>
                        </div>

                    </div>

                </div>

            </section>


            {/* STATS */}

            <section className="stats-section">

                <div className="stat">
                    <strong>{foodCount}+</strong>
                    <span>Food Items Listed</span>
                </div>

                <div className="stat">
                    <strong>5 km</strong>
                    <span>Rescue Radius</span>
                </div>

                <div className="stat">
                    <strong>24/7</strong>
                    <span>Community Access</span>
                </div>

                <div className="stat">
                    <strong>100%</strong>
                    <span>Community Driven</span>
                </div>

            </section>


            {/* PROBLEM */}

            <section className="problem-section">

                <div className="section-label">
                    THE PROBLEM
                </div>

                <h2>
                    Too much food is wasted.
                    <span> Too many people need it.</span>
                </h2>

                <p>
                    Restaurants, hotels, supermarkets, college canteens,
                    bakeries, events and households often have edible
                    food left over. Instead of letting that food go to
                    waste, FoodRescue creates a simple connection between
                    food donors and people who can use it.
                </p>

            </section>


            {/* HOW IT WORKS */}

            <section
                className="how-section"
                id="how-it-works"
            >

                <div className="section-heading">

                    <div className="section-label">
                        HOW IT WORKS
                    </div>

                    <h2>
                        From surplus to impact
                    </h2>

                    <p>
                        A simple platform designed to make food rescue
                        quick, transparent and accessible.
                    </p>

                </div>


                <div className="steps">

                    <div className="step-card">

                        <div className="step-number">
                            01
                        </div>

                        <div className="step-icon">
                            🏪
                        </div>

                        <h3>
                            Donors list food
                        </h3>

                        <p>
                            Restaurants, stores, canteens and households
                            can list safe surplus food with quantity,
                            expiry and pickup information.
                        </p>

                    </div>


                    <div className="step-card">

                        <div className="step-number">
                            02
                        </div>

                        <div className="step-icon">
                            🔎
                        </div>

                        <h3>
                            People discover
                        </h3>

                        <p>
                            Users browse available food, offers and
                            nearby rescue opportunities through the
                            platform.
                        </p>

                    </div>


                    <div className="step-card">

                        <div className="step-number">
                            03
                        </div>

                        <div className="step-icon">
                            🛒
                        </div>

                        <h3>
                            Rescue food
                        </h3>

                        <p>
                            Add available food to your cart and place
                            an order before the food reaches its expiry.
                        </p>

                    </div>


                    <div className="step-card">

                        <div className="step-number">
                            04
                        </div>

                        <div className="step-icon">
                            ❤️
                        </div>

                        <h3>
                            Create impact
                        </h3>

                        <p>
                            Good food gets a second chance while
                            communities benefit and unnecessary waste
                            is reduced.
                        </p>

                    </div>

                </div>

            </section>


            {/* IMPACT */}

            <section
                className="impact-section"
                id="impact"
            >

                <div className="impact-content">

                    <div className="section-label">
                        OUR MISSION
                    </div>

                    <h2>
                        Rescue food.
                        <br />
                        <span>Restore value.</span>
                    </h2>

                    <p>
                        FoodRescue brings technology and community
                        participation together to make surplus food
                        visible, accessible and useful instead of
                        wasted.
                    </p>

                    <Link
                        to="/register"
                        className="impact-button"
                    >
                        Join FoodRescue →
                    </Link>

                </div>


                <div className="impact-visual">

                    <div className="impact-main">
                        🌱
                    </div>

                    <div className="impact-small one">
                        🍎
                    </div>

                    <div className="impact-small two">
                        🥖
                    </div>

                    <div className="impact-small three">
                        🥗
                    </div>

                </div>

            </section>


            {/* DONOR CTA */}

            <section
                className="donor-section"
                id="donate"
            >

                <div>

                    <span className="cta-label">
                        HAVE SURPLUS FOOD?
                    </span>

                    <h2>
                        Turn excess into impact.
                    </h2>

                    <p>
                        Restaurants, bakeries, supermarkets, canteens,
                        event organizers and households can help rescue
                        edible food.
                    </p>

                </div>

                <Link
                    to="/register"
                    className="cta-button"
                >
                    Start Donating →
                </Link>

            </section>


            {/* FOOTER */}

            <footer className="home-footer">

                <div className="footer-brand">

                    <Link to="/" className="brand">
                        <span className="brand-icon">♻</span>
                        <span>Food<span>Rescue</span></span>
                    </Link>

                    <p>
                        Technology for a more sustainable food system.
                    </p>

                </div>

                <div className="footer-links">

                    <Link to="/menu">
                        Explore Food
                    </Link>

                    <Link to="/login">
                        Login
                    </Link>

                    <Link to="/register">
                        Register
                    </Link>

                </div>

                <div className="footer-copy">
                    © 2026 FoodRescue. Built to reduce food waste.
                </div>

            </footer>

        </div>
    );
}

export default Home;