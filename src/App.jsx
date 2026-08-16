import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

function GlobalBackground() {
  const location = useLocation();
  
  // Hide the global plasma on the appliances page
  if (location.pathname === '/appliances') return null;
  
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1 }}>
      <Plasma speed={0.5} />
    </div>
  );
}

// Import all top-level page components
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import AppliancesPage from './pages/AppliancesPage';
import AlertsPage from './pages/AlertsPage';

// Import the global background effect component
import Plasma from './components/PlasmaBackground/Plasma';

// Global stylesheet
import './styles/index.css';

/**
 * App Component
 * 
 * This is the root component of the application. It handles routing 
 * (switching between different pages like Dashboard, Login, etc.) and 
 * provides global elements like the animated Plasma background that 
 * persist across all routes.
 */
export default function App() {
  return (
    <BrowserRouter>
      <GlobalBackground />
      
      {/* 
        Routes definition: 
        Maps specific URL paths to the corresponding page components.
      */}
      <Routes>
        {/* The main marketing / landing page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* The sign up / sign in page */}
        <Route path="/login" element={<AuthPage />} />
        
        {/* The reset password page */}
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        
        {/* The main dashboard where energy stats and AI chat live */}
        <Route path="/dashboard" element={<DashboardPage />} />
        
        {/* The user's account settings and profile page */}
        <Route path="/profile" element={<ProfilePage />} />
        
        {/* The appliances page */}
        <Route path="/appliances" element={<AppliancesPage />} />
        
        {/* The alerts page */}
        <Route path="/alerts" element={<AlertsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
