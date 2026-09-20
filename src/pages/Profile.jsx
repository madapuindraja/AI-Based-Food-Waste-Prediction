import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/Profile.css";

function Profile() {
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);

    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        loadProfile();
    }, [token, navigate]);

    const loadProfile = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await api.getProfile(token);

            setProfile(data);

            setName(data.name || "");
            setPhone(data.phone || "");
            setAddress(data.address || "");

        } catch (err) {
            console.error("Profile loading error:", err);

            setError(
                err.message ||
                "Unable to load your profile."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        setError("");
        setSuccess("");
        setEditing(true);
    };

    const handleCancel = () => {
        setName(profile?.name || "");
        setPhone(profile?.phone || "");
        setAddress(profile?.address || "");

        setError("");
        setSuccess("");
        setEditing(false);
    };

    const handleSave = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            setError("Name is required.");
            return;
        }

        if (!phone.trim()) {
            setError("Phone number is required.");
            return;
        }

        if (!address.trim()) {
            setError("Address is required.");
            return;
        }

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const response = await fetch(
                "http://localhost:8080/api/user/me",
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        name: name.trim(),
                        phone: phone.trim(),
                        address: address.trim()
                    })
                }
            );

            const text = await response.text();

            let data;

            try {
                data = JSON.parse(text);
            } catch {
                data = text;
            }

            if (!response.ok) {
                throw new Error(
                    typeof data === "string"
                        ? data
                        : data?.message || "Profile update failed."
                );
            }

            setProfile(data);

            setName(data.name || "");
            setPhone(data.phone || "");
            setAddress(data.address || "");

            localStorage.setItem(
                "name",
                data.name || ""
            );

            setSuccess(
                "Your profile has been updated successfully."
            );

            setEditing(false);

        } catch (err) {
            console.error("Profile update error:", err);

            setError(
                err.message ||
                "Unable to update your profile."
            );
        } finally {
            setSaving(false);
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
            <div className="profile-page">
                <div className="profile-loading">
                    <div className="profile-spinner"></div>
                    <h3>Loading your profile...</h3>
                    <p>Please wait a moment.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">

            {/* NAVBAR */}

            <nav className="profile-navbar">

                <Link
                    to="/"
                    className="profile-logo"
                >
                    <span className="profile-logo-icon">
                        🍲
                    </span>

                    <span>
                        Food<span>Rescue</span>
                    </span>
                </Link>

                <div className="profile-nav-links">

                    <Link to="/menu">
                        Menu
                    </Link>

                    <Link to="/cart">
                        Cart
                    </Link>

                    <Link to="/orders">
                        Orders
                    </Link>

                    <Link
                        to="/profile"
                        className="active"
                    >
                        Profile
                    </Link>

                    <button
                        className="profile-logout-btn"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </div>

            </nav>


            {/* HEADER */}

            <section className="profile-header">

                <div>

                    <p className="profile-eyebrow">
                        ACCOUNT
                    </p>

                    <h1>
                        My <span>Profile</span>
                    </h1>

                    <p>
                        Manage your personal information and
                        delivery details.
                    </p>

                </div>

                <div className="profile-avatar">

                    {profile?.name
                        ? profile.name
                            .charAt(0)
                            .toUpperCase()
                        : "U"}

                </div>

            </section>


            {/* ALERTS */}

            {error && (
                <div className="profile-alert error-alert">

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

            {success && (
                <div className="profile-alert success-alert">

                    <span>✓</span>

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


            {/* PROFILE CONTENT */}

            <main className="profile-container">

                <section className="profile-card">

                    <div className="profile-card-header">

                        <div className="profile-title">

                            <div className="profile-title-icon">
                                👤
                            </div>

                            <div>

                                <h2>
                                    Personal Information
                                </h2>

                                <p>
                                    Your account details
                                </p>

                            </div>

                        </div>

                        {!editing && (
                            <button
                                className="edit-profile-btn"
                                onClick={handleEdit}
                            >
                                ✏️ Edit Profile
                            </button>
                        )}

                    </div>


                    {!editing ? (

                        <div className="profile-details">

                            <div className="profile-field">

                                <span className="field-icon">
                                    👤
                                </span>

                                <div>

                                    <small>
                                        Full Name
                                    </small>

                                    <strong>
                                        {profile?.name ||
                                            "Not provided"}
                                    </strong>

                                </div>

                            </div>


                            <div className="profile-field">

                                <span className="field-icon">
                                    📧
                                </span>

                                <div>

                                    <small>
                                        Email Address
                                    </small>

                                    <strong>
                                        {profile?.email ||
                                            "Not provided"}
                                    </strong>

                                </div>

                            </div>


                            <div className="profile-field">

                                <span className="field-icon">
                                    📱
                                </span>

                                <div>

                                    <small>
                                        Phone Number
                                    </small>

                                    <strong>
                                        {profile?.phone ||
                                            "Not provided"}
                                    </strong>

                                </div>

                            </div>


                            <div className="profile-field full-width">

                                <span className="field-icon">
                                    📍
                                </span>

                                <div>

                                    <small>
                                        Delivery Address
                                    </small>

                                    <strong>
                                        {profile?.address ||
                                            "Not provided"}
                                    </strong>

                                </div>

                            </div>


                            <div className="profile-field">

                                <span className="field-icon">
                                    🛡️
                                </span>

                                <div>

                                    <small>
                                        Account Role
                                    </small>

                                    <strong className="role-badge">
                                        {profile?.role ||
                                            "USER"}
                                    </strong>

                                </div>

                            </div>

                        </div>

                    ) : (

                        <form
                            className="profile-edit-form"
                            onSubmit={handleSave}
                        >

                            <div className="form-group">

                                <label>
                                    Full Name
                                </label>

                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) =>
                                        setName(e.target.value)
                                    }
                                    placeholder="Enter your name"
                                />

                            </div>


                            <div className="form-group">

                                <label>
                                    Email Address
                                </label>

                                <input
                                    type="email"
                                    value={profile?.email || ""}
                                    disabled
                                />

                                <small>
                                    Email cannot be changed.
                                </small>

                            </div>


                            <div className="form-group">

                                <label>
                                    Phone Number
                                </label>

                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) =>
                                        setPhone(e.target.value)
                                    }
                                    placeholder="Enter your phone number"
                                />

                            </div>


                            <div className="form-group full-width">

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

                            </div>


                            <div className="edit-actions">

                                <button
                                    type="button"
                                    className="cancel-edit-btn"
                                    onClick={handleCancel}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="save-profile-btn"
                                    disabled={saving}
                                >

                                    {saving ? (
                                        <>
                                            <span className="button-spinner"></span>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            ✓ Save Changes
                                        </>
                                    )}

                                </button>

                            </div>

                        </form>

                    )}

                </section>


                {/* QUICK ACTIONS */}

                <section className="profile-quick-section">

                    <h2>
                        Quick Actions
                    </h2>

                    <div className="quick-actions">

                        <Link
                            to="/orders"
                            className="quick-action-card"
                        >

                            <div className="quick-action-icon">
                                📦
                            </div>

                            <div>
                                <strong>
                                    My Orders
                                </strong>

                                <span>
                                    Track and manage your orders
                                </span>
                            </div>

                            <span className="quick-arrow">
                                →
                            </span>

                        </Link>


                        <Link
                            to="/menu"
                            className="quick-action-card"
                        >

                            <div className="quick-action-icon">
                                🍲
                            </div>

                            <div>
                                <strong>
                                    Browse Food
                                </strong>

                                <span>
                                    Discover available rescued food
                                </span>
                            </div>

                            <span className="quick-arrow">
                                →
                            </span>

                        </Link>


                        <Link
                            to="/cart"
                            className="quick-action-card"
                        >

                            <div className="quick-action-icon">
                                🛒
                            </div>

                            <div>
                                <strong>
                                    My Cart
                                </strong>

                                <span>
                                    Review your selected items
                                </span>
                            </div>

                            <span className="quick-arrow">
                                →
                            </span>

                        </Link>

                    </div>

                </section>

            </main>

        </div>
    );
}

export default Profile;
