import React, { useState } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Zap, 
  Cpu, 
  Check, 
  AlertTriangle, 
  CheckCircle2, 
  Snowflake, 
  Tv, 
  Lightbulb, 
  Coffee, 
  Wind, 
  Power,
  Radio,
  Sliders
} from 'lucide-react';

const TYPE_OPTIONS = [
  { id: 'light', label: 'Lighting', icon: Lightbulb, defaultWatts: 15 },
  { id: 'ac', label: 'Air Conditioner', icon: Snowflake, defaultWatts: 1500 },
  { id: 'tv', label: 'Television', icon: Tv, defaultWatts: 120 },
  { id: 'coffee', label: 'Kitchen / Appliance', icon: Coffee, defaultWatts: 800 },
  { id: 'fan', label: 'Ceiling Fan', icon: Wind, defaultWatts: 75 },
  { id: 'default', label: 'General Load', icon: Power, defaultWatts: 200 },
];

const ROOM_OPTIONS = ['Living Room', 'Master Bedroom', 'Kitchen', 'Balcony', 'Study Room', 'Bathroom'];

const CHANNEL_PINS = {
  1: { pin: 'GPIO 26', pzem: 'PZEM 1 (Serial2)', label: 'Channel 1 (Built-in Relay 1)' },
  2: { pin: 'GPIO 27', pzem: 'PZEM 2 (Serial1)', label: 'Channel 2 (Built-in Relay 2)' },
  3: { pin: 'GPIO 14', pzem: 'Expansion Sensor', label: 'Channel 3 (Expansion Header)' },
  4: { pin: 'GPIO 12', pzem: 'Expansion Sensor', label: 'Channel 4 (Expansion Header)' },
};

