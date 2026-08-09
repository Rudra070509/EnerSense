import React, { useState } from 'react';
import PasswordInput from './PasswordInput';
import SocialButtons from './SocialButtons';
import { Check } from 'lucide-react';

export default function AuthForm({ onSuccess }) {
  const [mode, setMode] = useState('signup'); // 'signup' | 'login'
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      setLoading(false);

      if (mode === 'signup') {
        // Store name + email so the profile page can show it (no password saving for now)
        localStorage.setItem('enersense_user', JSON.stringify({ firstName, lastName, email }));

        // Switch to login mode
        setMode('login');
        setPassword('');
        onSuccess('Account created successfully! Please log in to continue.', false);
        return;
      }

      // LOGIN — just let them through for now (credential checking will come with the database)
      onSuccess('Welcome back! You have logged in successfully.', true);
    }, 1200);
  };

  const toggleMode = () => {
    setMode(mode === 'signup' ? 'login' : 'signup');
  };

  return (
    <div className="form-panel">
      {/* Title & Mode Switcher */}
      <div className="form-header">
        <h1 className="form-title">
          {mode === 'signup' ? 'Create an account' : 'Welcome back'}
        </h1>
        <p className="form-subtitle">
          {mode === 'signup' ? (
            <>
              Already have an account?{' '}
              <button type="button" className="mode-toggle-btn" onClick={toggleMode}>
                Log in
              </button>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <button type="button" className="mode-toggle-btn" onClick={toggleMode}>
                Create an account
              </button>
            </>
          )}
        </p>
      </div>

      {/* Main Auth Form */}
      <form className="auth-form" onSubmit={handleSubmit}>
        {/* Name Row (Sign up mode only) */}
        {mode === 'signup' && (
          <div className="name-grid">
            <input
              type="text"
              className="custom-input"
              placeholder="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <input
              type="text"
              className="custom-input"
              placeholder="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        )}

        {/* Email Input */}
        <input
          type="email"
          className="custom-input"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* Password Input */}
        <PasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={mode === 'signup' ? 'Enter your password' : 'Your password'}
          showStrength={mode === 'signup'}
        />

        {/* Form Options Row (Terms or Remember Me) */}
        <div className="form-options-row">
          {mode === 'signup' ? (
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                required
              />
              <span className="custom-checkbox">
                {agreeTerms && <Check size={14} strokeWidth={3} />}
              </span>
              <span>
                I agree to the{' '}
                <a href="#terms" className="terms-link" onClick={(e) => e.preventDefault()}>
                  Terms & Conditions
                </a>
              </span>
            </label>
          ) : (
            <>
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="custom-checkbox">
                  {rememberMe && <Check size={14} strokeWidth={3} />}
                </span>
                <span>Remember me</span>
              </label>

              <a href="#forgot" className="forgot-link" onClick={(e) => e.preventDefault()}>
                Forgot password?
              </a>
            </>
          )}
        </div>

        {/* Error Message */}
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

        {/* Submit Button */}
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? (
            <div className="spinner" />
          ) : (
            <span>{mode === 'signup' ? 'Create account' : 'Log in'}</span>
          )}
        </button>
      </form>

      {/* Social Logins */}
      <SocialButtons mode={mode} onGoogleSuccess={onSuccess} />
    </div>
  );
}
