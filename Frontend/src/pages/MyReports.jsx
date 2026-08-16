import { useState, useEffect } from 'react';
import { Filter } from 'lucide-react';
import './MyReports.css';

const MyReports = () => {
    const [filter, setFilter] = useState('all');
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch((import.meta.env.VITE_API_BASE_URL || '') + '/api/issues/my-reports', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setReports(data);
                }
            } catch (error) {
                console.error('Error fetching reports:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

    const filterOptions = [
        { label: 'All', value: 'all' },
        { label: 'Pending', value: 'pending' },
        { label: 'In Progress', value: 'in-progress' },
        { label: 'Resolved', value: 'resolved' },
    ];

    const filteredReports = reports.filter(r => {
        if (filter === 'all') return true;
        if (filter === 'pending' && r.status === 'Pending') return true;
        if (filter === 'in-progress' && r.status === 'In Progress') return true;
        if (filter === 'resolved' && (r.status === 'Resolved' || r.status === 'Rejected')) return true;
        return false;
    });

    return (
        <div className="page-container animate-fade-in">
            {selectedImage && (
                <div
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1000,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem',
                        backdropFilter: 'blur(4px)'
                    }}
                    onClick={() => setSelectedImage(null)}
                >
                    <img
                        src={selectedImage}
                        alt="Full Issue"
                        style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '8px', objectFit: 'contain', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
                        onClick={(e) => e.stopPropagation()}
                    />
                    <button
                        onClick={() => setSelectedImage(null)}
                        style={{ position: 'absolute', top: '1.5rem', right: '2.5rem', color: '#fff', fontSize: '2.5rem', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                        &times;
                    </button>
                </div>
            )}

            <h1 className="page-title">My Reports</h1>

            <div className="filter-bar">
                {filterOptions.map(option => (
                    <button
                        key={option.value}
                        className={`filter-btn ${filter === option.value ? 'active' : ''}`}
                        onClick={() => setFilter(option.value)}
                    >
                        {option.label}
                    </button>
                ))}
            </div>

            <div className="reports-container">
                <div className="table-container">
                    {loading ? (
                        <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>Loading reports...</p>
                    ) : filteredReports.length === 0 ? (
                        <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>No reports found.</p>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Issue Details</th>
                                    <th>Date Reported</th>
                                    <th>Location</th>
                                    <th>Status</th>
                                    <th>Upvotes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredReports.map((report) => (
                                    <tr key={report._id}>
                                        <td>
                                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                {report.imageUrl ? (
                                                    <img
                                                        src={report.imageUrl}
                                                        alt="Issue"
                                                        onClick={() => setSelectedImage(report.imageUrl)}
                                                        style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--color-border)', cursor: 'pointer' }}
                                                    />
                                                ) : (
                                                    <div style={{ width: '48px', height: '48px', background: 'var(--color-surface-hover)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: '0.7rem', border: '1px dashed var(--color-border)' }}>No Img</div>
                                                )}
                                                <div>
                                                    <strong>{report.title}</strong>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>{report.category}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{new Date(report.createdAt).toLocaleDateString()}</td>
                                        <td>{report.location}</td>
                                        <td>
                                            <span className={`status-badge ${report.status.toLowerCase().replace(' ', '-')}`}>
                                                {report.status}
                                            </span>
                                        </td>
                                        <td>{report.upvotes?.length || 0}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyReports;
