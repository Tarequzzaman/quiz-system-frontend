import React, { useState } from "react";
import { Formik, Field, Form as FormikForm } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import quizgptLogin from "../assets/quizgpt-login-illustration.svg";
import { loginUser } from "../services/userService";

const ADMIN_EMAIL = "f.sanati@cqu.edu.au";

const LoginSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
});

const Login = () => {
    const navigate = useNavigate();
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [loginError, setLoginError] = useState("");
    const [showAccessModal, setShowAccessModal] = useState(false);

    const handleSubmit = async (values, { setSubmitting }) => {
        setLoginError("");
        const { email, password } = values;

        try {
            const response = await loginUser(email, password);

            // Persist session
            localStorage.setItem("access_token", response.access_token);
            localStorage.setItem("user", JSON.stringify(response.user));

            const role = (response.user?.role || "").toLowerCase();
            // Admin & Tutor -> /admin ; everyone else -> activation modal then home
            if (role === "admin" || role === "tutor") {
                localStorage.setItem("role", role);
                window.location.href = "/admin";
            } else {
                localStorage.setItem("role", "user");
                setShowAccessModal(true);
            }
        } catch (error) {
            const message = error?.message || "Invalid email or password";
            setLoginError(message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleAccessAcknowledge = () => {
        setShowAccessModal(false);
        navigate("/"); // redirect to Home
    };

    return (
        <div
            className="flex min-h-screen justify-center items-center bg-white px-6 relative"
            style={{ color: "var(--cqu-text)", fontFamily: "var(--cqu-font)" }}
        >
            <div className="flex flex-col md:flex-row items-center max-w-6xl w-full gap-24">
                {/* Left Section */}
                <div className="hidden md:flex flex-col items-center justify-center flex-1">
                    <div className="mb-6 text-center">
                        <h1 className="font-bold text-3xl tracking-wider" style={{ color: "var(--cqu-text)" }}>
                            Welcome to
                        </h1>
                        <h1 className="text-5xl font-extrabold tracking-wide" style={{ color: "var(--cqu-text)" }}>
                            QuizGPT
                        </h1>
                    </div>
                    <img src={quizgptLogin} alt="QuizGPT login" className="w-80 max-w-full" />
                </div>

                {/* Right Section */}
                <div className="w-full max-w-lg p-10 text-center rounded-2xl" style={{ backgroundColor: "#F7FAF9" }}>
                    <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--cqu-text)" }}>
                        Welcome Back
                    </h2>
                    <p className="mb-8 opacity-80">Sign in to continue your learning journey</p>

                    <Formik initialValues={{ email: "", password: "" }} validationSchema={LoginSchema} onSubmit={handleSubmit}>
                        {({ errors, touched, isSubmitting }) => (
                            <FormikForm className="space-y-6 text-left">
                                {/* Email Field */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Email</label>
                                    <Field
                                        type="email"
                                        name="email"
                                        placeholder="Enter your email"
                                        className="w-full p-3 border rounded focus:outline-none focus:ring-2"
                                        style={{
                                            borderColor: "rgba(31,64,64,0.25)",
                                            backgroundColor: "white",
                                            color: "var(--cqu-text)",
                                            focusRingColor: "var(--cqu-accent)",
                                        }}
                                    />
                                    {errors.email && touched.email && (
                                        <div className="text-sm mt-1" style={{ color: "#CC2B2B" }}>
                                            {errors.email}
                                        </div>
                                    )}
                                </div>

                                {/* Password Field */}
                                <div className="relative">
                                    <label className="block text-sm font-medium mb-1">Password</label>
                                    <Field
                                        type={passwordVisible ? "text" : "password"}
                                        name="password"
                                        placeholder="Enter your password"
                                        className="w-full p-3 border rounded focus:outline-none focus:ring-2"
                                        style={{
                                            borderColor: "rgba(31,64,64,0.25)",
                                            backgroundColor: "white",
                                            color: "var(--cqu-text)",
                                            focusRingColor: "var(--cqu-accent)",
                                        }}
                                    />
                                    <div
                                        className="absolute top-9 right-3 transform -translate-y-1/2 cursor-pointer opacity-70"
                                        onClick={() => setPasswordVisible(!passwordVisible)}
                                        style={{ color: "var(--cqu-text)" }}
                                    >
                                        {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                                    </div>
                                    {errors.password && touched.password && (
                                        <div className="text-sm mt-1" style={{ color: "#CC2B2B" }}>
                                            {errors.password}
                                        </div>
                                    )}
                                </div>

                                {/* Forgot Password */}
                                <div className="text-right">
                                    <Link to="/forgot-password" className="text-sm hover:underline" style={{ color: "var(--cqu-text)" }}>
                                        Forgot Password?
                                    </Link>
                                </div>

                                {/* Error Message */}
                                {loginError && (
                                    <div className="text-sm text-center" style={{ color: "#CC2B2B" }}>
                                        {loginError}
                                    </div>
                                )}

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-3 font-semibold rounded hover:opacity-90 transition"
                                    style={{
                                        backgroundColor: "var(--cqu-accent)",
                                        color: "var(--cqu-text)",
                                        opacity: isSubmitting ? 0.7 : 1,
                                    }}
                                >
                                    {isSubmitting ? "Signing in..." : "Sign In"}
                                </button>
                            </FormikForm>
                        )}
                    </Formik>

                    {/* Create Account */}
                    <p className="text-center text-sm mt-6 opacity-80">
                        Don’t have an account?{" "}
                        <Link to="/signup" className="font-medium hover:underline" style={{ color: "var(--cqu-text)" }}>
                            Register
                        </Link>
                    </p>
                </div>
            </div>

            {/* Access Modal for non-admin/non-tutor */}
            {showAccessModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div
                        className="bg-white rounded-xl shadow-xl w-full max-w-md p-6"
                        style={{ fontFamily: "var(--cqu-font)", color: "var(--cqu-text)" }}
                    >
                        <h3 className="text-2xl font-bold mb-3" style={{ color: "#003B71" }}>
                            Account Pending Alert
                        </h3>
                        <p className="mb-4">
                            Please contact your Administrator by email{" "}
                            <a href={`mailto:${ADMIN_EMAIL}`} className="underline font-medium" style={{ color: "#003B71" }}>
                                {ADMIN_EMAIL}
                            </a>{" "}
                            to activate your profile.
                        </p>
                        <div className="flex justify-end gap-3 mt-4">
                            <button
                                onClick={handleAccessAcknowledge}
                                className="px-4 py-2 rounded font-semibold"
                                style={{ backgroundColor: "#FFB81C", color: "#003B71" }}
                            >
                                Go to Home
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;
