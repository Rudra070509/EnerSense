import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { MqttContext } from '../context/MqttContext';
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

export default function AppliancesPage() {
  const navigate = useNavigate();
  const [activeTab] = useState('appliances');
  
  const { appliances, toggleAppliance, turnAllOff, renameAppliance } = useContext(MqttContext);

  const totalDraw = appliances.reduce((sum, app) => app.isOn ? sum + (app.wattage || 0) : sum, 0);
  const activeCount = appliances.filter(app => app.isOn).length;

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
              <button className={`nav-item ${activeTab === 'graphs' ? 'active' : ''}`} onClick={() => navigate('/graphs')} style={{ padding: '8px 16px', whiteSpace: 'nowrap', color: '#fff' }}>
                <LineChartIcon size={18} />
                <span>Energy Graphs</span>
              </button>
              <button className={`nav-item ${activeTab === 'alerts' ? 'active' : ''}`} onClick={() => navigate('/alerts')} style={{ padding: '8px 16px', whiteSpace: 'nowrap', color: '#fff' }}>
                <Bell size={18} />
                <span>Alerts</span>
              </button>
            </nav>
          </div>
        </GlassSurface>
      </div>

      {/* User Profile Avatar Top Right */}
      <div 
        onClick={() => navigate('/profile')}
        style={{
          position: 'fixed',
          top: 24,
          right: 56,
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #ec4899, #f43f5e)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontWeight: '700',
          fontSize: '18px',
          boxShadow: '0 8px 32px rgba(236, 72, 153, 0.3)',
          cursor: 'pointer',
          zIndex: 101,
          border: '2px solid rgba(255, 255, 255, 0.2)',
          transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        {avatarLetter}
      </div>

      <div className="appliances-container">
        {/* Ambient Light Rays Background */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
          <LightRays
            color="rgba(104, 211, 200, 0.12)"
            raysOrigin="top-center"
            raysDensity={0.6}
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
            onRenameAppliance={renameAppliance}
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
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    className="action-btn"
                    onClick={turnAllOff}
                    style={{ 
                      flex: 1, 
                      padding: '12px 16px', 
                      borderRadius: '12px', 
                      background: 'rgba(239, 68, 68, 0.1)', 
                      border: '1px solid rgba(239, 68, 68, 0.2)', 
                      color: '#ef4444', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '8px', 
                      fontSize: '13px', 
                      fontWeight: 600, 
                      cursor: 'pointer' 
                    }}
                  >
                    <PowerOff size={16} />
                    Turn All Off
                  </button>
                  <button 
                    className="action-btn"
                    onClick={() => navigate('/dashboard')}
                    style={{ 
                      flex: 1, 
                      padding: '12px 16px', 
                      borderRadius: '12px', 
                      background: 'rgba(255, 255, 255, 0.05)', 
                      border: '1px solid rgba(255, 255, 255, 0.1)', 
                      color: '#fff', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '8px', 
                      fontSize: '13px', 
                      fontWeight: 600, 
                      cursor: 'pointer' 
                    }}
                  >
                    <FileText size={16} />
                    View Bill
                  </button>
                </div>
              </div>
            </GlassSurface>
          </div>
        </div>
      </div>
    </div>
  );
}
