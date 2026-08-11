import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Cpu, 
  LineChart as LineChartIcon, 
  Bell,
  AlertTriangle,
  Info,
  TrendingUp,
  Zap
} from 'lucide-react';
import '../styles/dashboard.css';
import GlassSurface from '../components/GlassSurface/GlassSurface';
import GlassCard from '../components/Dashboard/GlassCard';

// Dummy data for notifications
const NOTIFICATIONS = [
  { id: 1, type: 'warning', text: 'AC taking too much power from past 5 hours.', time: '10 mins ago', icon: Zap, color: '#f59e0b' },
  { id: 2, type: 'alert', text: 'Fridge door has been open for 15 minutes.', time: '4 hours ago', icon: AlertTriangle, color: '#ef4444' },
  { id: 3, type: 'success', text: 'Solar panels generated peak power today.', time: 'Yesterday', icon: TrendingUp, color: '#10b981' },
  { id: 4, type: 'info', text: 'Firmware update available for Smart Hub.', time: '2 days ago', icon: Info, color: '#8b5cf6' },
  { id: 5, type: 'warning', text: 'Washing machine left on standby mode for 12 hours.', time: '3 days ago', icon: AlertTriangle, color: '#f59e0b' },
];

export default function AlertsPage() {
  const navigate = useNavigate();
  const [activeTab] = useState('alerts');
  const avatarLetter = 'JD'.split(' ').map(n => n[0]).join('');

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
              <button className={`nav-item ${activeTab === 'energy' ? 'active' : ''}`} style={{ padding: '8px 16px', whiteSpace: 'nowrap', color: '#fff' }}>
                <LineChartIcon size={18} />
                <span>Energy Graphs</span>
              </button>
              <button className={`nav-item ${activeTab === 'alerts' ? 'active' : ''}`} onClick={() => navigate('/alerts')} style={{ padding: '8px 16px', whiteSpace: 'nowrap', color: '#fff' }}>
                <Bell size={18} />
                <span>Alerts</span>
              </button>

              <div onClick={() => navigate('/profile')} style={{ width: 36, height: 36, minWidth: 36, minHeight: 36, flexShrink: 0, borderRadius: '50%', background: '#cd1f59', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', marginLeft: '12px', cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }} onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 0 16px rgba(205,31,89,0.5)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}>
                {avatarLetter}
              </div>
            </nav>
          </div>
        </GlassSurface>
      </div>

      <main className="dashboard-main" style={{ paddingTop: '120px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%', height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
            <div>
              <h1 className="wrapped-title" style={{ fontSize: '48px' }}>System Alerts</h1>
              <p className="wrapped-subtitle">Real-time notifications and system logs.</p>
            </div>
          </div>

          <div className="wrapped-grid" style={{ gridTemplateRows: 'repeat(10, 1fr)' }}>
            
            {/* ROW 1-10: Full Width (Notifications Feed) */}
            <GlassCard colSpan={12} rowSpan={10} variant="glass" style={{ padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ padding: '32px 32px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: 8, height: 8, background: '#ef4444', borderRadius: '50%', boxShadow: '0 0 10px #ef4444' }}></div>
                  Smart Alerts Inbox
                </h3>
              </div>
              
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '12px', scrollbarWidth: 'none' }}>
                {NOTIFICATIONS.map((notif) => {
                  const Icon = notif.icon;
                  return (
                    <div key={notif.id} style={{ display: 'flex', gap: '20px', padding: '20px 24px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', cursor: 'pointer', transition: 'background 0.2s', border: '1px solid rgba(255,255,255,0.02)' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}>
                      <div style={{ width: 48, height: 48, borderRadius: '50%', background: `${notif.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon size={24} color={notif.color} />
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <p style={{ color: '#fff', fontSize: '16px', margin: '0 0 8px', lineHeight: '1.4', fontWeight: '500' }}>{notif.text}</p>
                        <span style={{ color: '#888', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>{notif.time}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>

          </div>
        </div>
      </main>
    </div>
  );
}
