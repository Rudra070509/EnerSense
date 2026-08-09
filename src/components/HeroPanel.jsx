import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

const taglines = [
  "Capturing Moments,\nCreating Memories",
  "Empowering Innovation,\nShaping Tomorrow",
  "Seamless Security,\nInfinite Possibilities"
];

export default function HeroPanel() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % taglines.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="hero-card">
      {/* Simple Image Background with Dark Gradient Overlay */}
      <div className="hero-bg-overlay">
        <img 
          src="/assets/login_bg.png" 
          alt="Glowing Wireframe Wave Landscape" 
          className="hero-bg-image" 
        />
        <div className="hero-gradient-mask"></div>
      </div>

      {/* Top Header */}
      <div className="hero-header">
        <div className="brand-logo">
          <img src="/assets/enersense_logo.png" alt="EnerSense" className="brand-logo-img" />
        </div>

        <button className="back-link" onClick={() => alert("Redirecting back to main website...")}>
          Back to website <ArrowRight size={14} />
        </button>
      </div>

      {/* Hero Footer with Dynamic Tagline Slider */}
      <div className="hero-footer">
        <div className="tagline-text" key={activeSlide}>
          {taglines[activeSlide].split('\n').map((line, idx) => (
            <React.Fragment key={idx}>
              {line}
              {idx === 0 && <br />}
            </React.Fragment>
          ))}
        </div>

        {/* Carousel indicators */}
        <div className="carousel-indicators">
          {taglines.map((_, idx) => (
            <div
              key={idx}
              className={`indicator-dash ${idx === activeSlide ? 'active' : 'inactive'}`}
              onClick={() => setActiveSlide(idx)}
              title={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
