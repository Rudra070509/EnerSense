import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, Star, Bot, MessageSquare, Globe, ArrowLeft, Sparkles, LogOut, Edit3, Save, X, User, LayoutDashboard, Cpu, LineChart as LineChartIcon, FileText } from 'lucide-react';
import Toast from '../components/Toast';
import GlassSurface from '../components/GlassSurface/GlassSurface';
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
  const [profileData, setProfileData] = useState({
    firstName: savedUser.firstName || '',
    lastName: savedUser.lastName || '',
    email: savedUser.email || '',
    phone: savedUser.phone || '+9110818830',
    mobile: savedUser.mobile || '+7496 7141177',
    address: savedUser.address || 'Saint-Petersburg, Russia',
  });

  const [isEditing, setIsEditing] = useState(false);
  
  // Temporary state for the form so we can cancel without saving
  const [editFormData, setEditFormData] = useState({ ...profileData });

  const handleSave = () => {
    setProfileData(editFormData);
    const updatedUser = { ...savedUser, ...editFormData };
    localStorage.setItem('enersense_user', JSON.stringify(updatedUser));
    setIsEditing(false);
    setToastMessage('Profile updated successfully!');
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleCancel = () => {
    setEditFormData({ ...profileData });
    setIsEditing(false);
  };

  const handleChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  // State to handle the interactive 5-star rating system
  const [rating, setRating] = useState(0);
  
  // State for the notification toast
  const [toastMessage, setToastMessage] = useState('');

  // Energy Tips array
  const tips = [
    "Unplugging electronics when not in use can save up to 10% on your energy bill.",
    "Washing clothes in cold water saves a significant amount of energy used for heating.",
    "LED bulbs use 75% less energy and last 25 times longer than incandescent lighting.",
    "Lowering your thermostat by just 2 degrees in winter can save 5% on heating costs."
  ];
  // Select a random tip to display
  const [tipOfTheDay] = useState(tips[Math.floor(Math.random() * tips.length)]);

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
           <img src="/assets/site_bg.jpeg" alt="Cover" className="adv-cover-img" />
           <button className="adv-back-btn" onClick={() => navigate('/dashboard')}>
              <ArrowLeft size={20} />
              <span>Dashboard</span>
           </button>
           <button 
              className="adv-signout-btn" 
              onClick={() => {
                  localStorage.removeItem('enersense_user');
                  navigate('/');
              }}
           >
              <LogOut size={16} />
              <span>Sign Out</span>
           </button>
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
               {isEditing ? (
                  <div style={{ display: 'flex', gap: '8px' }}>
                     <input type="text" name="firstName" value={editFormData.firstName} onChange={handleChange} className="adv-input adv-input-large" placeholder="First Name" />
                     <input type="text" name="lastName" value={editFormData.lastName} onChange={handleChange} className="adv-input adv-input-large" placeholder="Last Name" />
                  </div>
               ) : (
                  <h1>{displayName}</h1>
               )}
               
               <div style={{ display: 'flex', gap: '12px' }}>
                  {isEditing ? (
                     <>
                        <button className="adv-action-btn adv-cancel" onClick={handleCancel}>
                           <X size={16} /> Cancel
                        </button>
                        <button className="adv-action-btn adv-save" onClick={handleSave}>
                           <Save size={16} /> Save
                        </button>
                     </>
                  ) : (
                     <button className="adv-action-btn adv-edit" onClick={() => setIsEditing(true)}>
                        <Edit3 size={16} /> Edit Profile
                     </button>
                  )}
               </div>
             </div>
             <p className="adv-title" style={{ marginTop: isEditing ? '12px' : '0' }}>EnerSense User · Smart Home Enthusiast</p>
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
                     <Phone size={16} className="adv-icon-muted" />
                     {isEditing ? (
                        <input type="text" name="phone" value={editFormData.phone} onChange={handleChange} className="adv-input" placeholder="Phone" />
                     ) : (
                        <span className="adv-contact-text">{profileData.phone}</span>
                     )}
                  </div>
                  <div className="adv-contact-row" style={{marginTop: 8}}>
                     <Mail size={16} className="adv-icon-muted" />
                     {isEditing ? (
                        <input type="email" name="email" value={editFormData.email} onChange={handleChange} className="adv-input" placeholder="Email" />
                     ) : (
                        <span className="adv-contact-link">{profileData.email || 'kevin.smith@stripe.com'}</span>
                     )}
                  </div>
              </div>

              {/* Feedback & Review Card */}
              <div className="adv-feedback-card">
                 <h4 className="adv-feedback-title">Rate your experience</h4>
                 <div className="adv-stars" style={{ justifyContent: 'center', margin: '16px 0', gap: '8px' }}>
                    {[1,2,3,4,5].map(i => (
                       <Star 
                          key={i} 
                          size={24} 
                          fill={i <= rating ? "#ffc107" : "none"} 
                          color={i <= rating ? "#ffc107" : "#555"} 
                          style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                          onClick={() => setRating(i)}
                       />
                    ))}
                 </div>
                 <button 
                    className="adv-chat-btn"
                    onClick={() => {
                       if (rating === 0) {
                           setToastMessage('Please select a star rating first!');
                       } else {
                           setToastMessage(`Thanks for your ${rating}-star feedback!`);
                           // Clear rating after submission
                           setTimeout(() => setRating(0), 2000);
                       }
                       
                       // Hide toast automatically after 3 seconds
                       setTimeout(() => setToastMessage(''), 3000);
                    }}
                 >
                    <MessageSquare size={14} />
                    Leave Feedback
                 </button>
              </div>
           </aside>

           {/* Right Content Area */}
           <div className="adv-content-grid">
              
              {/* Energy Persona Card (White Theme) */}
              <div className="adv-card persona-white-card">
                 <div className="persona-badge">Energy Persona</div>
                 <div className="persona-icon-container">
                    <Globe color="#fff" size={24} strokeWidth={1.5} />
                 </div>
                 <div className="persona-subtitle">YOU ARE A</div>
                 <h2 className="persona-title">System<br/>Saver</h2>
              </div>

              {/* Tip of the Day Card */}
              <div className="adv-card tip-white-card">
                 <div className="tip-header">
                    <Sparkles size={22} color="#ec4899" />
                    <h3 className="tip-title">TIP OF THE DAY</h3>
                 </div>
                 
                 <div className="tip-content-box">
                    <div className="tip-quote-mark">"</div>
                    <p className="tip-text">
                       {tipOfTheDay}
                    </p>
                 </div>
              </div>

           </div>
        </div>
      </main>

      {/* Render the Toast notification component at the root level */}
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />
    </div>
  );
}
