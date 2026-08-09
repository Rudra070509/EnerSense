import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import all top-level page components
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';

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
      {/* 
        Global Plasma Background: 
        This div is fixed to the back of the screen (zIndex: -1) so it 
        always renders behind the page content on every route.
      */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1 }}>
        <Plasma speed={0.5} />
      </div>
      
      {/* 
        Routes definition: 
        Maps specific URL paths to the corresponding page components.
      */}
      <Routes>
        {/* The main marketing / landing page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* The sign up / sign in page */}
        <Route path="/login" element={<AuthPage />} />
        
        {/* The main dashboard where energy stats and AI chat live */}
        <Route path="/dashboard" element={<DashboardPage />} />
        
        {/* The user's account settings and profile page */}
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </BrowserRouter>
  );
}
