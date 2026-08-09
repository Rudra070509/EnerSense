import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/**
 * PasswordInput Component
 * 
 * A reusable password input field that includes:
 * 1. A toggle to show/hide the password text.
 * 2. An optional password strength meter (used during signup).
 */
export default function PasswordInput({ value, onChange, placeholder = "Enter your password", showStrength = false }) {
  // State to track if the password text is visible or hidden (dots)
  const [showPassword, setShowPassword] = useState(false);

  /**
   * Calculates a simple password strength score from 0 to 4 based on complexity rules.
   * @param {string} pass - The password string to evaluate.
   * @returns {number} Score from 0 (weak) to 4 (very strong).
   */
  const getStrength = (pass) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 6) score++; // Minimum length
    if (pass.length >= 10) score++; // Better length
    if (/[A-Z]/.test(pass)) score++; // Contains uppercase
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score++; // Contains number or special char
    return score;
  };

  const strength = getStrength(value);

  /**
   * Maps a strength score to a UI color.
   */
  const getStrengthColor = (s) => {
    if (s <= 1) return '#ef4444'; // Red (Weak)
    if (s === 2) return '#f59e0b'; // Amber (Medium)
    if (s === 3) return '#3b82f6'; // Blue (Strong)
    return '#10b981'; // Emerald (Very Strong)
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
