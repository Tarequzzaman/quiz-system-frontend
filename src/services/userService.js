const API_BASE = import.meta.env.VITE_API_BASE || "/api";

const parseFastApiError = async (response) => {
    let data;
    try {
        data = await response.json();
    } catch {
        return `HTTP ${response.status}`;
    }
    if (Array.isArray(data.detail)) {
        const msg = data.detail
            .map((e) => {
                const field = Array.isArray(e.loc) ? e.loc.slice(1).join(".") : e.loc;
                return `${field}: ${e.msg}`;
            })
            .join("; ");
        return msg || "Validation error";
    }

    if (typeof data.detail === "string") {
        return data.detail;
    }
    return data.message || data.error || `HTTP ${response.status}`;
};

export const getUsers = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) throw new Error("Access token not found. Please log in.");

    const response = await fetch(`${API_BASE}/users`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
        const msg = await parseFastApiError(response);
        throw new Error(msg || "Failed to fetch users");
    }

    const data = await response.json();
    return data.map((user) => ({
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role,
        isActive: user.is_active,
    }));
};

export const registerUser = async (userData) => {
    const payload = {
        first_name: userData.firstName,
        last_name: userData.lastName,
        email: userData.email,
        password: userData.password,
    };

    const response = await fetch(`${API_BASE}/users`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const msg = await parseFastApiError(response);
        throw new Error(msg || "Failed to register user");
    }

    return response.json();
};

export const loginUser = async (email, password) => {
    try {
        const response = await fetch(`${API_BASE}/log_in`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                grant_type: "password",
                username: email,
                password: password,
                scope: "",
                client_id: "",
                client_secret: "",
            }),
        });

        const data = await response.json();
        if (!response.ok) {
            // surface FastAPI error detail if available
            const errMsg =
                data?.detail ||
                (Array.isArray(data?.detail)
                    ? data.detail.map((e) => `${e.loc?.join(".")}: ${e.msg}`).join("; ")
                    : "Invalid credentials");
            throw new Error(errMsg);
        }

        return data; // contains access_token etc.
    } catch (error) {
        throw error;
    }
};

export const updateUser = async (userId, updatedData) => {
    const token = localStorage.getItem("access_token");
    if (!token) throw new Error("Access token not found.");

    const response = await fetch(`${API_BASE}/users/${userId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            first_name: updatedData.firstName,
            last_name: updatedData.lastName,
            role: updatedData.role.toLowerCase(),
        }),
    });

    if (!response.ok) {
        const msg = await parseFastApiError(response);
        throw new Error(msg || "Failed to update user");
    }

    const data = await response.json();
    return {
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        role: data.role,
        isActive: data.is_active,
    };
};

export const deleteUser = async (userId) => {
    const token = localStorage.getItem("access_token");
    if (!token) throw new Error("Access token missing.");

    const response = await fetch(`${API_BASE}/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
        const msg = await parseFastApiError(response);
        throw new Error(msg || "Failed to delete user");
    }

    return true;
};

export const getUserSelectedTopics = async () => {
    const authToken = localStorage.getItem("access_token");

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.id) {
        throw new Error("User ID not found in localStorage.");
    }
    const userId = user.id;

    const response = await fetch(`${API_BASE}/users/${userId}/selected-topics`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
        },
    });

    if (!response.ok) {
        const msg = await parseFastApiError(response);
        throw new Error(msg || "Failed to fetch selected topics.");
    }

    return response.json();
};

// (Optional) Keep these only if you still use email code flow elsewhere
export const sendRegisterPasswordCode = async (email) => {
    const response = await fetch(`${API_BASE}/register/send-code`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({ email }),
    });

    if (!response.ok) {
        const msg = await parseFastApiError(response);
        throw new Error(msg || "Failed to send reset code.");
    }

    return response.json();
};

export const verifyRegisterPasswordCode = async (email, code) => {
    const response = await fetch(`${API_BASE}/register/verify-code`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({ email, code }),
    });

    if (!response.ok) {
        const msg = await parseFastApiError(response);
        throw new Error(msg || "Failed to verify code.");
    }

    return response.json();
};
