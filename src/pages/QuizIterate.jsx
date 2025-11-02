import React, { useEffect, useMemo, useState } from "react";
// adjust the path if your services folder differs
import { createQuiz } from "../services/quizService";

const Quiz = () => {
    const colorText = "var(--cqu-text)"; // #1F4040
    const colorAccent = "var(--cqu-accent)"; // #FFB81C

    // Load quiz data from localStorage
    const stored = useMemo(() => {
        try {
            const raw = localStorage.getItem("generated_quiz");
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }, []);

    const title = stored?.title || "Quiz";
    const questions = useMemo(
        () => (Array.isArray(stored?.questions) ? stored.questions : []),
        [stored]
    );

    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({}); // { questionId: {userAnswer, correct} }
    const [inputValue, setInputValue] = useState("");
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
    const [finished, setFinished] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false); // loader for regenerate

    const current = questions[currentIndex];

    // track unanswered questions dynamically
    const unanswered = useMemo(
        () => questions.filter((q) => !answers[q.id]),
        [answers, questions]
    );

    useEffect(() => {
        if (unanswered.length === 0 && questions.length > 0) {
            setFinished(true);
        }
    }, [unanswered, questions]);

    if (!questions.length) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-white px-6 text-center">
                <div>
                    <h2 className="text-2xl font-bold mb-2" style={{ color: colorText }}>
                        No quiz found
                    </h2>
                    <p className="text-gray-600">
                        Please generate a quiz before opening this page.
                    </p>
                </div>
            </main>
        );
    }

    const handleSubmit = () => {
        if (!current) return;

        let userAnswer = null;
        if (current.type === "mcq_multi") userAnswer = selectedOptions;
        else if (current.type === "answer_short_question") userAnswer = inputValue.trim();
        else userAnswer = inputValue || selectedOptions[0];

        const correctAnswers = current.correctAnswers?.map(String) || [];
        const isCorrect = correctAnswers.length
            ? current.type === "mcq_multi"
                ? JSON.stringify([...userAnswer].sort()) ===
                JSON.stringify([...correctAnswers].sort())
                : correctAnswers.includes(String(userAnswer))
            : false;

        setAnswers((prev) => ({
            ...prev,
            [current.id]: { userAnswer, correct: isCorrect },
        }));

        setIsAnswerCorrect(isCorrect);
        setIsPopupVisible(true);
    };

    const handleSkip = () => {
        const nextIndex =
            currentIndex + 1 < questions.length ? currentIndex + 1 : 0;
        setCurrentIndex(nextIndex);
        setInputValue("");
        setSelectedOptions([]);
    };

    const handleNext = () => {
        setIsPopupVisible(false);
        setInputValue("");
        setSelectedOptions([]);
        const nextUnanswered = questions.find((q) => !answers[q.id]);
        if (nextUnanswered) {
            setCurrentIndex(questions.indexOf(nextUnanswered));
        } else {
            setFinished(true);
        }
    };

    // Regenerate: get job id from localStorage and call quiz generate API, update localStorage, show light loader (no dark bg)
    const handleRegenerate = async () => {
        try {
            setIsRegenerating(true);

            // Pull the latest from localStorage (in case it changed)
            const raw = localStorage.getItem("generated_quiz");
            const parsed = raw ? JSON.parse(raw) : stored || {};

            const jobId = localStorage.getItem("job_id");
            if (!jobId) {
                setIsRegenerating(false);
                alert("No job id found in local storage.");
                return;
            }

            // Preserve prior preferences if present
            const numQuestions = parsed?.numQuestions || 12;
            const types = parsed?.types || parsed?.questionTypes || undefined;
            const topicHint = parsed?.topicHint || parsed?.topic || "";

            const data = await createQuiz({
                jobId,
                numQuestions,
                types,
                topicHint,
            });

            // Update the same key used by this page
            localStorage.setItem("generated_quiz", JSON.stringify(data));

            // Reload to pick up the new quiz
            window.location.reload();
        } catch (e) {
            console.error(e);
            setIsRegenerating(false);
            alert(e?.message || "Failed to regenerate quiz.");
        }
    };

    if (finished) {
        const total = questions.length;
        const correctCount = Object.values(answers).filter((a) => a.correct).length;
        const incorrectCount = total - correctCount;
        const percentage = ((correctCount / total) * 100).toFixed(1);

        return (
            <main className="flex flex-col items-center justify-start min-h-screen bg-white text-center px-6 py-12">
                <h1 className="text-4xl font-bold mb-2" style={{ color: colorText }}>
                    Quiz Summary
                </h1>
                <p className="mb-8 text-lg" style={{ color: colorText }}>
                    You answered {correctCount} out of {total} questions correctly.
                </p>

                <div
                    className="rounded-xl p-6 shadow-md mb-10 w-full max-w-3xl text-left"
                    style={{ backgroundColor: "#F7FAF9" }}
                >
                    <h2
                        className="text-2xl font-bold mb-4 border-b pb-2"
                        style={{ color: colorText }}
                    >
                        Report
                    </h2>
                    <p className="mb-2" style={{ color: colorText }}>
                        ✅ <strong>Correct:</strong> {correctCount}
                    </p>
                    <p className="mb-2" style={{ color: colorText }}>
                        ❌ <strong>Incorrect:</strong> {incorrectCount}
                    </p>
                    <p className="mb-2" style={{ color: colorText }}>
                        📊 <strong>Accuracy:</strong> {percentage}%
                    </p>
                </div>

                {/* Review Section */}
                <div className="w-full max-w-3xl space-y-6">
                    {questions.map((q, i) => {
                        const user = answers[q.id];
                        return (
                            <div
                                key={q.id}
                                className="rounded-xl p-6 shadow-sm"
                                style={{ backgroundColor: "#F7FAF9" }}
                            >
                                <h3 className="text-lg font-semibold mb-2" style={{ color: colorText }}>
                                    Q{i + 1}. {q.question}
                                </h3>

                                <p className="font-semibold" style={{ color: colorText }}>
                                    {user?.correct ? "✅ Correct" : "❌ Incorrect"}
                                </p>

                                {user?.userAnswer && (
                                    <p className="mt-2" style={{ color: colorText }}>
                                        <strong>Your answer:</strong>{" "}
                                        {Array.isArray(user.userAnswer)
                                            ? user.userAnswer.join(", ")
                                            : user.userAnswer}
                                    </p>
                                )}

                                {q.correctAnswers?.length > 0 && (
                                    <p className="mt-1" style={{ color: colorText }}>
                                        <strong>Correct answer:</strong>{" "}
                                        {q.correctAnswers.join(", ")}
                                    </p>
                                )}

                                {q.explanation && (
                                    <p className="text-sm mt-2" style={{ color: colorText }}>
                                        💡 <em>{q.explanation}</em>
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="mt-10 flex gap-3">
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 rounded font-semibold shadow-sm hover:shadow-md transition"
                        style={{ backgroundColor: colorAccent, color: colorText }}
                    >
                        Retry Quiz
                    </button>

                    {/* Regenerate button */}
                    <button
                        onClick={handleRegenerate}
                        className="px-6 py-3 rounded font-semibold shadow-sm hover:shadow-md transition"
                        style={{ backgroundColor: "var(--cqu-text)", color: "white" }}
                    >
                        Regenerate
                    </button>
                </div>

                {/* Loader with NO dark background */}
                {isRegenerating && (
                    <div className="fixed inset-0 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl p-8 w-[90vw] max-w-sm text-center border border-gray-200 shadow-2xl">
                            <div className="mx-auto mb-4 h-12 w-12 rounded-full border-4 border-gray-200 border-t-[var(--cqu-text)] animate-spin" />
                            <h3 className="text-xl font-bold mb-1" style={{ color: colorText }}>
                                Generating a new quiz…
                            </h3>
                            <p className="text-sm" style={{ color: colorText }}>
                                Please wait while we prepare fresh questions.
                            </p>
                        </div>
                    </div>
                )}
            </main>
        );
    }

    return (
        <main
            className="bg-white min-h-screen flex flex-col items-center px-6 py-16"
            style={{ color: colorText }}
        >
            <div className="max-w-2xl w-full">
                <h1
                    className="text-2xl md:text-3xl font-extrabold text-center mb-2"
                    style={{ color: colorText }}
                >
                    {title}
                </h1>
                <p className="text-center text-sm text-gray-600 mb-8">
                    Question {currentIndex + 1} of {questions.length}
                </p>

                {/* Question Card */}
                <div
                    className="rounded-xl p-6"
                    style={{ backgroundColor: "#F7FAF9" }}
                >
                    <h3 className="text-xl font-semibold text-gray-800 mb-6">
                        {current.question}
                    </h3>

                    {/* Render options */}
                    {["true_false", "mcq_single"].includes(current.type) && (
                        <div className="flex flex-col space-y-3">
                            {current.options.map((opt) => (
                                <label
                                    key={opt}
                                    className={`cursor-pointer py-2 px-4 rounded-lg border ${inputValue === opt
                                        ? "text-white"
                                        : "text-gray-800 border-gray-200 hover:bg-gray-100"
                                        }`}
                                    style={{
                                        backgroundColor:
                                            inputValue === opt
                                                ? colorText
                                                : "transparent",
                                        borderColor:
                                            inputValue === opt
                                                ? colorText
                                                : undefined,
                                    }}
                                    onClick={() => setInputValue(opt)}
                                >
                                    {opt}
                                </label>
                            ))}
                        </div>
                    )}

                    {current.type === "mcq_multi" && (
                        <div className="flex flex-col space-y-3">
                            {current.options.map((opt) => (
                                <label
                                    key={opt}
                                    className="flex items-center gap-3 cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        className="h-5 w-5 rounded border-gray-300"
                                        checked={selectedOptions.includes(opt)}
                                        onChange={(e) =>
                                            setSelectedOptions((prev) =>
                                                e.target.checked
                                                    ? [...prev, opt]
                                                    : prev.filter(
                                                        (x) => x !== opt
                                                    )
                                            )
                                        }
                                    />
                                    <span className="text-gray-800">{opt}</span>
                                </label>
                            ))}
                        </div>
                    )}

                    {current.type === "answer_short_question" && (
                        <div>
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) =>
                                    setInputValue(e.target.value)
                                }
                                placeholder="Type your answer..."
                                className="w-full p-3 border rounded focus:outline-none focus:ring-2"
                                style={{
                                    borderColor: "rgba(31,64,64,0.25)",
                                }}
                            />
                        </div>
                    )}

                    <div className="flex justify-between mt-8">
                        <button
                            className="py-2 px-6 rounded-full font-medium transition shadow-sm hover:shadow-md"
                            style={{
                                backgroundColor: "#E5E7EB",
                                color: "#111827",
                            }}
                            onClick={handleSkip}
                        >
                            Skip
                        </button>
                        <button
                            className="py-2 px-6 rounded-full font-medium transition shadow-sm hover:shadow-md disabled:opacity-50"
                            style={{
                                backgroundColor: colorAccent,
                                color: colorText,
                            }}
                            onClick={handleSubmit}
                            disabled={
                                !inputValue && selectedOptions.length === 0
                            }
                        >
                            Submit
                        </button>
                    </div>
                </div>
            </div>

            {/* Pop-up */}
            {isPopupVisible && (
                <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
                    <div
                        className="bg-white rounded-2xl p-8 w-[90vw] max-w-md text-center border border-gray-200 shadow-2xl pointer-events-auto"
                        style={{ animation: "scaleIn 0.3s ease" }}
                    >
                        <div className="text-6xl mb-3">
                            {isAnswerCorrect ? "🎉" : "😢"}
                        </div>
                        <h2
                            className="text-2xl font-bold mb-2"
                            style={{
                                color: isAnswerCorrect
                                    ? colorText
                                    : "#CC2B2B",
                            }}
                        >
                            {isAnswerCorrect ? "Correct!" : "Incorrect!"}
                        </h2>
                        {current.explanation && (
                            <p className="text-gray-700 mb-4">
                                {current.explanation}
                            </p>
                        )}
                        <button
                            onClick={handleNext}
                            className="px-6 py-2 rounded font-semibold shadow-sm hover:shadow-md transition"
                            style={{
                                backgroundColor: colorAccent,
                                color: colorText,
                            }}
                        >
                            {currentIndex + 1 < questions.length
                                ? "Next"
                                : "Finish"}
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
};

export default Quiz;
