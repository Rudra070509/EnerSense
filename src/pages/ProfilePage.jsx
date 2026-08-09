import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, MoreHorizontal, Star, Bot, MessageSquare } from 'lucide-react';
import '../styles/profile.css';

/**
 * ProfilePage Component
 * 
 * Displays the user's profile information, contact details, and shortcuts 
 * to their AI assistant and connected devices.
 */
export default function ProfilePage() {
  const navigate = useNavigate();

  // Retrieve the saved user details from localStorage. 
  // If no user is logged in, it defaults to an empty object.
  const savedUser = JSON.parse(localStorage.getItem('enersense_user') || '{}');

  // Hardcoded profile data mixed with actual data from localStorage
  // In a real app, this would be fetched entirely from a database API.
  const [profileData] = useState({
    firstName: savedUser.firstName || '',
    lastName: savedUser.lastName || '',
    email: savedUser.email || '',
    phone: '+9110818830',
    mobile: '+7496 7141177',
    address: 'Saint-Petersburg, Russia',
  });

  // Calculate the full display name or fall back to a default
  const displayName = profileData.firstName && profileData.lastName 
    ? `${profileData.firstName} ${profileData.lastName}` 
    : profileData.firstName || profileData.email || 'Kevin Smith';

  // Extract the first letter of the user's name/email to show as an avatar placeholder
  const avatarLetter = (profileData.firstName || profileData.email || 'K')[0].toUpperCase();

  return (
    <div className="profile-wrapper">
      
      {/* Header Section (White in ref, #1e1e1e in dark) */}
      <header className="adv-header-section">
        {/* Cover Banner */}
        <div className="adv-cover-banner">
           <img src="/assets/profile_bg.avif" alt="Cover" className="adv-cover-img" />
        </div>

        {/* Profile Info Row */}
        <div className="adv-profile-container">
          <div className="adv-avatar-box">
             <div className="adv-avatar">
                {/* Fallback to letter if no image, but matching exact border and size */}
                {avatarLetter}
             </div>
          </div>
          
          <div className="adv-info-box">
             <div className="adv-name-row">
               <h1>{displayName}</h1>
               <button className="adv-more-btn"><MoreHorizontal size={18} /></button>
             </div>
             <p className="adv-title">EnerSense User · Smart Home Enthusiast</p>
          </div>
        </div>
      </header>

      {/* Main Body Section (Light grey in ref, #121212 in dark) */}
      <main className="adv-body-section">
        <div className="adv-body-container">
           
           {/* Left Sidebar */}
           <aside className="adv-sidebar">
              <div className="adv-contact-list">
                 <div className="adv-contact-row">
                    <Phone size={14} className="adv-icon-muted" />
                    <span className="adv-contact-text">{profileData.phone} <span className="adv-muted">(Office)</span></span>
                 </div>
                 <div className="adv-contact-row">
                    <span style={{width: 14}} /> {/* spacer */}
                    <span className="adv-contact-text">{profileData.mobile} <span className="adv-muted">(Mobile)</span></span>
                 </div>
                 <div className="adv-contact-row" style={{marginTop: 8}}>
                    <Mail size={14} className="adv-icon-muted" />
                    <span className="adv-contact-link">{profileData.email || 'kevin.smith@stripe.com'}</span>
                 </div>
              </div>

              <button className="adv-chat-btn">
                 <MessageSquare size={14} />
                 Feedback
              </button>

              <div className="adv-rating-box">
                 <div className="adv-rating-score">4.5</div>
                 <div className="adv-rating-details">
                    <div className="adv-stars">
                       {[1,2,3,4].map(i => <Star key={i} size={12} fill="#ffc107" color="#ffc107" />)}
                       <Star size={12} fill="none" color="#ffc107" />
                    </div>
                    <span className="adv-reviews-count">103 reviews</span>
                 </div>
              </div>
           </aside>

           {/* Right Content Area */}
           <div className="adv-content-grid">
              
              {/* AI Assistant Card */}
              <div className="adv-card adv-intro-card">
                 <div className="adv-intro-bg" />
                 <h2 className="adv-intro-title">AI Assistant</h2>
                 <button className="adv-play-btn" onClick={() => navigate('/dashboard')}>
                    <Bot size={20} color="#fff" style={{marginLeft: 0}} />
                 </button>
                 {/* Simulate the person cut-out */}
                 <div className="adv-person-cutout">
                    <div className="adv-person-placeholder">{avatarLetter}</div>
                 </div>
              </div>

              {/* Connected Devices Card */}
              <div className="adv-card adv-calc-card">
                 <h3 className="adv-calc-title">CONNECTED DEVICES</h3>
                 <div className="adv-calc-illustration">
                    {/* Abstract representation of connected devices */}
                    <div className="adv-devices-graphic">
                       <div className="adv-device-node active"></div>
                       <div className="adv-device-node"></div>
                       <div className="adv-device-node active"></div>
                       <div className="adv-device-node"></div>
                    </div>
                 </div>
                 <p className="adv-calc-desc">4 smart appliances currently being monitored.</p>
                 <div className="adv-calc-dots">
                    <span className="adv-dot active"></span>
                    <span className="adv-dot"></span>
                 </div>
                 <button className="adv-calc-btn">Manage →</button>
              </div>

           </div>
        </div>
      </main>

    </div>
  );
}
