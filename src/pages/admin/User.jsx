import React, { useState, useEffect } from "react";
import { getUsers, updateUser, deleteUser } from "../../services/userService";

const Users = () => {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [editUser, setEditUser] = useState(null);
    const [userToDelete, setUserToDelete] = useState(null);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const usersPerPage = 8;

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const fetchedUsers = await getUsers();
                setUsers(fetchedUsers);
            } catch (err) {
                setError(err.message || "Something went wrong.");
            }
        };
        fetchUsers();
    }, []);

    const filteredUsers = users.filter((user) =>
        user.email.toLowerCase().includes(search.toLowerCase())
    );

    const indexOfLast = currentPage * usersPerPage;
    const indexOfFirst = indexOfLast - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    const handleSave = async () => {
        try {
            const updated = await updateUser(editUser.id, editUser);
            setUsers((prev) =>
                prev.map((user) => (user.id === updated.id ? updated : user))
            );
            setEditUser(null);
            setMessage("User updated successfully.");
        } catch (err) {
            setError(err.message || "Something went wrong.");
        }
    };

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 2000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 2000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    return (
        <div
            className="bg-white rounded-xl p-6 shadow-md"
            style={{ fontFamily: "var(--cqu-font)", color: "var(--cqu-text)" }}
        >
            {/* Popups */}
            {error && (
                <div className="mb-4 bg-red-100 text-red-700 p-3 rounded shadow">
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
                <h1
                    className="text-2xl font-bold tracking-wide"
                    style={{ color: "var(--cqu-text)" }}
                >
                    Manage Users
                </h1>
                <input
                    type="text"
                    placeholder="Search by email..."
                    className="border rounded px-4 py-2 focus:outline-none focus:ring-2"
                    style={{
                        borderColor: "rgba(31,64,64,0.3)",
                        focusRingColor: "var(--cqu-accent)",
                    }}
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setCurrentPage(1);
                    }}
                />
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left border border-gray-200 rounded-lg overflow-hidden">
                    <thead style={{ backgroundColor: "var(--cqu-accent)" }}>
                        <tr>
                            {[
                                "User ID",
                                "First Name",
                                "Last Name",
                                "Email",
                                "Role",
                                "Actions",
                            ].map((head) => (
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
                        {currentUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 transition">
                                <td className="px-4 py-2 border-b">{user.id}</td>
                                <td className="px-4 py-2 border-b">{user.firstName}</td>
                                <td className="px-4 py-2 border-b">{user.lastName}</td>
                                <td className="px-4 py-2 border-b">{user.email}</td>
                                <td className="px-4 py-2 border-b capitalize">{user.role}</td>
                                <td className="px-8 py-2 border-b text-center space-x-3">
                                    {/* ✅ Themed Edit & Delete buttons */}
                                    <button
                                        className="px-3 py-1 rounded text-white font-medium transition"
                                        style={{
                                            backgroundColor: "var(--cqu-text)",
                                        }}
                                        onClick={() => setEditUser({ ...user })}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="px-3 py-1 rounded font-medium transition"
                                        style={{
                                            backgroundColor: "var(--cqu-accent)",
                                            color: "var(--cqu-text)",
                                        }}
                                        onClick={() => setUserToDelete(user)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {currentUsers.length === 0 && (
                            <tr>
                                <td colSpan="6" className="text-center py-4 text-gray-500">
                                    No users found.
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
                                    ? "text-white"
                                    : "bg-white text-[var(--cqu-text)] border-gray-300 hover:bg-gray-100"
                                }`}
                            style={{
                                backgroundColor:
                                    currentPage === i + 1 ? "var(--cqu-accent)" : undefined,
                            }}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}

            {/* Edit Modal */}
            {editUser && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
                        <h2
                            className="text-2xl font-semibold mb-6"
                            style={{ color: "var(--cqu-text)" }}
                        >
                            Edit User
                        </h2>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2"
                                    style={{
                                        borderColor: "rgba(31,64,64,0.3)",
                                        focusRingColor: "var(--cqu-accent)",
                                    }}
                                    value={editUser.firstName}
                                    onChange={(e) =>
                                        setEditUser({ ...editUser, firstName: e.target.value })
                                    }
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2"
                                    style={{
                                        borderColor: "rgba(31,64,64,0.3)",
                                        focusRingColor: "var(--cqu-accent)",
                                    }}
                                    value={editUser.lastName}
                                    onChange={(e) =>
                                        setEditUser({ ...editUser, lastName: e.target.value })
                                    }
                                />
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium mb-1">Role</label>
                            <select
                                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2"
                                style={{
                                    borderColor: "rgba(31,64,64,0.3)",
                                    focusRingColor: "var(--cqu-accent)",
                                }}
                                value={editUser.role}
                                onChange={(e) =>
                                    setEditUser({ ...editUser, role: e.target.value })
                                }
                            >
                                <option value="user">User</option>
                                <option value="tutor">Tutor</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                className="px-4 py-2 rounded font-semibold transition"
                                style={{
                                    backgroundColor: "var(--cqu-accent)",
                                    color: "var(--cqu-text)",
                                }}
                                onClick={handleSave}
                            >
                                Save Changes
                            </button>
                            <button
                                className="px-4 py-2 rounded font-semibold transition"
                                style={{
                                    backgroundColor: "var(--cqu-text)",
                                    color: "white",
                                }}
                                onClick={() => setEditUser(null)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {userToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
                        <h2 className="text-2xl font-semibold text-red-600 mb-4">
                            Confirm Deletion
                        </h2>
                        <p className="text-gray-700 mb-6">
                            Are you sure you want to delete{" "}
                            <span className="font-bold">
                                {userToDelete.firstName} {userToDelete.lastName}
                            </span>
                            ?
                        </p>
                        <div className="flex justify-center space-x-4">
                            <button
                                className="px-4 py-2 rounded font-semibold transition"
                                style={{
                                    backgroundColor: "var(--cqu-text)",
                                    color: "white",
                                }}
                                onClick={() => setUserToDelete(null)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 rounded font-semibold transition"
                                style={{
                                    backgroundColor: "var(--cqu-accent)",
                                    color: "var(--cqu-text)",
                                }}
                                onClick={async () => {
                                    try {
                                        await deleteUser(userToDelete.id);
                                        setUsers(users.filter((u) => u.id !== userToDelete.id));
                                        setUserToDelete(null);
                                        setMessage("User deleted successfully.");
                                    } catch (err) {
                                        setError(err.message || "Something went wrong.");
                                    }
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;
