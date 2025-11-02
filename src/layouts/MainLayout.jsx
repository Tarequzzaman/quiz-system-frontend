import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const MainLayout = () => {
    return (
        <>
            <Navbar />
            <main className="w-screen min-h-screen overflow-y-auto">
                <Outlet /> {/* This will render the matched public route */}
            </main>
            <Footer />
        </>
    );
};

export default MainLayout;
