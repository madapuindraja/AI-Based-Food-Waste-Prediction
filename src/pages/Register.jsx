import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/Auth.css";

function Register() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        address: ""
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

        setError("");
        setSuccess("");
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");
        setSuccess("");

        if (
            !formData.name ||
            !formData.email ||
            !formData.password ||
            !formData.phone ||
            !formData.address
        ) {
            setError("Please fill in all fields.");
            return;
        }

        if (formData.password.length < 6) {
            setError(
                "Password must contain at least 6 characters."
            );
            return;
        }

        if (!/^\d{10}$/.test(formData.phone)) {
            setError(
                "Please enter a valid 10-digit phone number."
            );
            return;
        }

        try {

            setLoading(true);

            await api.register(formData);

            setSuccess(
                "Registration successful! Redirecting to login..."
            );

            setTimeout(() => {
                navigate("/login");
            }, 1200);

        } catch (err) {

            setError(
                err.message || "Registration failed."
            );

        } finally {

            setLoading(false);
        }
    };

    return (
        <div className="auth-page register-page">

            {/* Left Section */}
            <div className="auth-visual">

                <div className="auth-brand">
                    <span className="brand-icon">♻</span>
                    <span>FoodRescue</span>
                </div>

                <div className="auth-visual-content">

                    <span className="auth-label">
                        JOIN THE MOVEMENT
                    </span>

                    <h1>
                        Small actions.
                        <br />
                        Big impact.
                    </h1>

                    <p>
                        Join FoodRescue and help connect
                        surplus food with people who need it.
                        Every meal saved is a step toward
                        a more sustainable future.
                    </p>

                    <div className="auth-stat-card">

                        <div className="stat-icon">
                            ♻
                        </div>

                        <div>
                            <strong>Every meal matters</strong>
                            <span>
                                Together we can reduce
                                unnecessary food waste.
                            </span>
                        </div>

                    </div>

                </div>

            </div>


            {/* Form Section */}
            <div className="auth-form-section">

                <div className="auth-form-container register-container">

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

                        <h2>Create your account</h2>

                        <p>
                            Join the FoodRescue community today.
                        </p>

                    </div>


                    {error && (
                        <div className="auth-error">
                            {error}
                        </div>
                    )}


                    {success && (
                        <div className="auth-success">
                            {success}
                        </div>
                    )}


                    <form
                        className="auth-form"
                        onSubmit={handleSubmit}
                    >

                        <div className="form-row">

                            <div className="form-group">

                                <label htmlFor="name">
                                    Full Name
                                </label>

                                <input
                                    id="name"
                                    type="text"
                                    name="name"
                                    placeholder="Enter your name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    autoComplete="name"
                                />

                            </div>


                            <div className="form-group">

                                <label htmlFor="phone">
                                    Phone Number
                                </label>

                                <input
                                    id="phone"
                                    type="tel"
                                    name="phone"
                                    placeholder="10-digit phone number"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    maxLength="10"
                                    autoComplete="tel"
                                />

                            </div>

                        </div>


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
                                placeholder="Create a password"
                                value={formData.password}
                                onChange={handleChange}
                                autoComplete="new-password"
                            />

                        </div>


                        <div className="form-group">

                            <label htmlFor="address">
                                Address
                            </label>

                            <textarea
                                id="address"
                                name="address"
                                placeholder="Enter your complete address"
                                value={formData.address}
                                onChange={handleChange}
                                rows="3"
                            />

                        </div>


                        <button
                            type="submit"
                            className="auth-submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Creating Account..."
                                : "Create Account →"}
                        </button>

                    </form>


                    <div className="auth-login-link">

                        Already have an account?

                        <Link to="/login">
                            Sign in
                        </Link>

                    </div>


                    <p className="auth-footer-text">
                        Your account helps us create a community
                        where good food gets a second chance.
                    </p>

                </div>

            </div>

        </div>
    );
}

export default Register;