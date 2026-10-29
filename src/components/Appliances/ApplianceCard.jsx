import React, { useState } from 'react';
import { Power, Snowflake, Tv, Lightbulb, Coffee, Wind, Edit2, Check, X } from 'lucide-react';

const iconMap = {
  ac: Snowflake,
  tv: Tv,
  light: Lightbulb,
  coffee: Coffee,
  fan: Wind,
  default: Power
};

export default function ApplianceCard({ appliance, onToggle, onRename }) {
  const Icon = iconMap[appliance.type] || iconMap.default;
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(appliance.name);
  const [newRoom, setNewRoom] = useState(appliance.room || 'Living Room');

  const handleSave = (e) => {
    e.stopPropagation();
    if (newName.trim() && onRename) {
      onRename(appliance.channel || appliance.id, newName.trim(), newRoom.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = (e) => {
    e.stopPropagation();
    setNewName(appliance.name);
    setNewRoom(appliance.room || 'Living Room');
    setIsEditing(false);
  };

  return (
    <div 
      className="appliance-card" 
      style={{
        background: `linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.85) 100%), url(${appliance.image || ''}) center/cover no-repeat`,
        position: 'relative'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <div className="ac-icon-box">
          <Icon size={28} color={appliance.isOn ? '#68d3c8' : '#888'} />
        </div>
        
        {/* Rename Pencil Button */}
        {!isEditing && (
          <button
            onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#ffffff',
              transition: 'background 0.2s'
            }}
            title="Rename Appliance"
          >
            <Edit2 size={14} />
          </button>
        )}
      </div>
      
      {/* Name and Room Title / Inline Edit */}
      <div style={{ marginTop: 'auto', marginBottom: '8px' }}>
        {isEditing ? (
          <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <input 
              type="text" 
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Appliance Name"
              style={{
                background: 'rgba(0, 0, 0, 0.6)',
                border: '1px solid #68d3c8',
                borderRadius: '6px',
                color: '#fff',
                padding: '4px 8px',
                fontSize: '14px',
                outline: 'none',
                width: '100%'
              }}
              autoFocus
            />
            <input 
              type="text" 
              value={newRoom}
              onChange={(e) => setNewRoom(e.target.value)}
              placeholder="Room"
              style={{
                background: 'rgba(0, 0, 0, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '6px',
                color: '#ccc',
                padding: '4px 8px',
                fontSize: '12px',
                outline: 'none',
                width: '100%'
              }}
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <button 
                onClick={handleSave} 
                style={{ 
                  flex: 1, 
                  background: '#68d3c8', 
                  border: 'none', 
                  borderRadius: '4px', 
                  padding: '4px', 
                  color: '#000', 
                  fontWeight: 700, 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  fontSize: '12px'
                }}
              >
                <Check size={12} /> Save
              </button>
              <button 
                onClick={handleCancel} 
                style={{ 
                  flex: 1, 
                  background: 'rgba(255, 255, 255, 0.2)', 
                  border: 'none', 
                  borderRadius: '4px', 
                  padding: '4px', 
                  color: '#fff', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  fontSize: '12px'
                }}
              >
                <X size={12} /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h3 className="ac-title" style={{ fontSize: '20px', fontWeight: 700, color: '#fff', margin: 0 }}>
              {appliance.name}
            </h3>
            <p className="ac-room" style={{ fontSize: '13px', color: '#aaa', margin: '2px 0 0 0' }}>
              {appliance.room} • Channel {appliance.channel || appliance.id}
            </p>
          </div>
        )}
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
              e.stopPropagation();
              onToggle(appliance.channel || appliance.id);
            }}
          >
            <div className="app-toggle-knob" />
          </div>
        </div>
      </div>
    </div>
  );
}
