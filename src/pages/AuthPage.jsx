import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNavbar from '../components/TopNavbar';
import AuthForm from '../components/AuthForm';
import Toast from '../components/Toast';

/**
 * AuthPage Component
 * 
 * This page wraps the authentication form (login/signup). 
 * It manages the high-level layout (navbar, main content area, footer) 
 * and handles the "Toast" notification pop-up for successful login/signup.
 */
export default function AuthPage() {
  // State to hold the temporary notification message
  const [toastMessage, setToastMessage] = useState('');
  const navigate = useNavigate();

  /**
   * Called by the child AuthForm component when a user successfully logs in or signs up.
   * @param {string} msg - The message to display in the toast.
   * @param {boolean} shouldNavigate - Whether to redirect to the dashboard after the toast disappears.
   */
  const handleSuccess = (msg, shouldNavigate = true) => {
    setToastMessage(msg); // Show the toast notification
    
    if (shouldNavigate) {
      // If logging in, wait 4 seconds then redirect to the Dashboard
      setTimeout(() => {
        setToastMessage('');
        navigate('/dashboard');
      }, 4000);
    } else {
      // If signing up, just hide the toast after 4 seconds (user stays on page to log in)
      setTimeout(() => setToastMessage(''), 4000);
    }
  };

  return (
    <>


      {/* Main Content Layout */}
      <div className="app-container">
        <TopNavbar />

        <main className="main-content" style={{ position: 'relative' }}>

          <div className="auth-glass-card">
            <AuthForm onSuccess={handleSuccess} />
          </div>
        </main>

        <footer className="footer-tagline">
          Capturing Moments, Creating Change &copy; {new Date().getFullYear()} EnerSense
        </footer>
      </div>

      <Toast message={toastMessage} onClose={() => setToastMessage('')} />
    </>
  );
}
