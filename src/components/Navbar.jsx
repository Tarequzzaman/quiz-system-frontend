import React, { useState } from "react";
import { Link } from "react-router-dom";
import cquLogo from "../assets/cqu-web-logo.svg";

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav
            className="bg-white shadow-md px-6 py-4 sticky top-0 z-50"
            style={{ fontFamily: "var(--cqu-font)", color: "var(--cqu-text)" }}
        >
            <div className="w-full flex justify-between items-center">
                {/* Left: Logo */}
                <Link to="/" className="flex items-center gap-3">
                    <img src={cquLogo} alt="QuizGPT" className="h-9 w-auto" />
                    <span
                        className="text-xl font-semibold tracking-tight"
                        style={{ color: "var(--cqu-text)" }}
                    >
                        QuizGPT
                    </span>
                </Link>

                {/* Desktop menu (right) */}
                <div className="hidden md:flex space-x-6 items-center ml-auto">
                    <Link
                        to="/"
                        className="font-medium transition-colors hover:underline focus:underline outline-none"
                        style={{ color: "var(--cqu-text)" }}
                    >
                        Home
                    </Link>

                    <Link
                        to="/about"
                        className="font-medium transition-colors hover:underline focus:underline outline-none"
                        style={{ color: "var(--cqu-text)" }}
                    >
                        About
                    </Link>

                    <Link
                        to="/login"
                        className="px-4 py-2 rounded-lg font-semibold shadow-sm transition-transform active:scale-[0.98]"
                        style={{
                            backgroundColor: "var(--cqu-accent)",
                            color: "var(--cqu-text)",
                        }}
                    >
                        Login
                    </Link>
                </div>

                {/* Hamburger Menu (mobile) */}
                <div className="md:hidden ml-auto">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="focus:outline-none"
                        style={{ color: "var(--cqu-text)" }}
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            {isOpen ? (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            ) : (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            )}
                        </svg>
                    </button>
                </div>
            </div>
            {isOpen && (
                <div className="md:hidden flex flex-col mt-4 space-y-2">
                    <Link
                        to="/"
                        className="font-medium"
                        style={{ color: "var(--cqu-text)" }}
                        onClick={() => setIsOpen(false)}
                    >
                        Home
                    </Link>
                    <Link
                        to="/about"
                        className="font-medium"
                        style={{ color: "var(--cqu-text)" }}
                        onClick={() => setIsOpen(false)}
                    >
                        About
                    </Link>
                    <Link
                        to="/login"
                        className="px-4 py-2 rounded-lg font-semibold text-center"
                        style={{
                            backgroundColor: "var(--cqu-accent)",
                            color: "var(--cqu-text)",
                        }}
                        onClick={() => setIsOpen(false)}
                    >
                        Login
                    </Link>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
