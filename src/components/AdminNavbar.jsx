import React from "react";
import { useNavigate } from "react-router-dom";

const AdminNavbar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        localStorage.removeItem("role");

        navigate("/login");
    };

    return (
        <header className="bg-white shadow-md px-8 py-4 flex justify-between items-center">
            {/* Brand */}
            <h1 className="text-xl font-bold text-indigo-600 tracking-wide">
                <span className="text-gray-700">Admin Dashboard</span>
            </h1>

            {/* Logout Button */}
            <button
                onClick={handleLogout}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition font-medium"
            >
                Logout
            </button>
        </header>
    );
};

export default AdminNavbar;
