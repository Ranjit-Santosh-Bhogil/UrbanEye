import { useState, useEffect } from 'react';
import { User, Loader } from 'lucide-react';
import './Profile.css';

const Profile = () => {
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        mobile: '',
        address: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch((import.meta.env.VITE_API_BASE_URL || '') + '/api/users/profile', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    setProfileData({
                        name: data.name || '',
                        email: data.email || '',
                        mobile: data.mobile || '',
                        address: data.address || ''
                    });
                } else {
                    setMessage({ type: 'error', text: 'Failed to load profile data.' });
                }
            } catch (err) {
                console.error('Error fetching profile:', err);
                setMessage({ type: 'error', text: 'Network error occurred.' });
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setProfileData({ ...profileData, [e.target.id]: e.target.value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('token');
            const res = await fetch((import.meta.env.VITE_API_BASE_URL || '') + '/api/users/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profileData)
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            } else {
                setMessage({ type: 'error', text: 'Failed to update profile.' });
            }
        } catch (err) {
            console.error('Error updating profile:', err);
            setMessage({ type: 'error', text: 'Network error occurred.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <Loader className="spinner" size={40} />
            </div>
        );
    }

    return (
        <div className="page-container animate-fade-in">
            <h1 className="page-title">My Profile</h1>

            <div className="profile-layout">
                <div className="profile-avatar-section">
                    <div className="avatar-circle">
                        <User size={100} strokeWidth={1} />
                    </div>
                </div>

                <div className="profile-form-section">
                    <form onSubmit={handleSave}>
                        {message.text && (
                            <div style={{
                                padding: '0.8rem', marginBottom: '1rem', borderRadius: '4px', textAlign: 'center',
                                backgroundColor: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                color: message.type === 'success' ? '#10b981' : '#ef4444', border: '1px solid currentColor'
                            }}>
                                {message.text}
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="name" className="form-label">Name</label>
                            <input type="text" id="name" className="form-input" value={profileData.name} onChange={handleChange} required />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email" className="form-label">Email</label>
                            <input type="email" id="email" className="form-input" value={profileData.email} onChange={handleChange} required />
                        </div>

                        <div className="form-group">
                            <label htmlFor="mobile" className="form-label">Phone Number</label>
                            <div className="input-with-button">
                                <input type="tel" id="mobile" className="form-input" value={profileData.mobile} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="address" className="form-label">Address</label>
                            <input type="text" id="address" className="form-input" value={profileData.address} onChange={handleChange} />
                        </div>

                        <button type="submit" className="btn-save" disabled={saving}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
