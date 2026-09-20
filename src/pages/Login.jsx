import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/Auth.css";

function Login() {


const navigate = useNavigate();

const [loginType, setLoginType] = useState("USER");

const [formData, setFormData] = useState({
    email: "",
    password: ""
});

const [error, setError] = useState("");
const [loading, setLoading] = useState(false);

const handleChange = (e) => {
    setFormData({
        ...formData,
        [e.target.name]: e.target.value
    });

    setError("");
};

const handleLoginType = (type) => {
    setLoginType(type);
    setError("");
};

const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");

    if (!formData.email.trim() || !formData.password) {
        setError("Please enter your email and password.");
        return;
    }

    try {

        setLoading(true);

        const data = await api.login(formData);

        console.log("LOGIN RESPONSE:", data);

        if (!data || !data.token) {
            throw new Error("Invalid login response from server.");
        }

        /*
         * Normalize backend role.
         *
         * Supports:
         * USER
         * DONOR
         * ADMIN
         * ROLE_USER
         * ROLE_DONOR
         * ROLE_ADMIN
         */
        const role = String(data.role || "USER")
            .toUpperCase()
            .replace("ROLE_", "");

        console.log("Selected Login Type:", loginType);
        console.log("Backend Role:", role);

        /*
         * Check whether the selected login type
         * matches the actual account role.
         */

        if (loginType === "USER" && role !== "USER") {

            setError(
                "This account is not registered as a User account. Please select Login as Donor if this is a donor account."
            );

            return;
        }

        if (loginType === "DONOR" && role !== "DONOR") {

            setError(
                "This account is not registered as a Donor account. Please select Login as User if this is a user account."
            );

            return;
        }

        /*
         * Store login information only after
         * successful role verification.
         */

        localStorage.setItem("token", data.token);
        localStorage.setItem("role", role);

        if (data.userId !== undefined && data.userId !== null) {
            localStorage.setItem("userId", data.userId);
        }

        if (data.name) {
            localStorage.setItem("name", data.name);
        }

        if (data.email) {
            localStorage.setItem("email", data.email);
        }

        /*
         * Redirect according to account role.
         */

        if (role === "DONOR") {

            navigate("/donor", {
                replace: true
            });

        } else if (role === "USER") {

            navigate("/menu", {
                replace: true
            });

        } else if (role === "ADMIN") {

            navigate("/admin", {
                replace: true
            });

        } else {

            setError(
                "Unknown account role. Please contact the administrator."
            );

            localStorage.removeItem("token");
            localStorage.removeItem("role");
        }

    } catch (err) {

        console.error("LOGIN ERROR:", err);

        setError(
            err.message || "Invalid email or password."
        );

    } finally {

        setLoading(false);

    }
};

return (

    <div className="auth-page">

        {/* =================================================
            LEFT SECTION
           ================================================= */}

        <div className="auth-visual">

            <div className="auth-brand">

                <span className="brand-icon">
                    ♻
                </span>

                <span>
                    FoodRescue
                </span>

            </div>

            <div className="auth-visual-content">

                <span className="auth-label">
                    WELCOME BACK
                </span>

                <h1>
                    Give good food
                    <br />
                    another chance.
                </h1>

                <p>
                    Sign in to discover surplus food,
                    reduce waste, and make a positive
                    impact in your community.
                </p>

                <div className="auth-impact">

                    <div>
                        <strong>🌱</strong>
                        <span>
                            Reduce Food Waste
                        </span>
                    </div>

                    <div>
                        <strong>🤝</strong>
                        <span>
                            Support Communities
                        </span>
                    </div>

                    <div>
                        <strong>♻</strong>
                        <span>
                            Build a Better Future
                        </span>
                    </div>

                </div>

            </div>

        </div>


        {/* =================================================
            FORM SECTION
           ================================================= */}

        <div className="auth-form-section">

            <div className="auth-form-container">

                <Link
                    to="/"
                    className="auth-back"
                >
                    ← Back to Home
                </Link>


                <div className="auth-heading">

                    <span className="mobile-brand">
                        FoodRescue
                    </span>

                    <h2>
                        Welcome back
                    </h2>

                    <p>
                        Choose your account type and sign in.
                    </p>

                </div>


                {/* =================================================
                    LOGIN TYPE BUTTONS
                   ================================================= */}

                <div className="login-type-section">

                    <p className="login-type-label">
                        Login as
                    </p>

                    <div className="login-type-buttons">

                        <button
                            type="button"
                            className={`login-type-btn ${
                                loginType === "USER"
                                    ? "active"
                                    : ""
                            }`}
                            onClick={() =>
                                handleLoginType("USER")
                            }
                        >

                            <span className="login-type-icon">
                                👤
                            </span>

                            <span>
                                <strong>
                                    User
                                </strong>

                                <small>
                                    Browse & Rescue Food
                                </small>
                            </span>

                        </button>


                        <button
                            type="button"
                            className={`login-type-btn ${
                                loginType === "DONOR"
                                    ? "active"
                                    : ""
                            }`}
                            onClick={() =>
                                handleLoginType("DONOR")
                            }
                        >

                            <span className="login-type-icon">
                                🍱
                            </span>

                            <span>
                                <strong>
                                    Donor
                                </strong>

                                <small>
                                    Donate Surplus Food
                                </small>
                            </span>

                        </button>

                    </div>

                </div>


                {/* =================================================
                    ERROR
                   ================================================= */}

                {error && (

                    <div className="auth-error">
                        {error}
                    </div>

                )}


                {/* =================================================
                    LOGIN FORM
                   ================================================= */}

                <form
                    className="auth-form"
                    onSubmit={handleSubmit}
                >

                    <div className="form-group">

                        <label htmlFor="email">
                            Email Address
                        </label>

                        <input
                            id="email"
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            autoComplete="email"
                        />

                    </div>


                    <div className="form-group">

                        <label htmlFor="password">
                            Password
                        </label>

                        <input
                            id="password"
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            autoComplete="current-password"
                        />

                    </div>


                    <button
                        type="submit"
                        className="auth-submit"
                        disabled={loading}
                    >

                        {loading
                            ? "Signing in..."
                            : `Login as ${
                                loginType === "DONOR"
                                    ? "Donor"
                                    : "User"
                            } →`
                        }

                    </button>

                </form>


                {/* =================================================
                    REGISTER
                   ================================================= */}

                <div className="auth-divider">
                    <span>
                        New to FoodRescue?
                    </span>
                </div>


                <Link
                    to="/register"
                    className="auth-secondary-button"
                >
                    Create an Account
                </Link>


                <p className="auth-footer-text">

                    By continuing, you agree to help reduce
                    food waste and support your community.

                </p>

            </div>

        </div>

    </div>
);


}

export default Login;
