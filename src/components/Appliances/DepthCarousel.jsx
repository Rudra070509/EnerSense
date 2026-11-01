import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Cpu, ArrowRight } from 'lucide-react';
import ApplianceCard from './ApplianceCard';

export default function DepthCarousel({ 
  appliances, 
  onToggleAppliance, 
  onRenameAppliance,
  onOpenAddWizard 
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragStartX, setDragStartX] = useState(null);

  // Combine real appliances with the 3D "+ Add Appliance" card as the last slot
  const items = [
    ...appliances.map(app => ({ type: 'appliance', data: app })),
    { type: 'add_card' }
  ];
  const total = items.length;

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
        {items.map((item, i) => {
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

          if (item.type === 'add_card') {
            return (
              <div
                key="add_card_slot"
                className={`carousel-item ${isActive ? 'active' : ''}`}
                style={{
                  transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                  opacity: isActive ? 1 : 0.65,
                  filter: isActive ? 'none' : 'brightness(0.7)',
                  zIndex: 100 - absDist,
                  transition: 'all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
                  cursor: 'pointer',
                  background: 'linear-gradient(135deg, rgba(20, 20, 20, 0.85) 0%, rgba(13, 37, 34, 0.9) 100%)',
                  border: '2px dashed rgba(104, 211, 200, 0.5)',
                  boxShadow: isActive 
                    ? '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(104, 211, 200, 0.2)' 
                    : '0 20px 40px rgba(0, 0, 0, 0.5)'
                }}
                onClick={() => {
                  if (!isActive) {
                    setActiveIndex(i);
                  } else if (onOpenAddWizard) {
                    onOpenAddWizard();
                  }
                }}
              >
                <div style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '36px',
                  boxSizing: 'border-box',
                  textAlign: 'center'
                }}>
                  {/* Glowing Plus Icon Box */}
                  <div style={{
                    width: '76px',
                    height: '76px',
                    borderRadius: '50%',
                    background: 'rgba(104, 211, 200, 0.15)',
                    border: '1px solid rgba(104, 211, 200, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#68d3c8',
                    marginBottom: '24px',
                    boxShadow: '0 0 24px rgba(104, 211, 200, 0.3)',
                    transition: 'transform 0.3s ease'
                  }}>
                    <Plus size={36} strokeWidth={2.5} />
                  </div>

                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '1.5px',
                    color: '#68d3c8',
                    textTransform: 'uppercase',
                    marginBottom: '8px'
                  }}>
                    Hardware Expansion
                  </span>

                  <h3 style={{
                    color: '#ffffff',
                    fontSize: '24px',
                    fontWeight: 700,
                    margin: '0 0 12px'
                  }}>
                    Pair New Appliance
                  </h3>

                  <p style={{
                    color: '#888888',
                    fontSize: '13px',
                    lineHeight: '1.5',
                    margin: '0 0 28px',
                    maxWidth: '240px'
                  }}>
                    Step-by-step wiring guide to connect load to ESP32 relay and PZEM-004T CT sensor.
                  </p>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onOpenAddWizard) onOpenAddWizard();
                    }}
                    style={{
                      padding: '12px 24px',
                      borderRadius: '14px',
                      background: 'linear-gradient(135deg, #68d3c8 0%, #4facfe 100%)',
                      border: 'none',
                      color: '#000',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 20px rgba(104, 211, 200, 0.4)',
                      transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <span>Launch Setup Wizard</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            );
          }

          const app = item.data;
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
