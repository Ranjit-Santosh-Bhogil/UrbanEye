import React, { useState, useEffect } from 'react';
import { Search, MapPin, ArrowUp } from 'lucide-react';
import './NearbyIssues.css';

const NearbyIssues = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [userId, setUserId] = useState(null);
    const [expandedIssueId, setExpandedIssueId] = useState(null);
    const [feedbackText, setFeedbackText] = useState('');

    useEffect(() => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUserId(payload.user.id);
            }
        } catch (e) {
            console.error('Failed to parse token');
        }
    }, []);

    const handleUpvote = async (issueId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/issues/${issueId}/upvote`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const updatedIssue = await res.json();
                setIssues(prev => prev.map(issue => issue._id === issueId ? updatedIssue : issue));
            }
        } catch (err) {
            console.error('Upvote failed:', err);
        }
    };

    const handleFeedbackSubmit = async (e, issueId) => {
        e.preventDefault();
        if (!feedbackText.trim()) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/issues/${issueId}/feedback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ text: feedbackText })
            });

            if (res.ok) {
                const updatedIssue = await res.json();
                setIssues(prev => prev.map(issue => issue._id === issueId ? updatedIssue : issue));
                setFeedbackText('');
            }
        } catch (err) {
            console.error('Feedback failed:', err);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;

        setLoading(true);
        setHasSearched(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/issues/nearby?location=${encodeURIComponent(searchTerm)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setIssues(data);
            } else {
                setError('Failed to fetch nearby issues.');
                setIssues([]);
            }
        } catch (err) {
            setError('Network error.');
            setIssues([]);
        } finally {
            setLoading(false);
        }
    };

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

            <h1 className="page-title">Nearby Issues</h1>

            <div className="search-container">
                <form onSubmit={handleSearch} className="search-form">
                    <div className="search-input-wrapper">
                        <MapPin className="search-icon" size={20} />
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Enter your location, neighborhood, or city..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn-search" disabled={loading}>
                        {loading ? 'Searching...' : <><Search size={20} /> Search</>}
                    </button>
                </form>
            </div>

            <div className="reports-container">
                {error && <div style={{ color: 'var(--color-warning)', padding: '1rem', textAlign: 'center' }}>{error}</div>}

                {hasSearched && !loading && issues.length === 0 && !error && (
                    <div className="empty-state">
                        <p>No issues found in "{searchTerm}". Great news for your neighborhood!</p>
                    </div>
                )}

                {issues.length > 0 && (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Issue Details</th>
                                    <th>Date Reported</th>
                                    <th>Exact Location</th>
                                    <th>Status</th>
                                    <th>Upvote</th>
                                </tr>
                            </thead>
                            <tbody>
                                {issues.map((report) => (
                                    <React.Fragment key={report._id}>
                                        <tr onClick={() => setExpandedIssueId(expandedIssueId === report._id ? null : report._id)} style={{ cursor: 'pointer' }}>
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
                                            <td>
                                                <button
                                                    onClick={() => handleUpvote(report._id)}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                                                        background: report.upvotes?.includes(userId) ? 'rgba(16, 185, 129, 0.1)' : 'var(--color-surface-hover)',
                                                        border: '1px solid',
                                                        borderColor: report.upvotes?.includes(userId) ? 'var(--color-primary)' : 'var(--color-border)',
                                                        padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-md)',
                                                        cursor: 'pointer',
                                                        color: report.upvotes?.includes(userId) ? 'var(--color-primary)' : 'var(--color-text-muted)',
                                                        fontWeight: 600, transition: 'all var(--transition-fast)'
                                                    }}
                                                >
                                                    <ArrowUp size={16} />
                                                    {report.upvotes?.length || 0}
                                                </button>
                                            </td>
                                        </tr>
                                        {expandedIssueId === report._id && (
                                            <tr style={{ background: 'var(--color-background)' }}>
                                                <td colSpan="5" style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
                                                    <div style={{ marginBottom: '1rem' }}>
                                                        <h4 style={{ marginBottom: '0.8rem', fontSize: '1rem', color: 'var(--color-text)' }}>Feedback & Updates</h4>
                                                        {report.feedbacks && report.feedbacks.length > 0 ? (
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', background: '#fff', padding: '1rem', borderRadius: '8px', border: '1px solid var(--color-border)', maxHeight: '200px', overflowY: 'auto' }}>
                                                                {report.feedbacks.map((fb, idx) => (
                                                                    <div key={idx} style={{ paddingBottom: idx !== report.feedbacks.length - 1 ? '0.8rem' : '0', borderBottom: idx !== report.feedbacks.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                                                                        <div style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--color-primary)' }}>{fb.user?.name || 'User'}</div>
                                                                        <div style={{ fontSize: '0.9rem', color: 'var(--color-text)', marginTop: '0.2rem' }}>{fb.text}</div>
                                                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.3rem' }}>{new Date(fb.createdAt).toLocaleString()}</div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', fontStyle: 'italic', background: '#fff', padding: '1rem', borderRadius: '8px', border: '1px dashed var(--color-border)' }}>No feedback yet. Be the first to add an update!</p>
                                                        )}
                                                    </div>

                                                    <form onSubmit={(e) => handleFeedbackSubmit(e, report._id)} style={{ display: 'flex', gap: '1rem' }}>
                                                        <input
                                                            type="text"
                                                            placeholder="Type your feedback..."
                                                            value={feedbackText}
                                                            onChange={(e) => setFeedbackText(e.target.value)}
                                                            onClick={(e) => e.stopPropagation()}
                                                            style={{ flex: 1, padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid var(--color-border)', outline: 'none' }}
                                                        />
                                                        <button
                                                            type="submit"
                                                            className="btn-search"
                                                            style={{ width: 'auto', padding: '0.8rem 1.5rem', borderRadius: '8px' }}
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            Post
                                                        </button>
                                                    </form>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NearbyIssues;
