import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ApplianceCard from './ApplianceCard';

export default function DepthCarousel({ appliances, onToggleAppliance }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragStartX, setDragStartX] = useState(null);
  const total = appliances.length;

  const handleDragStart = (e) => {
    if (e.touches && e.touches.length > 0) {
      setDragStartX(e.touches[0].clientX);
    } else {
      setDragStartX(e.clientX);
    }
  };

  const handleDragEnd = (e) => {
    if (dragStartX === null) return;
    
    let endX;
    if (e.changedTouches && e.changedTouches.length > 0) {
      endX = e.changedTouches[0].clientX;
    } else {
      endX = e.clientX;
    }
    
    const diff = dragStartX - endX;
    
    // threshold for swipe
    if (diff > 50) {
      nextItem();
    } else if (diff < -50) {
      prevItem();
    }
    
    setDragStartX(null);
  };

  const nextItem = () => {
    setActiveIndex(prev => (prev + 1) % total);
  };

  const prevItem = () => {
    setActiveIndex(prev => (prev - 1 + total) % total);
  };

  return (
    <div 
      className="carousel-container"
      onMouseDown={handleDragStart}
      onMouseUp={handleDragEnd}
      onMouseLeave={(e) => { if (dragStartX !== null) handleDragEnd(e); }}
      onTouchStart={handleDragStart}
      onTouchEnd={handleDragEnd}
    >
      <button className="carousel-nav-btn prev" onClick={(e) => { e.stopPropagation(); prevItem(); }}>
        <ChevronLeft size={28} />
      </button>

      <div className="carousel-track" style={{ perspective: '1200px' }}>
        {appliances.map((app, i) => {
          // Calculate shortest distance in a circular array
          let dist = i - activeIndex;
          if (dist > total / 2) dist -= total;
          if (dist < -total / 2) dist += total;
          
          const absDist = Math.abs(dist);
          const sign = Math.sign(dist);
          const isActive = dist === 0;

          // Stack items behind each other (to the left and right)
          // Increased offset for larger cards
          const translateX = sign * 180 * absDist;
          const translateZ = -150 * absDist;
          const rotateY = -sign * 25; // face inwards
          const scale = Math.max(1 - (absDist * 0.1), 0.5);

          return (
            <div 
              key={app.id} 
              className="carousel-item"
              style={{
                transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                opacity: absDist > 2 ? 0 : (1 - absDist * 0.2), // Fade out items far away
                filter: isActive ? 'none' : 'blur(2px) brightness(0.5)',
                pointerEvents: isActive ? 'auto' : 'none',
                zIndex: 100 - absDist, // Ensure center is always on top
              }}
            >
              <ApplianceCard appliance={app} onToggle={onToggleAppliance} />
            </div>
          );
        })}
      </div>

      <button className="carousel-nav-btn next" onClick={(e) => { e.stopPropagation(); nextItem(); }}>
        <ChevronRight size={28} />
      </button>
    </div>
  );
}
