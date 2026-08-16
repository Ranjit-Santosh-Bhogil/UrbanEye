import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Shield } from 'lucide-react';
import './Login.css';

const Register = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState('citizen');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const res = await fetch((import.meta.env.VITE_API_BASE_URL || '') + '/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role })
            });
            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('token', data.token);
                if (data.user && data.user.role) {
                    localStorage.setItem('userRole', data.user.role);
                }
                navigate('/add-details');
            } else {
                // Prefer descriptive server messages (validation or error payloads)
                const errMsg = data.message || (data.details ? Object.values(data.details).join(', ') : data.error) || 'Registration failed';
                setError(errMsg);
            }
        } catch (err) {
            setError('Network error syncing with API');
        }
    };

    return (
        <div className="auth-form-inner">
            <h3 className="auth-title">Create an Account</h3>
            <p className="auth-subtitle">Join the UrbanEye platform today</p>

            {/* Role Selection Toggle */}
            <div className="role-toggle-container">
                <button
                    type="button"
                    className={`role-toggle-btn ${role === 'citizen' ? 'active' : ''}`}
                    onClick={() => setRole('citizen')}
                >
                    <User size={18} />
                    Citizen
                </button>
                <button
                    type="button"
                    className={`role-toggle-btn ${role === 'admin' ? 'active' : ''}`}
                    onClick={() => setRole('admin')}
                >
                    <Shield size={18} />
                    Admin
                </button>
            </div>

            {error && <div style={{ color: '#ff4b4b', marginBottom: '1rem', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}

            <form onSubmit={handleRegister} className="auth-form">
                <div className="auth-input-group">
                    <label htmlFor="name">Full Name</label>
                    <div className="auth-input-icon-wrapper">
                        <User className="auth-input-icon" size={20} />
                        <input
                            type="text"
                            id="name"
                            placeholder="John Doe"
                            className="auth-input"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="auth-input-group">
                    <label htmlFor="email">Email Address</label>
                    <div className="auth-input-icon-wrapper">
                        <Mail className="auth-input-icon" size={20} />
                        <input
                            type="email"
                            id="email"
                            placeholder="you@example.com"
                            className="auth-input"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="auth-input-group">
                    <label htmlFor="password">Password</label>
                    <div className="auth-input-icon-wrapper">
                        <Lock className="auth-input-icon" size={20} />
                        <input
                            type="password"
                            id="password"
                            placeholder="••••••••"
                            className="auth-input"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            minLength="6"
                        />
                    </div>
                </div>

                <button type="submit" className="auth-submit-btn" style={{ marginTop: '1rem' }}>
                    Create {role === 'admin' ? 'Admin' : 'Citizen'} Account
                </button>
            </form>

            <div className="auth-footer">
                <p>Already have an account? <Link to="/login" className="auth-link">Sign In</Link></p>
            </div>
        </div>
    );
};

export default Register;
