import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import './Layout.css';

const AdminLayout = () => {
    return (
        <div className="layout-container">
            <AdminSidebar />
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
