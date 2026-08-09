import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react'; // Icon used for the close button in the modal

/**
 * LandingPage Component
 * 
 * This is the public-facing marketing page. It features a hero section, 
 * an "About Us" section for the team, and a "Support" section. 
 * It also includes a scroll-spy effect to highlight the current section 
 * in the navbar, and a 3D glassmorphic modal to explain the project.
 */
export default function LandingPage() {
  // Tracks which section (home, about, contact) is currently visible on screen
  const [activeSection, setActiveSection] = useState('home');
  
  // Controls whether the "Learn More" pop-up modal is visible
  const [isLearnMoreModalOpen, setIsLearnMoreModalOpen] = useState(false);

  // Set up a scroll listener to update the active navbar link as the user scrolls
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'contact'];
      let currentSection = 'home';

      // Check the position of each section on the page
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          // If the top of the section has reached the top half of the viewport,
          // mark it as the current active section.
          if (rect.top <= window.innerHeight / 2) {
            currentSection = section;
          }
        }
      }
      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>


      <div id="home" className="landing-container">
        {/* Landing Specific Navbar */}
        <header className="landing-navbar">
          <div className="brand-logo">
            {/* Logo removed for landing page */}
          </div>

          <nav className="landing-nav-links">
            <a href="#home" className={`nav-link ${activeSection === 'home' ? 'active' : ''}`}>HOME</a>
            <a href="#about" className={`nav-link ${activeSection === 'about' ? 'active' : ''}`}>ABOUT US</a>
            <a href="#contact" className={`nav-link ${activeSection === 'contact' ? 'active' : ''}`}>SUPPORT</a>
          </nav>

          <div className="landing-nav-actions">
            <Link to="/login" className="sign-in-btn">
              SIGN IN
            </Link>
          </div>
        </header>

        {/* 
          Home / Hero Section:
          The main welcome area. Clicking "LEARN MORE" opens the modal. 
        */}
        <section className="landing-section hero-section">
          <main className="landing-hero">
            <h1 className="hero-title">ENERSENSE</h1>
            <p className="hero-description">
              Stop guessing. Start knowing.<br />
              Track every appliance, predict your bill early, and cut costs before they add up.
            </p>
            <button 
              onClick={(e) => {
                e.preventDefault();
                setIsLearnMoreModalOpen(true); // Open the modal
              }} 
              className="learn-more-btn"
            >
              LEARN MORE
            </button>
          </main>
        </section>

        {/* About Us Section */}
        <section id="about" className="landing-section">
          <div className="section-content">
            <h2 className="section-title">ABOUT US</h2>
            <p className="section-subtitle">The team behind EnerSense.</p>
            
            <div className="team-grid">
              {/* Developer 1 Placeholder */}
              <div className="glass-panel team-card">
                <div className="team-avatar"></div>
                <h3 className="team-name">[Developer Name]</h3>
                <p className="team-roll">Roll No: [Number]</p>
                <p className="team-role">Role: [Project Role / What they did]</p>
              </div>

              {/* Developer 2 Placeholder */}
              <div className="glass-panel team-card">
                <div className="team-avatar"></div>
                <h3 className="team-name">[Developer Name]</h3>
                <p className="team-roll">Roll No: [Number]</p>
                <p className="team-role">Role: [Project Role / What they did]</p>
              </div>

              {/* Developer 3 Placeholder */}
              <div className="glass-panel team-card">
                <div className="team-avatar"></div>
                <h3 className="team-name">[Developer Name]</h3>
                <p className="team-roll">Roll No: [Number]</p>
                <p className="team-role">Role: [Project Role / What they did]</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Us Section */}
        <section id="contact" className="landing-section matte-section">
          <div className="section-content">
            <h2 className="section-title">SUPPORT</h2>
            <p className="section-subtitle">Get in touch with the team.</p>
            
            <div className="glass-panel contact-card">
              <div className="contact-info">
                <h4>General Inquiries</h4>
                <p>Email: contact@enersense.com</p>
                <p>Phone: +1 (555) 000-0000</p>
              </div>
              <div className="contact-info">
                <h4>Support</h4>
                <p>Email: support@enersense.com</p>
                <p>Phone: +1 (555) 000-0001</p>
              </div>
            </div>
          </div>
        </section>

        {/* 
          Learn More Modal Overlay:
          This renders only when `isLearnMoreModalOpen` is true.
          Clicking the dark background (modal-overlay) closes the modal.
        */}
        {isLearnMoreModalOpen && (
          <div className="modal-overlay" onClick={() => setIsLearnMoreModalOpen(false)}>
            {/* The inner modal content. e.stopPropagation() prevents clicks inside from closing it */}
            <div className="matte-3d-modal" onClick={(e) => e.stopPropagation()}>
              <button className="close-modal-btn" onClick={() => setIsLearnMoreModalOpen(false)}>
                <X size={24} />
              </button>
              
              <div className="modal-content-scroll">
                <h2 className="modal-title">THE PROBLEM</h2>
                <p className="modal-text">
                  Every household runs on electricity, but almost nobody actually sees it. You flip switches, 
                  run appliances, and live your life — and the only feedback you get is a single number on a 
                  bill, once a month, after it's already too late to change anything. There's no way to know 
                  which appliance is driving your costs, no warning before you cross into a more expensive 
                  tariff slab, and no way to act on your usage in the moment. Enersense exists to close that gap.
                </p>

                <h2 className="modal-title">HOW IT WORKS</h2>
                <div className="modal-list">
                  <div className="modal-list-item">
                    <strong>1. Sense:</strong> Every monitored appliance gets its own sensor, quietly measuring voltage, current, and power draw in real time. No estimates, no guesswork — just live, appliance-level data.
                  </div>
                  <div className="modal-list-item">
                    <strong>2. Send:</strong> That data streams straight to your dashboard over your home WIFI, updating continuously so what you see always reflects what's actually happening right now.
                  </div>
                  <div className="modal-list-item">
                    <strong>3. Study:</strong> Enersense doesn't just show numbers — it studies them. Daily usage patterns are tracked, projected forward, and translated into a real, tariff-aware bill forecast.
                  </div>
                  <div className="modal-list-item">
                    <strong>4. Suggest:</strong> AI-powered analysis looks at how you actually use power and surfaces specific, practical ways to cut your bill — not generic tips, but suggestions based on your own household's data.
                  </div>
                  <div className="modal-list-item">
                    <strong>5. Switch:</strong> See something running that shouldn't be? Turn it off — from your phone, your laptop, anywhere — without getting up.
                  </div>
                </div>

                <h2 className="modal-title">WHAT YOU GET</h2>
                <div className="modal-grid">
                  <div className="modal-grid-item">
                    <h4>Appliance-level monitoring</h4>
                    <p>Stop wondering which device is quietly running up your bill. Enersense breaks every reading down by appliance, so "my electricity bill is high" finally has a real, specific answer instead of a shrug.</p>
                  </div>
                  <div className="modal-grid-item">
                    <h4>Predictive billing</h4>
                    <p>Your bill shouldn't be a surprise. Enersense tracks your consumption daily and projects your monthly total well before the billing cycle ends — calculated against real tariff slabs, not a flat estimate.</p>
                  </div>
                  <div className="modal-grid-item">
                    <h4>AI-powered savings suggestions</h4>
                    <p>Generic energy-saving tips don't account for how you actually live. Enersense analyzes your household's real usage patterns and tells you, specifically, what's worth changing and what isn't.</p>
                  </div>
                  <div className="modal-grid-item">
                    <h4>Remote control</h4>
                    <p>Left something on? Don't just make a mental note — switch it off right from the dashboard, from wherever you are.</p>
                  </div>
                  <div className="modal-grid-item">
                    <h4>Built to scale</h4>
                    <p>What starts with a couple of monitored appliances is built to grow into full-household coverage — the same system, just wired to more of your home.</p>
                  </div>
                </div>

                <h2 className="modal-title">WHY IT MATTERS</h2>
                <p className="modal-text">
                  The average household has no idea how its electricity usage actually breaks down. 
                  Enersense turns a once-a-month surprise into an ongoing, understandable relationship with 
                  your own energy use — so saving money stops being a New Year's resolution and starts 
                  being something your dashboard just tells you how to do.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
