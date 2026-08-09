import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function PasswordInput({ value, onChange, placeholder = "Enter your password", showStrength = false }) {
  const [showPassword, setShowPassword] = useState(false);

  // Simple strength score: 0 to 4
  const getStrength = (pass) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 10) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = getStrength(value);

  const getStrengthColor = (s) => {
    if (s <= 1) return '#ef4444'; // Red
    if (s === 2) return '#f59e0b'; // Amber
    if (s === 3) return '#3b82f6'; // Blue
    return '#10b981'; // Emerald
  };

  return (
    <div className="input-group">
      <div className="password-wrapper">
        <input
          type={showPassword ? 'text' : 'password'}
          className="custom-input"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required
        />
        <button
          type="button"
          className="password-toggle-icon"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {showStrength && value.length > 0 && (
        <div style={{ display: 'flex', gap: '4px', marginTop: '6px', alignItems: 'center' }}>
          {[1, 2, 3, 4].map((level) => (
            <div
              key={level}
              style={{
                flex: 1,
                height: '3px',
                borderRadius: '2px',
                backgroundColor: level <= strength ? getStrengthColor(strength) : 'rgba(255, 255, 255, 0.1)',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '6px' }}>
            {strength <= 1 ? 'Weak' : strength === 2 ? 'Medium' : strength === 3 ? 'Strong' : 'Very Strong'}
          </span>
        </div>
      )}
    </div>
  );
}
