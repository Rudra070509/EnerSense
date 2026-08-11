import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Cpu, 
  LineChart as LineChartIcon, 
  FileText,
  Zap,
  PowerOff,
  Activity,
  Bell
} from 'lucide-react';
import '../styles/dashboard.css';
import '../styles/appliances.css';
import GlassSurface from '../components/GlassSurface/GlassSurface';
import DepthCarousel from '../components/Appliances/DepthCarousel';
import LightRays from '../components/Backgrounds/LightRays';

const INITIAL_APPLIANCES = [
  { id: 1, type: 'ac', name: 'Smart AC', room: 'Living Room', wattage: 1200, isOn: true, image: '/assets/appliance_card1.jpg' },
  { id: 2, type: 'tv', name: 'OLED TV', room: 'Living Room', wattage: 150, isOn: false, image: '/assets/appliance_card2.jpg' },
  { id: 3, type: 'light', name: 'Hue Lights', room: 'Bedroom', wattage: 35, isOn: true, image: '/assets/appliance_card3.jpg' },
];

export default function AppliancesPage() {
  const navigate = useNavigate();
  const [activeTab] = useState('appliances');
  const [appliances, setAppliances] = useState(INITIAL_APPLIANCES);
  const [activeFilter, setActiveFilter] = useState('All');

  const totalDraw = appliances.reduce((sum, app) => app.isOn ? sum + app.wattage : sum, 0);
  const activeCount = appliances.filter(app => app.isOn).length;

  const toggleAppliance = (id) => {
    setAppliances(prev => prev.map(app => 
      app.id === id ? { ...app, isOn: !app.isOn } : app
    ));
  };

  // Retrieve user initial
  const savedUser = JSON.parse(localStorage.getItem('enersense_user') || '{}');
  const avatarLetter = (savedUser.firstName || savedUser.email || 'K')[0].toUpperCase();

  return (
    <div className="dashboard-layout">
      {/* Absolute Logo Top Left */}
      <div style={{ position: 'fixed', top: '0px', left: '56px', zIndex: 101 }}>
        <img src="/assets/enersense_logo.png" alt="EnerSense" style={{ height: '112px', filter: 'brightness(0) invert(1)' }} />
      </div>

      {/* Top Navigation */}
      <div style={{ position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)', width: 'auto', zIndex: 100 }}>
        <GlassSurface 
          width="auto" 
          height={72} 
          borderRadius={100} 
          borderWidth={0.03}
          brightness={70} 
          opacity={0.8} 
          blur={16} 
          displace={5} 
          backgroundOpacity={0.05} 
          saturation={1.2}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 32px' }}>
            <nav style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => navigate('/dashboard')} style={{ padding: '8px 16px', whiteSpace: 'nowrap', color: '#fff' }}>
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </button>
              <button className={`nav-item ${activeTab === 'appliances' ? 'active' : ''}`} onClick={() => navigate('/appliances')} style={{ padding: '8px 16px', whiteSpace: 'nowrap', color: '#fff' }}>
                <Cpu size={18} />
                <span>Appliances</span>
              </button>
              <button className="nav-item" style={{ padding: '8px 16px', whiteSpace: 'nowrap', color: '#fff' }}>
                <LineChartIcon size={18} />
                <span>Energy Graphs</span>
              </button>
              <button className="nav-item" onClick={() => navigate('/alerts')} style={{ padding: '8px 16px', whiteSpace: 'nowrap', color: '#fff' }}>
                <Bell size={18} />
                <span>Alerts</span>
              </button>

              {/* Profile */}
              <div onClick={() => navigate('/profile')} style={{ width: 36, height: 36, minWidth: 36, minHeight: 36, flexShrink: 0, borderRadius: '50%', background: '#cd1f59', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', marginLeft: '12px', cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }} onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 0 16px rgba(205,31,89,0.5)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}>
                {avatarLetter}
              </div>
            </nav>
          </div>
        </GlassSurface>
      </div>

      {/* Main Content Area with LightRays BG */}
      <main className="dashboard-main" style={{ padding: '0', height: '100vh', width: '100%', boxSizing: 'border-box', position: 'relative', overflow: 'hidden' }}>
        
        {/* Animated Background */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
          <LightRays 
            raysOrigin="top-center" // Originating from the top down
            raysSpeed={0.4}
            lightSpread={1.2}
            pulsating={true}
            followMouse={false}
          />
        </div>

        <div className="appliances-wrapper" style={{ zIndex: 10 }}>
          <DepthCarousel 
            appliances={appliances} 
            onToggleAppliance={toggleAppliance} 
          />

          {/* BOTTOM LEFT WIDGET: Total Power Draw */}
          <div className="floating-widget bottom-left">
            <GlassSurface width="100%" height="auto" borderRadius={24} borderWidth={0.03} opacity={0.8} blur={16}>
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(104, 211, 200, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Activity size={24} color="#68d3c8" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', gap: '8px' }}>
                      <div style={{ fontSize: '11px', color: '#888', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 600, whiteSpace: 'nowrap' }}>Active Devices</div>
                      <div style={{ fontSize: '14px', fontWeight: '800', color: '#fff', whiteSpace: 'nowrap' }}>{activeCount} <span style={{ color: '#68d3c8', fontSize: '12px' }}>/ {appliances.length}</span></div>
                    </div>
                    {/* Progress Bar */}
                    <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ 
                        width: `${appliances.length > 0 ? (activeCount / appliances.length) * 100 : 0}%`, 
                        height: '100%', 
                        background: 'linear-gradient(90deg, #68d3c8, #4facfe)', 
                        borderRadius: '3px',
                        transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                      }} />
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: '8px', marginLeft: '54px', fontSize: '13px', color: '#aaa', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
                  <Zap size={14} color={totalDraw > 0 ? '#68d3c8' : '#888'} />
                  {totalDraw}W current draw
                </div>
              </div>
            </GlassSurface>
          </div>

          {/* BOTTOM RIGHT WIDGET: Quick Actions */}
          <div className="floating-widget bottom-right">
            <GlassSurface width="100%" height="auto" borderRadius={24} borderWidth={0.03} opacity={0.8} blur={16}>
              <div style={{ padding: '24px' }}>
                <div style={{ fontSize: '12px', color: '#888', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px', fontWeight: 600 }}>Quick Actions</div>
                
                {/* Only keeping the master off switch as requested */}
                <button className="quick-action-btn off" onClick={() => setAppliances(prev => prev.map(a => ({...a, isOn: false})))}>
                  <PowerOff size={18} color="#ec4899" />
                  Turn All Off
                </button>
              </div>
            </GlassSurface>
          </div>

        </div>
      </main>
    </div>
  );
}
