// src/services/courseContentService.js
// Works with FastAPI endpoints:
// - POST /uploads
// - GET /user_uploads
// - DELETE /user_uploads/{job_id}

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

function authHeader() {
    const token = localStorage.getItem("access_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * ✅ Get all uploaded course contents
 */
export async function getContents() {
    const res = await fetch(`${API_BASE}/user_uploads`, {
        method: "GET",
        headers: {
            accept: "application/json",
            ...authHeader(),
        },
    });

    if (!res.ok) throw new Error(`Failed to load uploads (${res.status})`);
    const data = await res.json();

    // ✅ Map backend response to frontend-friendly keys
    return data.map((item) => ({
        id: item.job_id,
        courseCode: item.course_code,
        week: item.week,
        uploadedBy: item.user_name,
        files: (item.filenames || []).map((name, i) => ({
            id: `${item.job_id}-${i}`,
            name,
            url: `${API_BASE}/uploads/${item.job_id}/${name}`,
        })),
    }));
}


export async function createContent(formData) {


    console.log("FormData contents:");
    for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
    }

    const res = await fetch(`${API_BASE}/uploads`, {
        method: "POST",
        headers: {
            accept: "application/json",
            ...authHeader(),
        },
        body: formData,
    });

    if (!res.ok) throw new Error(`Upload failed (${res.status})`);
    const created = await res.json();
    console.log("Created upload response:", created);

    return {
        id: created.job_id,
        courseCode: formData.get("course_code"),
        week: formData.get("week"),
        uploadedBy: created.user_name || "Me",
        files: (created.filenames || []).map((name, i) => ({
            id: `${created.job_id}-${i}`,
            name,
            url: `${API_BASE}/uploads/${created.job_id}/${name}`,
        })),
    };
}


export async function deleteContent(jobId) {
    const res = await fetch(`${API_BASE}/uploaded_files/${jobId}`, {
        method: "DELETE",
        headers: {
            accept: "application/json",
            ...authHeader(),
        },
    });

    if (!res.ok) throw new Error(`Delete failed (${res.status})`);
    return { success: true };
}
