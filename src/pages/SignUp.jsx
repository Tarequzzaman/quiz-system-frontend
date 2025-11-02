import React, { useState, useEffect } from "react";
import { Formik, Field, Form as FormikForm } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import quizgptSignup from "../assets/quizgpt-signup-illustration.svg";
import { registerUser } from "../services/userService";

const ADMIN_EMAIL = "f.sanati@cqu.edu.au";

const SignUpSchema = Yup.object().shape({
    firstName: Yup.string().required("First name is required"),
    lastName: Yup.string().required("Last name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref("password"), null], "Passwords must match")
        .required("Confirm password is required"),
});

const SignUp = () => {
    const navigate = useNavigate();
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const handleSubmit = async (values) => {
        try {
            setLoading(true);

            // ✅ Send required snake_case fields to FastAPI /users
            await registerUser({
                firstName: values.firstName,
                lastName: values.lastName,
                email: values.email,
                password: values.password,
            });

            setShowSuccessModal(true); // show activation instructions
            setError(null);
        } catch (err) {
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Auto-dismiss small toasts
    useEffect(() => {
        if (!message && !error) return;
        const t = setTimeout(() => {
            setMessage(null);
            setError(null);
        }, 2500);
        return () => clearTimeout(t);
    }, [message, error]);

    const goHome = () => {
        setShowSuccessModal(false);
        navigate("/"); // redirect to Home after acknowledging
    };

    return (
        <div
            className="flex min-h-screen items-center justify-center bg-white px-6 py-12 relative"
            style={{ fontFamily: "var(--cqu-font)", color: "var(--cqu-text)" }}
        >
            {/* Alerts */}
            {error && (
                <div className="absolute top-6 bg-red-100 text-red-700 px-4 py-2 rounded shadow">
                    😔 {error}
                </div>
            )}
            {message && (
                <div className="absolute top-6 bg-green-100 text-green-700 px-4 py-2 rounded shadow">
                    🎉 {message}
                </div>
            )}

            <div className="flex flex-col lg:flex-row items-center max-w-6xl w-full gap-16">
                {/* Illustration */}
                <div className="hidden lg:flex flex-col items-center justify-center w-1/2">
                    <img
                        src={quizgptSignup}
                        alt="QuizGPT sign up"
                        className="max-h-[480px] w-auto object-contain"
                    />
                </div>

                {/* Form */}
                <div className="w-full max-w-lg p-10 rounded-2xl" style={{ backgroundColor: "#F7FAF9" }}>
                    <h2 className="text-3xl font-bold mb-6 text-center" style={{ color: "var(--cqu-text)" }}>
                        Create a New Account
                    </h2>

                    <Formik
                        initialValues={{
                            firstName: "",
                            lastName: "",
                            email: "",
                            password: "",
                            confirmPassword: "",
                        }}
                        validationSchema={SignUpSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ errors, touched }) => (
                            <FormikForm className="space-y-6 text-left">
                                {/* Name */}
                                <div className="flex gap-4">
                                    <div className="w-1/2">
                                        <Field
                                            name="firstName"
                                            placeholder="First Name"
                                            className="w-full p-3 border rounded bg-white focus:outline-none focus:ring-2"
                                            style={{ borderColor: "rgba(31,64,64,0.25)" }}
                                        />
                                        {errors.firstName && touched.firstName && (
                                            <p className="text-sm mt-1 text-red-600">{errors.firstName}</p>
                                        )}
                                    </div>
                                    <div className="w-1/2">
                                        <Field
                                            name="lastName"
                                            placeholder="Last Name"
                                            className="w-full p-3 border rounded bg-white focus:outline-none focus:ring-2"
                                            style={{ borderColor: "rgba(31,64,64,0.25)" }}
                                        />
                                        {errors.lastName && touched.lastName && (
                                            <p className="text-sm mt-1 text-red-600">{errors.lastName}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Email */}
                                <div>
                                    <Field
                                        type="email"
                                        name="email"
                                        placeholder="Email Address"
                                        className="w-full p-3 border rounded bg-white focus:outline-none focus:ring-2"
                                        style={{ borderColor: "rgba(31,64,64,0.25)" }}
                                    />
                                    {errors.email && touched.email && (
                                        <p className="text-sm mt-1 text-red-600">{errors.email}</p>
                                    )}
                                </div>

                                {/* Password */}
                                <div className="relative">
                                    <Field
                                        type={passwordVisible ? "text" : "password"}
                                        name="password"
                                        placeholder="Password"
                                        className="w-full p-3 border rounded bg-white focus:outline-none focus:ring-2"
                                        style={{ borderColor: "rgba(31,64,64,0.25)" }}
                                    />
                                    <div
                                        className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer opacity-70"
                                        onClick={() => setPasswordVisible(!passwordVisible)}
                                    >
                                        {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                                    </div>
                                    {errors.password && touched.password && (
                                        <p className="text-sm mt-1 text-red-600">{errors.password}</p>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                <div className="relative">
                                    <Field
                                        type={confirmPasswordVisible ? "text" : "password"}
                                        name="confirmPassword"
                                        placeholder="Confirm Password"
                                        className="w-full p-3 border rounded bg-white focus:outline-none focus:ring-2"
                                        style={{ borderColor: "rgba(31,64,64,0.25)" }}
                                    />
                                    <div
                                        className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer opacity-70"
                                        onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                                    >
                                        {confirmPasswordVisible ? <FaEyeSlash /> : <FaEye />}
                                    </div>
                                    {errors.confirmPassword && touched.confirmPassword && (
                                        <p className="text-sm mt-1 text-red-600">{errors.confirmPassword}</p>
                                    )}
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 font-semibold rounded hover:opacity-90 transition"
                                    style={{
                                        backgroundColor: "var(--cqu-accent)",
                                        color: "var(--cqu-text)",
                                        opacity: loading ? 0.7 : 1,
                                    }}
                                >
                                    {loading ? "Creating Account..." : "Create Account"}
                                </button>
                            </FormikForm>
                        )}
                    </Formik>

                    <p className="mt-6 text-center text-sm opacity-80">
                        Already have an account?{" "}
                        <Link to="/login" className="font-medium hover:underline" style={{ color: "var(--cqu-text)" }}>
                            Login
                        </Link>
                    </p>
                </div>
            </div>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6"
                        style={{ fontFamily: "var(--cqu-font)", color: "var(--cqu-text)" }}>
                        <h3 className="text-2xl font-bold mb-3" style={{ color: "#003B71" }}>
                            Account Pending Alert
                        </h3>
                        <p className="mb-4">
                            Please contact your Administrator by email{" "}
                            <a
                                href={`mailto:${ADMIN_EMAIL}`}
                                className="underline font-medium"
                                style={{ color: "#003B71" }}
                            >
                                {ADMIN_EMAIL}
                            </a>{" "}
                            to activate your profile.
                        </p>

                        <div className="flex justify-end gap-3 mt-4">
                            <button
                                onClick={goHome}
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

export default SignUp;
