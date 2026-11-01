import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { API_BASE_URL } from '../utils/api';

/**
 * SocialButtons Component
 * 
 * Renders the official Google Login OAuth button.
 */
export default function SocialButtons({ mode, onGoogleSuccess }) {
  const isSignUp = mode === 'signup';

  const handleSuccess = async (credentialResponse) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Google auth failed');
      
      localStorage.setItem('enersense_token', data.token);
      localStorage.setItem('enersense_user', JSON.stringify(data.user));
      if (onGoogleSuccess) {
        onGoogleSuccess('Google login successful!', true);
      }
    } catch (err) {
      console.error(err);
      // Wait for user to retry
    }
  };

  return (
    <div>
      <div className="divider">
        <span>{isSignUp ? 'Or register with' : 'Or log in with'}</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '15px' }}>
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => console.error('Google Login Failed')}
          useOneTap
          shape="pill"
          width="100%"
        />
      </div>
    </div>
  );
}
