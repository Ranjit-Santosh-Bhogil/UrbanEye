import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Shield } from 'lucide-react';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState('citizen');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const res = await fetch((import.meta.env.VITE_API_BASE_URL || '') + '/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, requestedRole: role })
            });
            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('userRole', data.user.role);

                if (data.user.role === 'admin') {
                    navigate('/admin/dashboard');
                } else {
                    navigate('/dashboard');
                }
            } else {
                setError(data.error || 'Login failed');
            }
        } catch (err) {
            setError('Network error syncing with API');
        }
    };

    return (
        <div className="auth-form-inner">
            <h3 className="auth-title">Welcome Back</h3>
            <p className="auth-subtitle">Sign in to your account</p>

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

            <form onSubmit={handleLogin} className="auth-form">
                <div className="auth-input-group">
                    <label htmlFor="email">{role === 'admin' ? 'Admin Email' : 'Email Address'}</label>
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
                    <div className="auth-label-row">
                        <label htmlFor="password">Password</label>
                        <a href="#" className="forgot-password">Forgot password?</a>
                    </div>
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
                        />
                    </div>
                </div>

                <button type="submit" className="auth-submit-btn">
                    Sign In as {role === 'admin' ? 'Admin' : 'Citizen'}
                </button>
            </form>

            <div className="auth-footer">
                <p>Don't have an account? <Link to="/register" className="auth-link">Sign up</Link></p>
            </div>
        </div>
    );
};

export default Login;
