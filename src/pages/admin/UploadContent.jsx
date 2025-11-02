import React, { useEffect, useState } from "react";
import {
    getContents,
    createContent,
    deleteContent,
} from "../../services/courseContentService";

const UploadCourseContent = () => {
    const [contents, setContents] = useState([]);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [newUpload, setNewUpload] = useState(null);
    const [contentToDelete, setContentToDelete] = useState(null);
    const [viewFilesFor, setViewFilesFor] = useState(null);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [generateFor, setGenerateFor] = useState(null);
    const itemsPerPage = 7;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getContents();
                setContents(data);
            } catch (err) {
                console.error(err);
                setError("Failed to load uploads.");
            }
        };
        fetchData();
    }, []);

    const filtered = contents.filter((c) =>
        (c.courseCode || "").toLowerCase().includes(search.toLowerCase())
    );

    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentRows = filtered.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filtered.length / itemsPerPage);

    const handleUpload = async () => {
        try {
            if (
                !newUpload?.courseCode?.trim() ||
                !newUpload?.week ||
                !newUpload?.files?.length
            ) {
                setError("Course Code, Week, and at least one file are required.");
                return;
            }

            const formData = new FormData();
            formData.append("course_code", newUpload.courseCode);
            formData.append("week", newUpload.week);
            newUpload.files.forEach((f) => formData.append("files", f));

            const created = await createContent(formData);
            setContents((prev) => [...prev, created]);
            setNewUpload(null);
            setMessage("Content uploaded successfully!");
        } catch (err) {
            console.error(err);
            setError("Failed to upload content.");
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteContent(id);
            setContents((prev) => prev.filter((c) => c.id !== id));
            setMessage("Content deleted successfully!");
            setContentToDelete(null);
        } catch (err) {
            console.error(err);
            setError("Failed to delete content.");
        }
    };

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 2500);
            return () => clearTimeout(timer);
        }
    }, [message]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 2500);
            return () => clearTimeout(timer);
        }
    }, [error]);

    // --- Helpers for Generate Link modal
    const frontendOrigin = typeof window !== "undefined" ? window.location.origin : "";
    const jobIdFromRow = (row) => row?.jobId || row?.job_id || row?.id;
    const linkForRow = (row) =>
        `${frontendOrigin}/quiz_generate?job_id=${encodeURIComponent(jobIdFromRow(row) || "")}`;

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            setMessage("Link copied to clipboard.");
        } catch {
            setError("Failed to copy link.");
        }
    };

    return (
        <div className="bg-white rounded shadow p-6">
            {/* Alerts */}
            {error && (
                <div className="mb-4 bg-red-100 text-red-600 p-3 rounded shadow">
                    😔 {error}
                </div>
            )}
            {message && (
                <div className="mb-4 bg-green-100 text-green-700 p-3 rounded shadow">
                    ✅ {message}
                </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-indigo-600">
                    Upload Course Content
                </h1>
                <input
                    type="text"
                    placeholder="Search by course code..."
                    className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setCurrentPage(1);
                    }}
                />
            </div>

            {/* Upload Button */}
            <div className="flex justify-end mb-4">
                <button
                    style={{
                        backgroundColor: "var(--cqu-text)",
                        color: "white",
                    }}
                    onClick={() =>
                        setNewUpload({ courseCode: "", week: "", files: [], show: true })
                    }
                    className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
                >
                    Upload Course Content
                </button>
            </div>

            {/* Table */}
           // ...existing code...

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left border border-gray-200 rounded-lg overflow-hidden">
                    <thead style={{ backgroundColor: "var(--cqu-accent)" }}>
                        <tr>
                            {["#", "Course Code", "Week", "Files", "Uploaded By", "Actions"].map((head) => (
                                <th
                                    key={head}
                                    className="px-4 py-2 border-b font-semibold text-[var(--cqu-text)]"
                                >
                                    {head}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {currentRows.map((row, i) => (
                            <tr key={row.id || i} className="hover:bg-gray-50 transition">
                                <td className="px-4 py-2 border-b text-[var(--cqu-text)]">{i + 1}</td>
                                <td className="px-4 py-2 border-b text-[var(--cqu-text)]">{row.courseCode}</td>
                                <td className="px-4 py-2 border-b text-center text-[var(--cqu-text)]">{row.week}</td>
                                <td className="px-4 py-2 border-b text-center">
                                    {row.files?.length > 0 ? (
                                        <ul className="list-disc list-inside text-indigo-600">
                                            {row.files.map((f) => (
                                                <li key={f.id}>
                                                    <a
                                                        href={f.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="hover:underline text-[var(--cqu-text)]"
                                                    >
                                                        {f.name}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <span className="text-[var(--cqu-text)]">—</span>
                                    )}
                                </td>
                                <td className="px-4 py-2 border-b text-center text-[var(--cqu-text)]">
                                    {row.uploadedBy}
                                </td>
                                <td className="px-4 py-2 border-b text-center space-x-3">
                                    <button
                                        className="px-3 py-1 rounded font-medium transition"
                                        style={{
                                            backgroundColor: "var(--cqu-accent)",
                                            color: "var(--cqu-text)",
                                        }}
                                        onClick={() => setContentToDelete(row)}
                                    >
                                        Delete
                                    </button>
                                    {/* NEW: Generate Link */}
                                    <button
                                        className="px-3 py-1 rounded font-medium transition"
                                        style={{
                                            backgroundColor: "var(--cqu-text)",
                                            color: "white",
                                        }}
                                        onClick={() => setGenerateFor(row)}
                                    >
                                        Generate Link
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {currentRows.length === 0 && (
                            <tr>
                                <td colSpan="6" className="text-center py-4 text-gray-500">
                                    No uploads found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>


            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-6 space-x-2">
                    {Array.from({ length: totalPages }, (_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`px-3 py-1 border rounded ${currentPage === i + 1
                                ? "bg-indigo-600 text-white"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                                }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}

            {/* Upload Modal */}
            {newUpload?.show && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded shadow-lg w-full max-w-xl">
                        <h2 className="text-2xl font-semibold mb-6 text-indigo-600">
                            Upload Course Content
                        </h2>

                        <div className="space-y-4">
                            {/* Course Code */}
                            <div>
                                <label className="block text-sm font-medium" style={{ color: "var(--cqu-text)" }}>
                                    Course Code <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Example: COIT20273"
                                    className="w-full px-4 py-2 border rounded"
                                    style={{ color: "var(--cqu-text)" }}
                                    value={newUpload.courseCode}
                                    onChange={(e) =>
                                        setNewUpload({ ...newUpload, courseCode: e.target.value })
                                    }
                                />
                            </div>

                            {/* Week */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Week Number <span className="text-red-600">*</span>
                                </label>
                                <select
                                    className="w-full px-4 py-2 border rounded"
                                    value={newUpload.week}
                                    style={{ color: "var(--cqu-text)" }}

                                    onChange={(e) =>
                                        setNewUpload({ ...newUpload, week: e.target.value })
                                    }
                                >
                                    <option value="">Select Week</option>
                                    {Array.from({ length: 15 }, (_, i) => (
                                        <option key={i + 1} value={i + 1}>
                                            Week {i + 1}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* File Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Upload Files <span className="text-red-600">*</span>
                                </label>
                                <div
                                    className="border-2 border-dashed rounded-lg p-6 bg-gray-50 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-100 transition"
                                    onClick={() =>
                                        document.getElementById("upload-input")?.click()
                                    }
                                >
                                    <p className="text-gray-700">
                                        <span className="font-medium text-indigo-700">
                                            Click to choose files
                                        </span>{" "}
                                        or drag & drop
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        (PDF, DOC, DOCX, TXT, JPG, PNG)
                                    </p>
                                </div>
                                <input
                                    id="upload-input"
                                    type="file"
                                    multiple
                                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                                    className="hidden"
                                    onChange={(e) =>
                                        setNewUpload({
                                            ...newUpload,
                                            files: Array.from(e.target.files || []),
                                        })
                                    }
                                />
                                {newUpload.files?.length > 0 && (
                                    <ul className="mt-3 text-sm text-gray-700 border rounded divide-y bg-white">
                                        {newUpload.files.map((f, i) => (
                                            <li
                                                key={i}
                                                className="flex justify-between items-center px-3 py-2"
                                            >
                                                <span>{f.name}</span>
                                                <button
                                                    type="button"
                                                    style={{
                                                        backgroundColor: "var(--cqu-text)",
                                                        color: "white",
                                                    }}
                                                    onClick={() =>
                                                        setNewUpload({
                                                            ...newUpload,
                                                            files: newUpload.files.filter(
                                                                (_, idx) => idx !== i
                                                            ),
                                                        })
                                                    }
                                                    className="text-red-600 text-xs hover:underline"
                                                >
                                                    Remove
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 mt-6">
                            <button
                                className="px-4 py-2 rounded font-semibold transition"
                                style={{
                                    backgroundColor: "var(--cqu-text)",
                                    color: "white",
                                }}
                                onClick={() => setNewUpload(null)}
                            >
                                Cancel
                            </button>
                            <button
                                style={{
                                    backgroundColor: "var(--cqu-accent)",
                                    color: "var(--cqu-text)",
                                }} onClick={handleUpload}
                            >
                                Upload
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {contentToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded shadow-lg w-full max-w-md text-center">
                        <h2 className="text-2xl font-semibold text-red-600 mb-4">
                            Confirm Deletion
                        </h2>
                        <p className="text-gray-700 mb-6">
                            Are you sure you want to delete{" "}
                            <span className="font-bold">
                                {contentToDelete.courseCode} (Week {contentToDelete.week})
                            </span>
                            ?
                        </p>
                        <div className="flex justify-center gap-4">
                            <button
                                className="px-4 py-2 rounded font-semibold transition"
                                style={{
                                    backgroundColor: "var(--cqu-text)",
                                    color: "white",
                                }}
                                onClick={() => setContentToDelete(null)}
                            >
                                Cancel
                            </button>
                            <button
                                style={{
                                    backgroundColor: "var(--cqu-accent)",
                                    color: "var(--cqu-text)",
                                }} onClick={() => handleDelete(contentToDelete.id)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* NEW: Generate Link Modal */}
            {generateFor && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded shadow-lg w-full max-w-xl">
                        <h2 className="text-2xl font-semibold mb-4" style={{ color: "var(--cqu-text)" }}>
                            Generate Quiz Link
                        </h2>
                        <p className="mb-2" style={{ color: "var(--cqu-text)" }}>
                            Base URL for frontend:
                        </p>
                        <div className="mb-4">
                            <code
                                className="block w-full p-3 border rounded bg-gray-50 overflow-x-auto"
                                style={{ color: "var(--cqu-text)" }}
                            >
                                {linkForRow(generateFor)}
                            </code>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                className="px-4 py-2 rounded font-semibold transition"
                                style={{ backgroundColor: "var(--cqu-text)", color: "white" }}
                                onClick={() => setGenerateFor(null)}
                            >
                                Close
                            </button>
                            <button
                                className="px-4 py-2 rounded font-semibold transition"
                                style={{ backgroundColor: "var(--cqu-accent)", color: "var(--cqu-text)" }}
                                onClick={() => copyToClipboard(linkForRow(generateFor))}
                            >
                                Copy
                            </button>
                            <a
                                className="px-4 py-2 rounded font-semibold transition inline-block"
                                style={{ backgroundColor: "var(--cqu-accent)", color: "var(--cqu-text)" }}
                                href={linkForRow(generateFor)}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Open
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UploadCourseContent;
