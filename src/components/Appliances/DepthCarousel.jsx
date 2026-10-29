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

      <div className="carousel-track">
        {appliances.map((app, i) => {
          let dist = i - activeIndex;
          if (total > 2) {
            if (dist > total / 2) dist -= total;
            if (dist < -total / 2) dist += total;
          }
          
          const absDist = Math.abs(dist);
          const sign = Math.sign(dist);
          const isActive = dist === 0;

          // 3D Perspective Stacking
          const translateX = sign * 200 * absDist;
          const translateZ = -140 * absDist;
          const rotateY = -sign * 20 * absDist;
          const scale = Math.max(1 - (absDist * 0.1), 0.7);

          return (
            <div
              key={app.id || app.channel || i}
              className={`carousel-item ${isActive ? 'active' : ''}`}
              style={{
                transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                opacity: isActive ? 1 : 0.6,
                filter: isActive ? 'none' : 'brightness(0.7)',
                zIndex: 100 - absDist,
                transition: 'all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
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
