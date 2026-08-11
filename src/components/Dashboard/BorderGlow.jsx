import React, { useRef, useState, useEffect } from 'react';

export default function BorderGlow({ 
  children, 
  glowColor = 'rgba(104, 211, 200, 0.8)', // Default cyan glow
  borderWidth = 2, 
  borderRadius = 24, 
  className = '',
  style = {}
}) {
  const containerRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: -1000, y: -1000 }); // Start off-screen
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePosition({ x, y });
  };

  return (
    <div 
      ref={containerRef}
      className={`border-glow-container ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        // Optional: animate it back to the center or hide it
      }}
      style={{
        position: 'relative',
        borderRadius: `${borderRadius}px`,
        padding: `${borderWidth}px`,
        overflow: 'hidden',
        background: 'rgba(255, 255, 255, 0.03)', // Subtle base border
        ...style
      }}
    >
      {/* The glowing gradient that follows the mouse */}
      <div 
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: `radial-gradient(circle 300px at ${mousePosition.x}px ${mousePosition.y}px, ${glowColor}, transparent 80%)`,
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.3s ease',
          zIndex: 0,
          pointerEvents: 'none', // Don't block interactions
        }}
      />
      
      {/* The inner content box that masks the center of the glow */}
      <div 
        style={{
          position: 'relative',
          background: '#1A1A1A', // Match the dashboard card background
          borderRadius: `${borderRadius - borderWidth}px`,
          width: '100%',
          height: '100%',
          zIndex: 1,
          overflow: 'hidden'
        }}
      >
        {children}
      </div>
    </div>
  );
}
