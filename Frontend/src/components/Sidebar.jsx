import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, PlusCircle, User, LogOut, MapPin, Info, PhoneCall } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/submit-issue', label: 'Report Issue', icon: PlusCircle },
        { path: '/nearby', label: 'Nearby Issues', icon: MapPin },
        { path: '/my-reports', label: 'My Reports', icon: FileText },
        { path: '/profile', label: 'Profile', icon: User },
        { path: '/about', label: 'About', icon: Info },
        { path: '/helpline', label: 'Helpline', icon: PhoneCall },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <img src="/logo.png" alt="UrbanEye Logo" className="sidebar-brand-icon" />
            </div>

            <nav className="sidebar-nav">
                <ul>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <li key={item.path}>
                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                                >
                                    <Icon size={20} className="nav-icon" />
                                    <span>{item.label}</span>
                                </NavLink>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <div className="sidebar-bottom">
                <button className="logout-btn" onClick={handleLogout}>
                    <LogOut size={20} className="nav-icon" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
