import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Mail, Phone, MoreHorizontal, Play, Star, Facebook, Twitter, Linkedin, CheckCircle, Bot, MessageSquare } from 'lucide-react';
import '../styles/profile.css';

export default function ProfilePage() {
  const navigate = useNavigate();

  const savedUser = JSON.parse(localStorage.getItem('enersense_user') || '{}');

  const [profileData] = useState({
    firstName: savedUser.firstName || '',
    lastName: savedUser.lastName || '',
    email: savedUser.email || '',
    phone: '+9110818830',
    mobile: '+7496 7141177',
    address: 'Saint-Petersburg, Russia',
  });

  const displayName = profileData.firstName && profileData.lastName 
    ? `${profileData.firstName} ${profileData.lastName}` 
    : profileData.firstName || profileData.email || 'Kevin Smith';

  const avatarLetter = (profileData.firstName || profileData.email || 'K')[0].toUpperCase();

  return (
    <div className="profile-wrapper">
      
      {/* EnerSense Topbar */}
      <nav className="adv-nav" style={{ padding: '16px 32px' }}>
        <div className="adv-nav-left" style={{ gap: '16px' }}>
          <button onClick={() => navigate('/dashboard')} style={{ background: 'transparent', border: '1px solid #333', borderRadius: '12px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#2a2a2a'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <ArrowLeft size={18} />
          </button>
          <div className="adv-logo" onClick={() => navigate('/dashboard')} style={{ fontSize: '20px', letterSpacing: '-0.5px', color: '#888' }}>
            ener<strong style={{ color: '#fff' }}>sense</strong>
          </div>
        </div>
        <div className="adv-nav-right">
          {/* Empty right side to keep it clean */}
        </div>
      </nav>

      {/* Header Section (White in ref, #1e1e1e in dark) */}
      <header className="adv-header-section">
        {/* Cover Banner */}
        <div className="adv-cover-banner">
           {/* Using the dunes artifact as a mountain-like cover */}
           <img src="/purple_dunes_hero_1785467066074.jpg" alt="Cover" className="adv-cover-img" />
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
             
             <div className="adv-social-row">
                <span className="adv-social-item"><MapPin size={12} /> {profileData.address}</span>
                <span className="adv-social-item"><CheckCircle size={12} color="#4db6ac" /> Active Member</span>
                <span className="adv-social-item">⚡ Premium Plan</span>
             </div>
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
