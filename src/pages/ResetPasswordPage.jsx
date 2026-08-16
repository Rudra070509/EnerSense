import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PasswordInput from '../components/PasswordInput';
import TopNavbar from '../components/TopNavbar';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="app-container">
        <TopNavbar />
        <main className="main-content" style={{ position: 'relative' }}>
          <div className="auth-glass-card">
            <div className="form-panel">
              <h1 className="form-title" style={{ color: '#ef4444' }}>Invalid Link</h1>
              <p className="form-subtitle">No reset token was provided in the URL.</p>
              <button className="submit-btn" onClick={() => navigate('/login')}>Back to Login</button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-container">
      <TopNavbar />
      <main className="main-content" style={{ position: 'relative' }}>
        <div className="auth-glass-card">
          <div className="form-panel">
            <div className="form-header">
              <h1 className="form-title">Enter New Password</h1>
              <p className="form-subtitle">Please enter your new password below.</p>
            </div>

            {success ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <h3 style={{ color: '#22c55e', marginBottom: '10px' }}>Password Reset Successful!</h3>
                <p style={{ color: '#94a3b8' }}>Redirecting to login...</p>
              </div>
            ) : (
              <form className="auth-form" onSubmit={handleSubmit}>
                <PasswordInput
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="New password"
                  showStrength={true}
                />
                <PasswordInput
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  showStrength={false}
                />

                {error && (
                  <div style={{ 
                    color: '#ef4444', 
                    fontSize: '13px', 
                    textAlign: 'center', 
                    padding: '10px 16px', 
                    background: 'rgba(239, 68, 68, 0.08)', 
                    borderRadius: '12px', 
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    marginBottom: '4px'
                  }}>
                    {error}
                  </div>
                )}

                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? <div className="spinner" /> : <span>Reset Password</span>}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
      <footer className="footer-tagline">
        Capturing Moments, Creating Change &copy; {new Date().getFullYear()} EnerSense
      </footer>
    </div>
  );
}
