import React, { useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Formik, Field, Form as FormikForm } from "formik";
import * as Yup from "yup";
import { createQuiz } from "../services/quizService";

const GenerateIllustration = () => (
    <svg viewBox="0 0 640 480" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto max-w-md">
        <defs>
            <linearGradient id="g1" x1="0" x2="1">
                <stop offset="0" stopColor="#FFB81C" />
                <stop offset="1" stopColor="#FFD983" />
            </linearGradient>
        </defs>
        <rect x="0" y="0" width="640" height="480" fill="#F7FAF9" />
        <g transform="translate(70,60)">
            <rect x="0" y="0" rx="16" width="500" height="300" fill="white" stroke="#1F4040" opacity="0.15" />
            <rect x="24" y="28" rx="10" width="300" height="20" fill="url(#g1)" />
            <rect x="24" y="70" rx="8" width="450" height="14" fill="#003B71" opacity=".12" />
            <rect x="24" y="96" rx="8" width="420" height="14" fill="#003B71" opacity=".12" />
            <rect x="24" y="122" rx="8" width="380" height="14" fill="#003B71" opacity=".12" />
            <g transform="translate(360,190)">
                <circle r="46" fill="#003B71" />
                <path d="M-26 0h52M0 -26v52" stroke="#FFB81C" strokeWidth="6" strokeLinecap="round" />
            </g>
        </g>
    </svg>
);

const Schema = Yup.object().shape({
    studentId: Yup.string().required("Student ID is required"),
});

const QuizGenerate = () => {
    const [searchParams] = useSearchParams();
    const jobId = useMemo(() => searchParams.get("job_id") || "", [searchParams]);
    const [modalState, setModalState] = useState(null); // "missing" | "loading" | "done"
    const navigate = useNavigate();

    const defaultTypes = ["mcq_single", "mcq_multi", "true_false", "answer_short_question"];

    const handleSubmit = async (values, { setSubmitting }) => {
        if (!jobId) {
            setModalState("missing");
            setSubmitting(false);
            return;
        }
        localStorage.removeItem("generated_quiz");

        setModalState("loading");

        try {
            const response = await createQuiz({
                jobId,
                studentId: values.studentId,
                numQuestions: 12,
                types: defaultTypes,
                topicHint: values.topicHint || "",
            });
            localStorage.setItem("generated_quiz", JSON.stringify(response));
            localStorage.setItem("job_id", jobId);

            // Simulate delay if API is very fast
            setTimeout(() => setModalState("done"), 1500);
        } catch (e) {
            setModalState("missing");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-white" style={{ color: "var(--cqu-text)", fontFamily: "var(--cqu-font)" }}>
            {/* Hero */}
            <section className="w-full py-14" style={{ backgroundColor: "#1F4040", color: "#FFFFFF" }}>
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-10">
                    <div className="flex-1">
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                            Provide your Student ID to Generate Quiz
                        </h1>
                        <p className="mt-3 text-white/90">
                            Provide a Student ID and we’ll create a tailored quiz using the content associated with this job.
                        </p>
                        <p className="mt-2 text-white/80 text-sm">
                            <strong>Job ID</strong>: {jobId ? jobId : "Not provided"}
                        </p>
                    </div>
                    <div className="flex-1 flex justify-center">
                        <GenerateIllustration />
                    </div>
                </div>
            </section>

            {/* Form Section */}
            <section className="max-w-5xl mx-auto px-6 py-16 pb-32 flex justify-center">
                <div className="rounded-2xl p-6 shadow-md w-full max-w-lg" style={{ backgroundColor: "#F7FAF9" }}>
                    <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--cqu-text)" }}>
                        Quiz Request
                    </h2>
                    <p className="mb-6 opacity-80">Enter the student details and start generating the quiz.</p>

                    <Formik initialValues={{ studentId: "", topicHint: "" }} validationSchema={Schema} onSubmit={handleSubmit}>
                        {({ errors, touched, isSubmitting }) => (
                            <FormikForm className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold mb-1">
                                        Student ID <span className="text-red-600">*</span>
                                    </label>
                                    <Field
                                        name="studentId"
                                        placeholder="e.g., s1234567"
                                        className="w-full p-3 border rounded focus:outline-none focus:ring-2"
                                        style={{
                                            borderColor: "rgba(31,64,64,0.25)",
                                            backgroundColor: "white",
                                            color: "var(--cqu-text)",
                                        }}
                                    />
                                    {errors.studentId && touched.studentId && (
                                        <p className="text-sm mt-1" style={{ color: "#CC2B2B" }}>
                                            {errors.studentId}
                                        </p>
                                    )}
                                </div>

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
                                    {isSubmitting ? "Generating..." : "Generate Quiz"}
                                </button>
                            </FormikForm>
                        )}
                    </Formik>
                </div>
            </section>

            {/* Centered Pop-up Modal (no dark background) */}
            {modalState && (
                <div
                    className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
                    style={{
                        animation: "fadeIn 0.3s ease",
                    }}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl p-8 w-[90vw] max-w-md text-center border border-gray-200 pointer-events-auto"
                        style={{
                            animation: "scaleIn 0.3s ease",
                        }}
                    >
                        {/* Missing Job ID */}
                        {modalState === "missing" && (
                            <>
                                <h2 className="text-xl font-semibold mb-3 text-red-700">Job ID Not Provided</h2>
                                <p className="text-gray-700 mb-6">
                                    Please copy the exact link from <strong>Moodle</strong> and try again.
                                </p>
                                <button
                                    onClick={() => setModalState(null)}
                                    className="px-6 py-2 rounded font-semibold shadow-sm hover:shadow-md transition"
                                    style={{ backgroundColor: "#1F4040", color: "white" }}
                                >
                                    Close
                                </button>
                            </>
                        )}

                        {/* Generating Quiz */}
                        {modalState === "loading" && (
                            <>
                                <div className="flex justify-center mb-4">
                                    <div className="w-8 h-8 border-4 border-t-transparent border-[#1F4040] rounded-full animate-spin"></div>
                                </div>
                                <h2 className="text-xl font-semibold mb-2" style={{ color: "#1F4040" }}>
                                    Generating Quiz...
                                </h2>
                                <p className="text-gray-600">Please wait while your quiz is being prepared.</p>
                            </>
                        )}

                        {/* Quiz Generated */}
                        {modalState === "done" && (

                            <>
                                <h2 className="text-xl font-semibold mb-3 text-green-700">✅ Quiz Generated!</h2>
                                <p className="text-gray-700 mb-6">Your quiz has been successfully generated.</p>
                                <button
                                    onClick={() => navigate("/quizzes")}
                                    className="px-6 py-2 rounded font-semibold shadow-sm hover:shadow-md transition"
                                    style={{ backgroundColor: "#FFB81C", color: "#1F4040" }}
                                >
                                    Continue with Quizzes
                                </button>
                            </>
                        )}
                    </div>

                    {/* Animation styles */}
                    <style>
                        {`
        @keyframes scaleIn {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
      `}
                    </style>
                </div>
            )}



        </div>
    );
};

export default QuizGenerate;
