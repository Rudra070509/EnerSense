import React from 'react';
import { Power, Snowflake, Tv, Lightbulb, Coffee, Wind } from 'lucide-react';

const iconMap = {
  ac: Snowflake,
  tv: Tv,
  light: Lightbulb,
  coffee: Coffee,
  fan: Wind,
  default: Power
};

export default function ApplianceCard({ appliance, onToggle }) {
  const Icon = iconMap[appliance.type] || iconMap.default;

  return (
    <div 
      className="appliance-card" 
      style={{
        background: `linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.85) 100%), url(${appliance.image || ''}) center/cover no-repeat`,
      }}
    >
      <div className="ac-icon-box">
        <Icon size={32} color={appliance.isOn ? '#68d3c8' : '#888'} />
      </div>
      
      <div>
        <h3 className="ac-title">{appliance.name}</h3>
        <p className="ac-room">{appliance.room}</p>
      </div>

      <div className="ac-stats-row">
        <div className="ac-wattage">
          <span className="ac-wattage-val" style={{ color: appliance.isOn ? '#68d3c8' : '#555' }}>
            {appliance.isOn ? appliance.wattage : '0'}W
          </span>
          <span className="ac-wattage-label">Current Draw</span>
        </div>

        <div className="app-toggle-wrapper">
          <span className={`app-toggle-label ${appliance.isOn ? 'active' : ''}`}>
            {appliance.isOn ? 'ON' : 'OFF'}
          </span>
          <div 
            className={`app-toggle ${appliance.isOn ? 'on' : ''}`}
            onClick={(e) => {
              e.stopPropagation(); // prevent carousel drag when clicking toggle
              onToggle(appliance.id);
            }}
          >
            <div className="app-toggle-knob" />
          </div>
        </div>
      </div>
    </div>
  );
}
