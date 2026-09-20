import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Menu from "./pages/Menu";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import DonorDashboard from "./pages/DonorDashboard";
import DonorProfile from "./pages/DonorProfile";
import AdminDashboard from "./pages/AdminDashboard";
import DonorOrders from "./pages/DonorOrders";


// ...
function UserRoute({ children }) {
const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token) {
    return <Navigate to="/login" replace />;
}

if (role === "DONOR") {
    return <Navigate to="/donor" replace />;
}

if (role === "ADMIN") {
    return <Navigate to="/admin" replace />;
}

return children;

}

function DonorRoute({ children }) {
const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token) {
    return <Navigate to="/login" replace />;
}

if (role === "USER") {
    return <Navigate to="/menu" replace />;
}

if (role === "ADMIN") {
    return <Navigate to="/admin" replace />;
}

return children;

}

function AdminRoute({ children }) {
const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (!token) {
    return <Navigate to="/login" replace />;
}

if (role === "USER") {
    return <Navigate to="/menu" replace />;
}

if (role === "DONOR") {
    return <Navigate to="/donor" replace />;
}

return children;

}

function App() {
return (
<BrowserRouter>
<Routes>

            {/* PUBLIC ROUTES */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* USER ROUTES */}
            <Route
                path="/menu"
                element={
                    <UserRoute>
                        <Menu />
                    </UserRoute>
                }
            />

            <Route
                path="/cart"
                element={
                    <UserRoute>
                        <Cart />
                    </UserRoute>
                }
            />

            <Route
                path="/checkout"
                element={
                    <UserRoute>
                        <Checkout />
                    </UserRoute>
                }
            />

            <Route
                path="/orders"
                element={
                    <UserRoute>
                        <Orders />
                    </UserRoute>
                }
            />

            <Route
                path="/profile"
                element={
                    <UserRoute>
                        <Profile />
                    </UserRoute>
                }
            />

            {/* DONOR ROUTES */}
            <Route
                path="/donor"
                element={
                    <DonorRoute>
                        <DonorDashboard />
                    </DonorRoute>
                }
            />

            <Route
                path="/donor/profile"
                element={
                    <DonorRoute>
                        <DonorProfile />
                    </DonorRoute>
                }
            />

            {/* ADMIN ROUTE */}
            <Route
                path="/admin"
                element={
                    <AdminRoute>
                        <AdminDashboard />
                    </AdminRoute>
                }
            />

            {/* FALLBACK */}
            <Route path="*" element={<Navigate to="/" replace />} />
<Route
path="/donor/orders"
element={
<DonorRoute>
<DonorOrders />
</DonorRoute>
}
/>
        </Routes>
    </BrowserRouter>
);

}

export default App;
