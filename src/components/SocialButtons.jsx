import React from 'react';

/**
 * SocialButtons Component
 * 
 * Renders the "Continue with Google" OAuth button.
 * Currently simulates the flow by redirecting to Google's actual sign-in page.
 */
export default function SocialButtons({ mode }) {
  const isSignUp = mode === 'signup';

  /**
   * Redirects the user to the Google Account login page to simulate OAuth.
   * In production, this would use Firebase Auth or next-auth.
   */
  const handleGoogleLogin = () => {
    // Open official Google Account Sign-In / Authenticator page
    window.location.href = 'https://accounts.google.com/v3/signin/identifier?continue=https%3A%2F%2Fmyaccount.google.com%2F&flowName=GlifWebSignIn&flowEntry=ServiceLogin';
  };

  return (
    <div>
      <div className="divider">
        <span>{isSignUp ? 'Or register with' : 'Or log in with'}</span>
      </div>

      <div style={{ width: '100%' }}>
        <button 
          type="button" 
          className="social-btn"
          style={{ width: '100%', height: '50px', fontSize: '15px' }}
          onClick={handleGoogleLogin}
        >
          {/* Google SVG Logo */}
          <svg viewBox="0 0 24 24" width="22" height="22">
            <path
              fill="#EA4335"
              d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.3 8.9 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
            />
            <path
              fill="#FBBC05"
              d="M5.3 14.8c-.3-.8-.4-1.7-.4-2.8s.1-2 .4-2.8L1.6 6.3C.6 8.3 0 10.1 0 12s.6 3.7 1.6 5.7l3.7-2.9z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.3-6.7-5.3L1.6 16C3.5 19.8 7.4 23 12 23z"
            />
          </svg>
          Continue with Google
        </button>
      </div>
    </div>
  );
}
