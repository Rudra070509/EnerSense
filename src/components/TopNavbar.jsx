import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TopNavbar() {
  return (
    <header className="top-navbar">
      <div className="brand-logo">
        <img src="/assets/enersense_logo.png" alt="EnerSense" className="brand-logo-img" />
      </div>

      <Link to="/" className="back-link">
        Back to website <ArrowRight size={14} />
      </Link>
    </header>
  );
}
