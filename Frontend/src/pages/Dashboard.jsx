import { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import './Dashboard.css';

// Fix default Leaflet marker icon issue in React
const DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const Dashboard = () => {
    const [data, setData] = useState({
        stats: { total: 0, pending: 0, resolved: 0 },
        recentIssues: [],
        mapIssues: []
    });
    const [liveAnnouncements, setLiveAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch((import.meta.env.VITE_API_BASE_URL || '') + '/api/issues/dashboard', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const dashboardData = await res.json();
                    setData(dashboardData);
                }

                // Fetch Announcements
                const annRes = await fetch((import.meta.env.VITE_API_BASE_URL || '') + '/api/announcements', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (annRes.ok) {
                    setLiveAnnouncements(await annRes.json());
                }
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const feedback = [
        "The pothole on Main St is getting bigger.",
        "Streetlights on 5th avenue are out again.",
        "Great job fixing the park bench!"
    ];

    const recentFeedbacks = data.recentIssues
        .flatMap(issue => (issue.feedbacks || []).map(fb => ({ ...fb, issueTitle: issue.title })))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

    return (
        <div className="page-container animate-fade-in">
            <h1 className="page-title">Citizen Dashboard</h1>

            <div className="dashboard-grid">
                {/* Top Stats */}
                <div className="stats-container">
                    <div className="stat-card">
                        <span className="stat-title">Total Reports</span>
                        <span className="stat-value">{loading ? '...' : data.stats.total}</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-title">Pending Issues</span>
                        <span className="stat-value">{loading ? '...' : data.stats.pending}</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-title">Resolved Issues</span>
                        <span className="stat-value">{loading ? '...' : data.stats.resolved}</span>
                    </div>
                </div>

                {/* Issue Overview */}
                <div className="overview-section">
                    <div className="section-header">
                        <h2 className="section-title">Issue Overview</h2>
                        <select className="filter-select" aria-label="Filter by Category">
                            <option value="">Filter by Category</option>
                            <option value="roads">Roads</option>
                            <option value="electricity">Electricity</option>
                            <option value="sanitation">Sanitation</option>
                        </select>
                    </div>
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Issue</th>
                                    <th>Category</th>
                                    <th>Status</th>
                                    <th>Priority</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && <tr><td colSpan="4" style={{ textAlign: 'center' }}>Loading recent issues...</td></tr>}
                                {!loading && data.recentIssues.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center' }}>No issues reported yet.</td></tr>}
                                {!loading && data.recentIssues.map(issue => (
                                    <tr key={issue._id}>
                                        <td><strong>{issue.title}</strong></td>
                                        <td>{issue.category}</td>
                                        <td>
                                            <span className={`status-badge ${issue.status.toLowerCase().replace(' ', '-')}`}>
                                                {issue.status}
                                            </span>
                                        </td>
                                        <td>{issue.isUrgent ? 'High' : 'Normal'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Map View */}
                <div className="map-section">
                    <h2 className="section-title">Map View</h2>
                    <div style={{ height: '400px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', zIndex: 0 }}>
                        <MapContainer center={[28.6139, 77.2090]} zoom={11} style={{ height: '100%', width: '100%', zIndex: 1 }}>
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {!loading && data.mapIssues && data.mapIssues.map(issue => (
                                issue.latitude && issue.longitude && (
                                    <Marker key={issue._id} position={[issue.latitude, issue.longitude]}>
                                        <Popup>
                                            <strong>{issue.title}</strong><br />
                                            {issue.category} - <span className={`status-text ${issue.status.toLowerCase().replace(' ', '-')}`}>{issue.status}</span>
                                        </Popup>
                                    </Marker>
                                )
                            ))}
                        </MapContainer>
                    </div>
                </div>

                {/* Feedback Section */}
                <div className="feedback-section">
                    <h2 className="section-title" style={{ marginBottom: '1rem' }}>Recent Feedback</h2>
                    <ul>
                        {recentFeedbacks.length === 0 && (
                            <li className="list-item">
                                <span className="list-item-text" style={{ color: '#64748b' }}>No feedback posted recently.</span>
                            </li>
                        )}
                        {recentFeedbacks.map((item, idx) => (
                            <li key={idx} className="list-item">
                                <span className="list-item-text">
                                    <strong style={{ color: 'var(--color-primary)' }}>{item.user?.name || 'Citizen'}</strong> on <strong>{item.issueTitle}</strong>: "{item.text}"
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Announcements Section */}
                <div className="announcements-section">
                    <h2 className="section-title" style={{ marginBottom: '1rem' }}>Announcements</h2>
                    <ul>
                        {liveAnnouncements.length === 0 && (
                            <li className="list-item">
                                <span className="list-item-text" style={{ color: '#64748b' }}>No recent announcements.</span>
                            </li>
                        )}
                        {liveAnnouncements.map((item) => (
                            <li key={item._id} className="list-item">
                                <span className="list-item-text">{item.message}</span>
                            </li>
                        ))}
                    </ul>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;
