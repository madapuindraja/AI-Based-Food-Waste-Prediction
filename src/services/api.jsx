const API_BASE_URL = "http://localhost:8080/api";

const parseResponse = async (response) => {

    const text = await response.text();

    if (!text) {
        return null;
    }

    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
};

export const api = {

    // =========================
    // AUTH
    // =========================

    register: async (userData) => {

        const response = await fetch(
            `${API_BASE_URL}/auth/register`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(userData)
            }
        );

        const data = await parseResponse(response);

        if (!response.ok) {

            throw new Error(
                typeof data === "string"
                    ? data
                    : data?.message || "Registration failed"
            );
        }

        return data;
    },


    login: async (loginData) => {

        const response = await fetch(
            `${API_BASE_URL}/auth/login`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(loginData)
            }
        );

        const data = await parseResponse(response);

        if (!response.ok) {

            throw new Error(
                typeof data === "string"
                    ? data
                    : data?.message || "Login failed"
            );
        }

        return data;
    },


    // =========================
    // FOOD
    // =========================

    getFood: async () => {

        const response = await fetch(
            `${API_BASE_URL}/food/available`
        );

        const data = await parseResponse(response);

        if (!response.ok) {

            throw new Error(
                typeof data === "string"
                    ? data
                    : "Failed to load food"
            );
        }

        return data;
    },


    getAllFood: async () => {

        const response = await fetch(
            `${API_BASE_URL}/food/all`
        );

        const data = await parseResponse(response);

        if (!response.ok) {

            throw new Error(
                typeof data === "string"
                    ? data
                    : "Failed to load food"
            );
        }

        return data;
    },


    getFoodById: async (id) => {

        const response = await fetch(
            `${API_BASE_URL}/food/${id}`
        );

        const data = await parseResponse(response);

        if (!response.ok) {

            throw new Error(
                typeof data === "string"
                    ? data
                    : "Food item not found"
            );
        }

        return data;
    },


    // =========================
    // USER
    // =========================

    getProfile: async (token) => {

        const response = await fetch(
            `${API_BASE_URL}/user/me`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await parseResponse(response);

        if (!response.ok) {

            throw new Error(
                typeof data === "string"
                    ? data
                    : "Failed to load profile"
            );
        }

        return data;
    },


    // =========================
    // CART
    // =========================

    getCart: async (token) => {

        const response = await fetch(
            `${API_BASE_URL}/cart`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await parseResponse(response);

        if (!response.ok) {

            throw new Error(
                typeof data === "string"
                    ? data
                    : "Failed to load cart"
            );
        }

        return data;
    },


    addToCart: async (
        token,
        foodItemId,
        quantity
    ) => {

        const response = await fetch(
            `${API_BASE_URL}/cart/add?foodItemId=${foodItemId}&quantity=${quantity}`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await parseResponse(response);

        if (!response.ok) {

            throw new Error(
                typeof data === "string"
                    ? data
                    : "Failed to add item"
            );
        }

        return data;
    },


    updateCart: async (
        token,
        foodItemId,
        quantity
    ) => {

        const response = await fetch(
            `${API_BASE_URL}/cart/update?foodItemId=${foodItemId}&quantity=${quantity}`,
            {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await parseResponse(response);

        if (!response.ok) {

            throw new Error(
                typeof data === "string"
                    ? data
                    : "Failed to update cart"
            );
        }

        return data;
    },


    removeFromCart: async (
        token,
        foodItemId
    ) => {

        const response = await fetch(
            `${API_BASE_URL}/cart/remove?foodItemId=${foodItemId}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await parseResponse(response);

        if (!response.ok) {

            throw new Error(
                typeof data === "string"
                    ? data
                    : "Failed to remove item"
            );
        }

        return data;
    },


    clearCart: async (token) => {

        const response = await fetch(
            `${API_BASE_URL}/cart/clear`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await parseResponse(response);

        if (!response.ok) {

            throw new Error(
                typeof data === "string"
                    ? data
                    : "Failed to clear cart"
            );
        }

        return data;
    },


    // =========================
    // ORDERS
    // =========================

    placeOrder: async (
        token,
        deliveryAddress,
        paymentMethod
    ) => {

        const response = await fetch(
            `${API_BASE_URL}/orders?deliveryAddress=${encodeURIComponent(deliveryAddress)}&paymentMethod=${encodeURIComponent(paymentMethod)}`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await parseResponse(response);

        if (!response.ok) {

            throw new Error(
                typeof data === "string"
                    ? data
                    : "Failed to place order"
            );
        }

        return data;
    },


    getMyOrders: async (token) => {

        const response = await fetch(
            `${API_BASE_URL}/orders/my`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json"
                }
            }
        );

        const data = await parseResponse(response);

        if (!response.ok) {

            throw new Error(
                typeof data === "string"
                    ? data
                    : "Failed to load orders"
            );
        }

        return Array.isArray(data)
            ? data
            : [];
    },


    cancelOrder: async (
        token,
        orderId
    ) => {

        const response = await fetch(
            `${API_BASE_URL}/orders/${orderId}/cancel`,
            {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await parseResponse(response);

        if (!response.ok) {

            throw new Error(
                typeof data === "string"
                    ? data
                    : "Failed to cancel order"
            );
        }

        return data;
    },


    // =========================
    // DONOR ORDERS
    // =========================

    getDonorOrders: async (token) => {

        const response = await fetch(
            `${API_BASE_URL}/donor/orders`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json"
                }
            }
        );

        const data = await parseResponse(response);

        if (!response.ok) {

            throw new Error(
                typeof data === "string"
                    ? data
                    : data?.message ||
                      "Failed to load received orders"
            );
        }

        return Array.isArray(data)
            ? data
            : [];
    }

};

export default api;
