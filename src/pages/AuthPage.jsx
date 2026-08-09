import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNavbar from '../components/TopNavbar';
import AuthForm from '../components/AuthForm';
import Toast from '../components/Toast';

export default function AuthPage() {
  const [toastMessage, setToastMessage] = useState('');
  const navigate = useNavigate();

  const handleSuccess = (msg, shouldNavigate = true) => {
    setToastMessage(msg);
    if (shouldNavigate) {
      setTimeout(() => {
        setToastMessage('');
        navigate('/dashboard');
      }, 4000);
    } else {
      // Just show toast, stay on auth page (signup case)
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
