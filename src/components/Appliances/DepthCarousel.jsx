import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ApplianceCard from './ApplianceCard';

export default function DepthCarousel({ appliances, onToggleAppliance, onRenameAppliance }) {
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
    if (diff > 50) {
      nextItem();
    } else if (diff < -50) {
      prevItem();
    }
    
    setDragStartX(null);
  };

  const nextItem = () => {
    if (total === 0) return;
    setActiveIndex(prev => (prev + 1) % total);
  };

  const prevItem = () => {
    if (total === 0) return;
    setActiveIndex(prev => (prev - 1 + total) % total);
  };

  if (total === 0) {
    return <div style={{ color: '#fff', textAlign: 'center', marginTop: '100px' }}>Loading appliances...</div>;
  }

  return (
    <div 
      className="carousel-container"
      onMouseDown={handleDragStart}
      onMouseUp={handleDragEnd}
      onMouseLeave={(e) => { if (dragStartX !== null) handleDragEnd(e); }}
      onTouchStart={handleDragStart}
      onTouchEnd={handleDragEnd}
    >
      {total > 1 && (
        <button className="carousel-nav-btn prev" onClick={(e) => { e.stopPropagation(); prevItem(); }}>
          <ChevronLeft size={28} />
        </button>
      )}

      <div className="carousel-track" style={{ perspective: '1200px' }}>
        {appliances.map((app, i) => {
          let dist = i - activeIndex;
          if (total > 2) {
            if (dist > total / 2) dist -= total;
            if (dist < -total / 2) dist += total;
          }
          
          const absDist = Math.abs(dist);
          const sign = Math.sign(dist);
          const isActive = dist === 0;

          const tx = dist * 280;
          const tz = -absDist * 160;
          const ry = -sign * Math.min(absDist * 22, 45);
          const opacity = Math.max(1 - absDist * 0.35, 0.2);
          const zIndex = 100 - absDist;

          return (
            <div
              key={app.id || app.channel || i}
              className={`carousel-card-wrap ${isActive ? 'active' : ''}`}
              style={{
                transform: `translateX(${tx}px) translateZ(${tz}px) rotateY(${ry}deg)`,
                opacity: opacity,
                zIndex: zIndex,
                transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
                cursor: isActive ? 'default' : 'pointer',
              }}
              onClick={() => {
                if (!isActive) setActiveIndex(i);
              }}
            >
              <ApplianceCard 
                appliance={app} 
                onToggle={onToggleAppliance} 
                onRename={onRenameAppliance}
              />
            </div>
          );
        })}
      </div>

      {total > 1 && (
        <button className="carousel-nav-btn next" onClick={(e) => { e.stopPropagation(); nextItem(); }}>
          <ChevronRight size={28} />
        </button>
      )}
    </div>
  );
}
