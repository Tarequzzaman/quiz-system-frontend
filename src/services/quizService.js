const API_URL = "http://localhost:8000";

export const createQuiz = async ({ jobId, numQuestions = 12, types, topicHint = "" }) => {
    const resp = await fetch(`${API_URL}/quizzes`, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            jobId,
            numQuestions,
            types,
            topicHint,
        }),
    });

    const data = await resp.json();
    if (!resp.ok) {
        throw new Error(data.detail || "Failed to create quiz");
    }
    return data;
};



export const getRandomJobId = async () => {
    const resp = await fetch(`${API_URL}/random_upload_id`, {
        method: "GET",
        headers: {
            Accept: "application/json",
        },
    });

    const data = await resp.json();
    if (!resp.ok) {
        throw new Error(data.detail || "Failed to get random job ID");
    }
    return data.job_id;
}
