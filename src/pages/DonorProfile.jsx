import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/DonorProfile.css";

const API_BASE_URL = "http://localhost:8080/api";

function DonorProfile() {
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

useEffect(() => {
    const token = localStorage.getItem("token");

    const storedRole = (
        localStorage.getItem("role") || ""
    )
        .replace("ROLE_", "")
        .trim()
        .toUpperCase();

    console.log("Donor Profile Token:", !!token);
    console.log("Donor Profile Role:", storedRole);

    if (!token) {
        navigate("/login", { replace: true });
        return;
    }

    if (storedRole !== "DONOR") {
        console.log(
            "Invalid donor role. Current role:",
            storedRole
        );

        navigate("/menu", { replace: true });
        return;
    }

    loadProfile(token);
}, [navigate]);

const loadProfile = async (token) => {
    try {
        setLoading(true);
        setError("");

        const response = await fetch(
            `${API_BASE_URL}/user/me`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json"
                }
            }
        );

        const text = await response.text();

        let data;

        try {
            data = text ? JSON.parse(text) : {};
        } catch {
            data = text;
        }

        if (!response.ok) {
            throw new Error(
                typeof data === "string"
                    ? data
                    : data?.message ||
                      "Unable to load donor profile."
            );
        }

        setProfile(data);

        setName(data?.name || "");
        setPhone(data?.phone || "");
        setAddress(data?.address || "");

        if (data?.name) {
            localStorage.setItem("name", data.name);
        }

        if (data?.email) {
            localStorage.setItem("email", data.email);
        }

    } catch (err) {
        console.error(
            "Donor profile loading error:",
            err
        );

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

    const token = localStorage.getItem("token");

    if (!token) {
        navigate("/login", { replace: true });
        return;
    }

    if (!name.trim()) {
        setError("Donor name is required.");
        return;
    }

    if (!phone.trim()) {
        setError("Phone number is required.");
        return;
    }

    if (!address.trim()) {
        setError("Pickup address is required.");
        return;
    }

    try {
        setSaving(true);
        setError("");
        setSuccess("");

        const response = await fetch(
            `${API_BASE_URL}/user/me`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json"
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
            data = text ? JSON.parse(text) : {};
        } catch {
            data = text;
        }

        if (!response.ok) {
            throw new Error(
                typeof data === "string"
                    ? data
                    : data?.message ||
                      "Profile update failed."
            );
        }

        setProfile(data);

        setName(data?.name || "");
        setPhone(data?.phone || "");
        setAddress(data?.address || "");

        localStorage.setItem(
            "name",
            data?.name || ""
        );

        if (data?.email) {
            localStorage.setItem(
                "email",
                data.email
            );
        }

        setSuccess(
            "Donor profile updated successfully."
        );

        setEditing(false);

    } catch (err) {
        console.error(
            "Donor profile update error:",
            err
        );

        setError(
            err.message ||
            "Unable to update donor profile."
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

    navigate("/login", { replace: true });
};

if (loading) {
    return (
        <div className="donor-profile-page">

            <div className="donor-profile-loading">

                <div className="donor-profile-spinner"></div>

                <h3>
                    Loading donor profile...
                </h3>

                <p>
                    Please wait a moment.
                </p>

            </div>

        </div>
    );
}

return (
    <div className="donor-profile-page">

        {/* NAVBAR */}

        <nav className="donor-profile-navbar">

            <Link
                to="/"
                className="donor-profile-logo"
            >
                <span className="donor-profile-logo-icon">
                    🍲
                </span>

                <span>
                    Food<span>Rescue</span>
                </span>
            </Link>

            <div className="donor-profile-nav">

                <Link to="/">
                    Home
                </Link>

                <Link to="/donor">
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

                <Link
                    to="/donor/profile"
                    className="active"
                >
                    Profile
                </Link>

                <button
                    onClick={handleLogout}
                    className="donor-profile-logout"
                >
                    Logout
                </button>

            </div>

        </nav>


        {/* HERO */}

        <section className="donor-profile-hero">

            <div>

                <p className="donor-profile-eyebrow">
                    DONOR ACCOUNT
                </p>

                <h1>
                    Donor <span>Profile</span>
                </h1>

                <p>
                    Manage your donor information,
                    contact details and pickup address.
                </p>

            </div>

            <div className="donor-profile-avatar">

                {profile?.name
                    ? profile.name
                        .charAt(0)
                        .toUpperCase()
                    : "D"}

            </div>

        </section>


        {/* ALERTS */}

        {error && (
            <div className="donor-profile-alert donor-error">

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
            <div className="donor-profile-alert donor-success">

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


        <main className="donor-profile-container">

            {/* PROFILE CARD */}

            <section className="donor-profile-card">

                <div className="donor-profile-card-header">

                    <div className="donor-profile-title">

                        <div className="donor-profile-title-icon">
                            👤
                        </div>

                        <div>

                            <h2>
                                Donor Information
                            </h2>

                            <p>
                                Your account and contact details
                            </p>

                        </div>

                    </div>

                    {!editing && (
                        <button
                            className="donor-edit-btn"
                            onClick={handleEdit}
                        >
                            ✏️ Edit Profile
                        </button>
                    )}

                </div>


                {!editing ? (

                    <div className="donor-profile-details">

                        <div className="donor-profile-field">

                            <span>
                                👤
                            </span>

                            <div>

                                <small>
                                    Donor Name
                                </small>

                                <strong>
                                    {profile?.name ||
                                        "Not provided"}
                                </strong>

                            </div>

                        </div>


                        <div className="donor-profile-field">

                            <span>
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


                        <div className="donor-profile-field">

                            <span>
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


                        <div className="donor-profile-field">

                            <span>
                                🛡️
                            </span>

                            <div>

                                <small>
                                    Account Role
                                </small>

                                <strong className="donor-role-badge">
                                    DONOR
                                </strong>

                            </div>

                        </div>


                        <div className="donor-profile-field donor-address-field">

                            <span>
                                📍
                            </span>

                            <div>

                                <small>
                                    Pickup Address
                                </small>

                                <strong>
                                    {profile?.address ||
                                        "Not provided"}
                                </strong>

                            </div>

                        </div>

                    </div>

                ) : (

                    <form
                        className="donor-profile-edit-form"
                        onSubmit={handleSave}
                    >

                        <div className="donor-form-group">

                            <label>
                                Donor Name
                            </label>

                            <input
                                type="text"
                                value={name}
                                onChange={(e) =>
                                    setName(e.target.value)
                                }
                                placeholder="Enter donor name"
                            />

                        </div>


                        <div className="donor-form-group">

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


                        <div className="donor-form-group">

                            <label>
                                Phone Number
                            </label>

                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) =>
                                    setPhone(e.target.value)
                                }
                                placeholder="Enter phone number"
                            />

                        </div>


                        <div className="donor-form-group donor-full-width">

                            <label>
                                Pickup Address
                            </label>

                            <textarea
                                value={address}
                                onChange={(e) =>
                                    setAddress(e.target.value)
                                }
                                placeholder="Enter the address where food can be picked up"
                                rows="4"
                            />

                        </div>


                        <div className="donor-edit-actions">

                            <button
                                type="button"
                                className="donor-cancel-btn"
                                onClick={handleCancel}
                                disabled={saving}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="donor-save-btn"
                                disabled={saving}
                            >

                                {saving ? (
                                    <>
                                        <span className="donor-button-spinner"></span>
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


            {/* DONOR ACTIONS */}

            <section className="donor-profile-actions-section">

                <div className="donor-section-heading">

                    <div>

                        <p>
                            DONOR TOOLS
                        </p>

                        <h2>
                            Quick Actions
                        </h2>

                    </div>

                </div>


                <div className="donor-profile-actions">

                    <Link
                        to="/donor"
                        className="donor-action-card"
                    >

                        <div className="donor-action-icon dashboard-icon">
                            📊
                        </div>

                        <div>
                            <strong>
                                Donor Dashboard
                            </strong>

                            <span>
                                Manage your food listings
                                and received orders
                            </span>
                        </div>

                        <b>
                            →
                        </b>

                    </Link>


                    <Link
                        to="/donor"
                        className="donor-action-card"
                    >

                        <div className="donor-action-icon food-icon">
                            🍱
                        </div>

                        <div>
                            <strong>
                                Manage Food
                            </strong>

                            <span>
                                Add, edit and manage
                                your donated food
                            </span>
                        </div>

                        <b>
                            →
                        </b>

                    </Link>


                    <Link
                        to="/menu"
                        className="donor-action-card"
                    >

                        <div className="donor-action-icon browse-icon">
                            🔎
                        </div>

                        <div>
                            <strong>
                                Browse Food
                            </strong>

                            <span>
                                Order food from other donors
                            </span>
                        </div>

                        <b>
                            →
                        </b>

                    </Link>


                    <Link
                        to="/orders"
                        className="donor-action-card"
                    >

                        <div className="donor-action-icon order-icon">
                            📦
                        </div>

                        <div>
                            <strong>
                                My Orders
                            </strong>

                            <span>
                                Track food you ordered
                            </span>
                        </div>

                        <b>
                            →
                        </b>

                    </Link>

                </div>

            </section>

        </main>

    </div>
);


}

export default DonorProfile;
