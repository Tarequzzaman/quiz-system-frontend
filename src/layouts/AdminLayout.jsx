import React from 'react';
import AdminNavbar from '../components/AdminNavbar';
import AdminSidebar from '../components/AdminSidebar';
import { Outlet } from 'react-router-dom';

const AdminLayout = () => {
    return (
        <div className="h-screen w-screen flex flex-col">
            <AdminNavbar />
            <div className="flex flex-1 overflow-hidden">
                <AdminSidebar />
                <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
