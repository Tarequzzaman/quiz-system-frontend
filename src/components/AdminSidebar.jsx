// src/components/AdminSidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';

const AdminSidebar = () => {
    const linkClasses = ({ isActive }) =>
        `block px-4 py-2 rounded text-sm font-medium transition ${isActive
            ? 'bg-indigo-100 text-indigo-700'
            : 'text-gray-700 hover:bg-gray-200 hover:text-indigo-700'
        }`;

    return (
        <aside className="w-64 bg-gray-100 text-gray-800 min-h-screen p-4 border-r border-gray-200">
            {/* <h2 className="text-lg font-semibold mb-6 px-2">Admin Panel</h2> */}
            <nav className="space-y-2">
                {/* <NavLink to="/admin" end className={linkClasses}>
                    📊 Analytics
                </NavLink> */}
                <NavLink to="/admin/users" className={linkClasses}>
                    👥 Users
                </NavLink>
                <NavLink to="/admin/upload-content" className={linkClasses}>
                    📚 Upload Course Materials 
                </NavLink>
            </nav>
        </aside>
    );
};

export default AdminSidebar;
