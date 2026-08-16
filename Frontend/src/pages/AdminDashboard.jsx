import { useState, useEffect } from 'react';
import { MapPin, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import './Dashboard.css'; // Reusing dashboard CSS

// Fix default Leaflet marker icon issue in React
const DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const AdminDashboard = () => {
    const [data, setData] = useState({
        issues: [],
        stats: { total: 0, pending: 0, resolved: 0 }
    });
    const [loading, setLoading] = useState(true);
    const [announcementText, setAnnouncementText] = useState('');

    const fetchAdminData = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch((import.meta.env.VITE_API_BASE_URL || '') + '/api/issues/admin/all', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const adminData = await res.json();
                setData(adminData);
            }
        } catch (error) {
            console.error('Failed to fetch admin dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdminData();
    }, []);

    const handleStatusChange = async (issueId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/issues/admin/${issueId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                // Refresh data to reflect updated stats and issue list
                fetchAdminData();
            }
        } catch (error) {
            console.error('Failed to update status', error);
        }
    };

    const handlePostAnnouncement = async (e) => {
        e.preventDefault();
        if (!announcementText.trim()) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch((import.meta.env.VITE_API_BASE_URL || '') + '/api/announcements', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ message: announcementText })
            });

            if (res.ok) {
                setAnnouncementText('');
                alert('Announcement posted successfully!');
            }
        } catch (error) {
            console.error('Failed to post announcement:', error);
        }
    };

    return (
        <div className="page-container animate-fade-in">
            <h1 className="page-title">Admin Dashboard</h1>

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
                        <span className="stat-title">Resolved/Rejected</span>
                        <span className="stat-value">{loading ? '...' : data.stats.resolved}</span>
                    </div>
                </div>

                {/* Broadcast Announcement Section */}
                <div className="overview-section" style={{ gridColumn: '1 / -1' }}>
                    <div className="section-header">
                        <h2 className="section-title">Broadcast Announcement</h2>
                    </div>
                    <form onSubmit={handlePostAnnouncement} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                        <textarea
                            value={announcementText}
                            onChange={(e) => setAnnouncementText(e.target.value)}
                            placeholder="Type a new announcement to broadcast to all citizens..."
                            style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' }}
                        />
                        <button type="submit" className="auth-submit-btn" style={{ width: 'auto', padding: '0.8rem 1.5rem', whiteSpace: 'nowrap' }}>
                            Post Announcement
                        </button>
                    </form>
                </div>

                {/* Map View */}
                <div className="map-section" style={{ gridColumn: '1 / -1' }}>
                    <h2 className="section-title">All Issues Map</h2>
                    <div style={{ height: '400px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', zIndex: 0 }}>
                        <MapContainer center={[28.6139, 77.2090]} zoom={11} style={{ height: '100%', width: '100%', zIndex: 1 }}>
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {!loading && data.issues && data.issues.map(issue => (
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

                {/* Issue Management Table */}
                <div className="overview-section" style={{ gridColumn: '1 / -1' }}>
                    <div className="section-header">
                        <h2 className="section-title">Issue Management</h2>
                    </div>
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Issue</th>
                                    <th>Reporter</th>
                                    <th>Location</th>
                                    <th>Priority</th>
                                    <th>Status Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && <tr><td colSpan="5" style={{ textAlign: 'center' }}>Loading all issues...</td></tr>}
                                {!loading && data.issues.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center' }}>No issues found.</td></tr>}
                                {!loading && data.issues.map(issue => (
                                    <tr key={issue._id}>
                                        <td>
                                            <strong>{issue.title}</strong><br />
                                            <small style={{ color: '#64748b' }}>{issue.category}</small>
                                        </td>
                                        <td>{issue.createdBy?.name || 'Unknown'}</td>
                                        <td>{issue.location}</td>
                                        <td>
                                            {issue.priorityScore >= 50 ? (
                                                <span style={{ background: '#fee2e2', color: '#dc2626', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><AlertCircle size={14} /> Critical ({issue.priorityScore})</span>
                                            ) : issue.priorityScore >= 30 ? (
                                                <span style={{ background: '#fef3c7', color: '#d97706', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><AlertCircle size={14} /> Medium ({issue.priorityScore})</span>
                                            ) : (
                                                <span style={{ background: '#dcfce7', color: '#16a34a', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>Low ({issue.priorityScore || 0})</span>
                                            )}
                                        </td>
                                        <td>
                                            <select
                                                className={`status-select ${issue.status.toLowerCase().replace(' ', '-')}`}
                                                value={issue.status}
                                                onChange={(e) => handleStatusChange(issue._id, e.target.value)}
                                                style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer', fontWeight: '600', outline: 'none' }}
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="In Progress">In Progress</option>
                                                <option value="Resolved">Resolved</option>
                                                <option value="Rejected">Rejected</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;