export default function AddApplianceModal({ isOpen, onClose, onAddAppliance, nextSuggestedChannel = 3 }) {
  const [step, setStep] = useState(1);

  // Form State
  const [name, setName] = useState('');
  const [room, setRoom] = useState('Living Room');
  const [type, setType] = useState('light');
  const [channel, setChannel] = useState(nextSuggestedChannel);
  const [checklist, setChecklist] = useState({
    wireCom: false,
    wireCt: false,
    wireNeutral: false,
    wireGpio: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testToggled, setTestToggled] = useState(false);

  if (!isOpen) return null;

  const currentPinInfo = CHANNEL_PINS[channel] || { pin: `GPIO ${channel}`, pzem: 'External PZEM', label: `Channel ${channel}` };

  const handleToggleChecklist = (key) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      const appData = {
        name: name.trim() || `Appliance ${channel}`,
        room,
        type,
        channel: parseInt(channel, 10),
        image: type === 'ac' ? '/assets/appliance_card1.jpg' : '/assets/appliance_card2.jpg'
      };

      await onAddAppliance(appData);
      onClose();
    } catch (e) {
      console.error('Error adding appliance:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '720px',
        maxHeight: '90vh',
        background: 'rgba(20, 20, 20, 0.95)',
        border: '1px solid rgba(104, 211, 200, 0.3)',
        borderRadius: '28px',
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(104, 211, 200, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        
        {/* Header */}
        <div style={{
          padding: '24px 32px 18px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'rgba(104, 211, 200, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#68d3c8'
              }}>
                <Cpu size={18} />
              </div>
              <h2 style={{ color: '#fff', margin: 0, fontSize: '22px', fontWeight: 700 }}>
                Pair New Hardware Appliance
              </h2>
            </div>
            <p style={{ color: '#888', margin: '4px 0 0 40px', fontSize: '13px' }}>
              Step {step} of 3 — Hardware wiring & cloud telemetry configuration
            </p>
          </div>

          <button 
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#aaa',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Stepper Indicator */}
        <div style={{
          display: 'flex',
          padding: '16px 32px',
          background: 'rgba(255, 255, 255, 0.02)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          gap: '12px'
        }}>
          {[
            { num: 1, label: 'Appliance Info' },
            { num: 2, label: 'Hardware Wiring' },
            { num: 3, label: 'MQTT & Pairing' }
          ].map(s => {
            const isCur = step === s.num;
            const isDone = step > s.num;
            return (
              <div 
                key={s.num} 
                style={{ 
                  flex: 1, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  color: isCur ? '#68d3c8' : isDone ? '#fff' : '#666',
                  fontSize: '13px',
                  fontWeight: isCur ? 700 : 500
                }}
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: isDone ? '#10b981' : isCur ? '#68d3c8' : 'rgba(255,255,255,0.1)',
                  color: isDone || isCur ? '#000' : '#888',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 800
                }}>
                  {isDone ? <Check size={12} strokeWidth={3} /> : s.num}
                </div>
                <span>{s.label}</span>
              </div>
            );
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ padding: '24px 32px', overflowY: 'auto', flex: 1 }}>

          {/* STEP 1: APPLIANCE INFO */}
          {step === 1 && (
            <div>
              {/* Appliance Name */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: '#ccc', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                  Appliance Name
                </label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Living Room AC, Kitchen Oven, Water Geyser"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#fff',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  autoFocus
                />
              </div>

              {/* Room Location */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: '#ccc', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                  Room / Location
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {ROOM_OPTIONS.map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRoom(r)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '20px',
                        background: room === r ? 'rgba(104, 211, 200, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                        border: room === r ? '1px solid #68d3c8' : '1px solid rgba(255, 255, 255, 0.1)',
                        color: room === r ? '#68d3c8' : '#aaa',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category / Icon */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', color: '#ccc', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                  Device Category Icon
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {TYPE_OPTIONS.map(t => {
                    const IconComp = t.icon;
                    const isSel = type === t.id;
                    return (
                      <div
                        key={t.id}
                        onClick={() => setType(t.id)}
                        style={{
                          padding: '12px',
                          borderRadius: '14px',
                          background: isSel ? 'rgba(104, 211, 200, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                          border: isSel ? '1px solid #68d3c8' : '1px solid rgba(255, 255, 255, 0.08)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          cursor: 'pointer'
                        }}
                      >
                        <IconComp size={20} color={isSel ? '#68d3c8' : '#888'} />
                        <span style={{ color: isSel ? '#fff' : '#aaa', fontSize: '13px', fontWeight: 500 }}>
                          {t.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Hardware Channel Selection */}
              <div>
                <label style={{ display: 'block', color: '#ccc', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                  Assigned Hardware Channel
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                  {[1, 2, 3, 4].map(ch => {
                    const isSel = channel === ch;
                    const pInfo = CHANNEL_PINS[ch];
                    return (
                      <div
                        key={ch}
                        onClick={() => setChannel(ch)}
                        style={{
                          padding: '12px 16px',
                          borderRadius: '14px',
                          background: isSel ? 'rgba(14, 165, 233, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                          border: isSel ? '1px solid #0ea5e9' : '1px solid rgba(255, 255, 255, 0.08)',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: isSel ? '#38bdf8' : '#fff', fontWeight: 700, fontSize: '14px' }}>
                            Channel {ch}
                          </span>
                          <span style={{ 
                            fontSize: '11px', 
                            padding: '2px 8px', 
                            borderRadius: '10px', 
                            background: isSel ? 'rgba(14, 165, 233, 0.3)' : 'rgba(255,255,255,0.06)',
                            color: isSel ? '#fff' : '#888'
                          }}>
                            {pInfo.pin}
                          </span>
                        </div>
                        <div style={{ color: '#777', fontSize: '12px', marginTop: '4px' }}>
                          {pInfo.pzem}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: HARDWARE WIRING GUIDE */}
          {step === 2 && (
            <div>
              {/* Wiring Schematic Card */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(104, 211, 200, 0.25)',
                borderRadius: '18px',
                padding: '20px',
                marginBottom: '24px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <Zap size={18} color="#f59e0b" />
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: '15px' }}>
                    Schematic Wiring for {currentPinInfo.label}
                  </span>
                </div>

                {/* Visual Block Diagram */}
                <div style={{
                  background: 'rgba(15, 15, 15, 0.9)',
                  padding: '16px',
                  borderRadius: '12px',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  lineHeight: '1.6',
                  color: '#94a3b8',
                  border: '1px solid rgba(255,255,255,0.05)',
                  overflowX: 'auto'
                }}>
                  <div>[230V Mains Live] ─────🔴─────➔ Relay <span style={{ color: '#f59e0b' }}>COM</span></div>
                  <div>Relay <span style={{ color: '#10b981' }}>NO</span> ───⚡───➔ (Through <span style={{ color: '#38bdf8' }}>PZEM CT Coil</span>) ─────➔ <span style={{ color: '#fff' }}>[{name || 'Appliance'} Live]</span></div>
                  <div>[230V Mains Neutral] ──🔵─────────────────────────➔ <span style={{ color: '#fff' }}>[{name || 'Appliance'} Neutral]</span></div>
                  <div style={{ marginTop: '8px', color: '#68d3c8' }}>
                    ESP32 Pin: Relay IN Pin ➔ Connect to <b>{currentPinInfo.pin}</b>
                  </div>
                </div>
              </div>

              {/* Physical Verification Checklist */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ color: '#ccc', fontSize: '13px', fontWeight: 700, marginBottom: '12px' }}>
                  Physical Hardware Checklist (Confirm Each Step):
                </div>

                {[
                  {
                    key: 'wireCom',
                    title: '1. Connect 230V AC Mains Phase to Relay COM',
                    desc: 'Feed the incoming Live wire (230V single-phase) into the Common (COM) screw terminal of your Songle 5V relay module.'
                  },
                  {
                    key: 'wireCt',
                    title: '2. Route Switched Live Through PZEM CT Coil',
                    desc: 'Run a wire from Relay NO (Normally Open) through the center aperture of the Peacefair current transformer coil to the appliance Live terminal.'
                  },
                  {
                    key: 'wireNeutral',
                    title: '3. Common AC Neutral Bus Connection',
                    desc: 'Connect the appliance Neutral terminal directly to your mains Neutral bar. Never pass the Neutral wire through the CT coil.'
                  },
                  {
                    key: 'wireGpio',
                    title: `4. Signal Pin to ESP32 ${currentPinInfo.pin}`,
                    desc: `Connect the relay module input pin (IN) to ESP32 ${currentPinInfo.pin}. Power the relay board with 5V DC (VIN) and common GND.`
                  }
                ].map(item => {
                  const isChecked = checklist[item.key];
                  return (
                    <div 
                      key={item.key}
                      onClick={() => handleToggleChecklist(item.key)}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '14px',
                        background: isChecked ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                        border: isChecked ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                        marginBottom: '10px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '6px',
                        background: isChecked ? '#10b981' : 'rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#000',
                        marginTop: '2px',
                        flexShrink: 0
                      }}>
                        {isChecked && <Check size={14} strokeWidth={3} />}
                      </div>
                      <div>
                        <div style={{ color: isChecked ? '#10b981' : '#fff', fontWeight: 600, fontSize: '13px' }}>
                          {item.title}
                        </div>
                        <div style={{ color: '#888', fontSize: '12px', marginTop: '2px' }}>
                          {item.desc}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Safety Warning */}
              <div style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                padding: '12px 16px',
                borderRadius: '12px',
                display: 'flex',
                gap: '10px',
                alignItems: 'center'
              }}>
                <AlertTriangle size={18} color="#ef4444" style={{ flexShrink: 0 }} />
                <span style={{ color: '#ef4444', fontSize: '12px', lineHeight: '1.4' }}>
                  <b>High Voltage AC Warning:</b> Ensure main breaker power is disconnected while stripping, splicing, or tightening screw terminal connections.
                </span>
              </div>
            </div>
          )}

          {/* STEP 3: MQTT & VERIFICATION */}
          {step === 3 && (
            <div>
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '18px',
                padding: '20px',
                marginBottom: '20px'
              }}>
                <h4 style={{ color: '#fff', margin: '0 0 12px', fontSize: '15px' }}>
                  Cloud Broker & Firmware Contract
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(0,0,0,0.4)' }}>
                    <div style={{ color: '#888', fontSize: '11px', textTransform: 'uppercase' }}>MQTT Command Topic</div>
                    <div style={{ color: '#68d3c8', fontWeight: 600, fontSize: '13px', marginTop: '2px' }}>
                      enersense/commands
                    </div>
                  </div>

                  <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(0,0,0,0.4)' }}>
                    <div style={{ color: '#888', fontSize: '11px', textTransform: 'uppercase' }}>Control Payload</div>
                    <div style={{ color: '#38bdf8', fontWeight: 600, fontSize: '13px', marginTop: '2px' }}>
                      {`{"applianceId": ${channel}, "state": "ON"}`}
                    </div>
                  </div>

                  <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(0,0,0,0.4)' }}>
                    <div style={{ color: '#888', fontSize: '11px', textTransform: 'uppercase' }}>Telemetry Stream</div>
                    <div style={{ color: '#10b981', fontWeight: 600, fontSize: '13px', marginTop: '2px' }}>
                      enersense/telemetry
                    </div>
                  </div>

                  <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(0,0,0,0.4)' }}>
                    <div style={{ color: '#888', fontSize: '11px', textTransform: 'uppercase' }}>Microcontroller Pin</div>
                    <div style={{ color: '#f59e0b', fontWeight: 600, fontSize: '13px', marginTop: '2px' }}>
                      {currentPinInfo.pin} (Active-LOW)
                    </div>
                  </div>
                </div>
              </div>

              {/* Ready Summary Card */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(14, 165, 233, 0.1) 100%)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '18px',
                padding: '24px',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px'
                }}>
                  <CheckCircle2 size={28} />
                </div>
                <h3 style={{ color: '#fff', margin: '0 0 6px', fontSize: '18px', fontWeight: 700 }}>
                  Ready to Activate "{name || `Appliance ${channel}`}"
                </h3>
                <p style={{ color: '#aaa', margin: 0, fontSize: '13px', maxWidth: '420px', marginInline: 'auto' }}>
                  This device will be stored in PostgreSQL and added immediately to your 3D depth carousel and real-time dashboard.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div style={{
          padding: '18px 32px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(0, 0, 0, 0.4)'
        }}>
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(prev => prev - 1)}
              style={{
                padding: '10px 18px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <ChevronLeft size={16} />
              Previous
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 18px',
                borderRadius: '12px',
                background: 'transparent',
                border: 'none',
                color: '#888',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(prev => prev + 1)}
              style={{
                padding: '10px 22px',
                borderRadius: '12px',
                background: '#68d3c8',
                border: 'none',
                color: '#000',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              Continue to Wiring Guide
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              disabled={isSubmitting}
              style={{
                padding: '10px 24px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                border: 'none',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 700,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)'
              }}
            >
              {isSubmitting ? 'Pairing...' : 'Complete Pairing & Add Device'}
              <Check size={16} />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
