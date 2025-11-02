// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Users from "./pages/admin/User";
import UploadContent from "./pages/admin/UploadContent";
import QuizGenerate from "./pages/QuizGenerate";
import Quiz from "./pages/QuizIterate";

export default function App() {
    const userRole = localStorage.getItem("role"); // "admin" | "user" | null

    // Helper function to get user roles
    const getRoles = () => {
        const role = localStorage.getItem("role");
        return role ? [role] : [];
    };

    const RequireAdmin = ({ children }) => {
        const roles = getRoles();
        return roles.includes("admin") || roles.includes("tutor")
            ? children
            : <Navigate to="/login" replace />;
    };

    return (
        <Routes>
            {/* Mount layout on "/" and use an index child for Home */}
            <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/quiz_generate" element={<QuizGenerate />} />
                <Route path="/quizzes" element={<Quiz />} />

            </Route>

            <Route
                path="/admin"
                element={
                    userRole === "admin" ? (
                        <AdminLayout />
                    ) : (
                        <Navigate to="/login" replace />
                    )
                }
            >
                <Route index element={<Users />} />
                <Route path="users" element={<Users />} />
                <Route path="upload-content" element={<UploadContent />} />




            </Route>
            {/* 404 fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
