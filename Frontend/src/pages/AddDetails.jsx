import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, MapPin, Building2, Users } from 'lucide-react';
import './Login.css';

const AddDetails = () => {
    const navigate = useNavigate();
    const [mobile, setMobile] = useState('');
    const [district, setDistrict] = useState('');
    const [city, setCity] = useState('');
    const [role, setRole] = useState('');
    const [error, setError] = useState(null);

    const handleComplete = async (e) => {
        e.preventDefault();
        setError(null);
            try {
            const token = localStorage.getItem('token');
                // Normalize mobile to 10 digits (backend expects exactly 10 digits)
                const digits = (mobile || '').replace(/\D/g, '');
                const normalizedMobile = digits.length > 10 ? digits.slice(-10) : digits;

                const res = await fetch((import.meta.env.VITE_API_BASE_URL || '') + '/api/auth/details', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ mobile: normalizedMobile, district, city, role })
            });
            const data = await res.json();

            if (res.ok) {
                if (data.user && data.user.role) {
                    localStorage.setItem('userRole', data.user.role);
                }
                const finalRole = data.user?.role || localStorage.getItem('userRole');
                if (finalRole === 'admin') {
                    navigate('/admin/dashboard');
                } else {
                    navigate('/dashboard');
                }
            } else {
                const errMsg = data.message || (data.details ? Object.values(data.details).join(', ') : data.error) || 'Failed to update details';
                setError(errMsg);
            }
            } catch (err) {
                setError('Network error syncing with API');
        }
    };

    return (
        <div className="auth-form-inner">
            <h3 className="auth-title">Complete Your Profile</h3>
            <p className="auth-subtitle">Just a few more details before we start</p>

            {error && <div style={{ color: '#ff4b4b', marginBottom: '1rem', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}

            <form onSubmit={handleComplete} className="auth-form">
                <div className="auth-input-group">
                    <label htmlFor="mobile">Mobile Number</label>
                    <div className="auth-input-icon-wrapper">
                        <Phone className="auth-input-icon" size={20} />
                        <input
                            type="tel"
                            id="mobile"
                            placeholder="+91 9876543210"
                            className="auth-input"
                            value={mobile}
                            onChange={e => setMobile(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="auth-input-group">
                    <label htmlFor="district">District</label>
                    <div className="auth-input-icon-wrapper">
                        <MapPin className="auth-input-icon" size={20} />
                        <input
                            type="text"
                            id="district"
                            placeholder="Enter your district"
                            className="auth-input"
                            value={district}
                            onChange={e => setDistrict(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="auth-input-group">
                    <label htmlFor="city">City</label>
                    <div className="auth-input-icon-wrapper">
                        <Building2 className="auth-input-icon" size={20} />
                        <input
                            type="text"
                            id="city"
                            placeholder="Enter your city"
                            className="auth-input"
                            value={city}
                            onChange={e => setCity(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="auth-input-group">
                    <label htmlFor="userType">Type of User</label>
                    <div className="auth-input-icon-wrapper">
                        <Users className="auth-input-icon" size={20} />
                        <select
                            id="userType"
                            className="auth-input"
                            value={role}
                            onChange={e => setRole(e.target.value)}
                            required
                            style={{ appearance: 'none' }}
                        >
                            <option value="" disabled>Select user type</option>
                            <option value="citizen">Citizen</option>
                            <option value="ngo">NGO Representative</option>
                            <option value="government">Government Official</option>
                            <option value="admin">Administrator</option>
                        </select>
                    </div>
                </div>

                <button type="submit" className="auth-submit-btn" style={{ marginTop: '1rem' }}>
                    Continue to Dashboard
                </button>
            </form>
        </div>
    );
};

export default AddDetails;
