import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { MqttContext } from '../context/MqttContext';
import { 
  LayoutDashboard, 
  Cpu, 
  LineChart as LineChartIcon,
  Bell
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import '../styles/dashboard.css';
import GlassSurface from '../components/GlassSurface/GlassSurface';
import GlassCard from '../components/Dashboard/GlassCard';

export default function EnergyGraphsPage() {
  const navigate = useNavigate();
  const [activeTab] = useState('graphs');
  
  const { powerData } = useContext(MqttContext);

  const savedUser = JSON.parse(localStorage.getItem('enersense_user') || '{}');
  const userInitial = (savedUser.firstName || savedUser.email || 'U')[0].toUpperCase();

  return (
    <div className="dashboard-layout">
      {/* Absolute Logo Top Left */}
      <div style={{ position: 'fixed', top: '0px', left: '56px', zIndex: 101 }}>
        <img src="/assets/enersense_logo.png" alt="EnerSense" style={{ height: '112px', filter: 'brightness(0) invert(1)' }} />
      </div>

      {/* Top Navigation */}
      <div style={{ position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)', width: 'auto', zIndex: 100 }}>
        <GlassSurface width="auto" height={72} borderRadius={100} borderWidth={0.03} brightness={70} opacity={0.8} blur={16} displace={5} backgroundOpacity={0.05} saturation={1.2}>
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
              <button className="nav-item" onClick={() => navigate('/alerts')} style={{ padding: '8px 16px', whiteSpace: 'nowrap', color: '#fff' }}>
                <Bell size={18} />
                <span>Alerts</span>
              </button>

              <div onClick={() => navigate('/profile')} style={{ width: 36, height: 36, borderRadius: '50%', background: '#cd1f59', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', marginLeft: '12px', cursor: 'pointer' }}>
                {userInitial}
              </div>
            </nav>
          </div>
        </GlassSurface>
      </div>

      <main className="dashboard-main" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', width: '100%', padding: '0 5%' }}>
        <div style={{ width: '100%', maxWidth: '1200px', marginTop: '100px' }}>
          <GlassCard style={{ padding: '40px', background: 'rgba(20, 20, 20, 0.6)' }}>
            <h2 style={{ color: '#fff', marginBottom: '8px', fontSize: '32px' }}>Live Power Consumption</h2>
            <p style={{ color: '#aaa', marginBottom: '40px' }}>Real-time wattage streamed via MQTT from ESP32</p>
            
            <div style={{ height: '500px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={powerData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="time" stroke="#aaa" />
                  <YAxis stroke="#aaa" unit="W" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                    itemStyle={{ color: '#0ea5e9', fontWeight: 'bold' }}
                  />
                  <Line type="monotone" dataKey="power" stroke="#0ea5e9" strokeWidth={4} dot={{ r: 6, fill: '#0ea5e9', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 8 }} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>
      </main>
    </div>
  );
}
