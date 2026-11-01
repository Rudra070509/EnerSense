import React, { useState, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MqttContext } from '../context/MqttContext';
import { 
  LayoutDashboard, 
  Cpu, 
  LineChart as LineChartIcon,
  Bell,
  Zap,
  Activity,
  TrendingUp,
  Radio,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  Legend 
} from 'recharts';
import '../styles/dashboard.css';
import GlassSurface from '../components/GlassSurface/GlassSurface';
import GlassCard from '../components/Dashboard/GlassCard';

/**
 * Custom glassmorphism tooltip for Recharts
 */
const CustomTooltip = ({ active, payload, label, unit = '', precision = 1 }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(18, 18, 18, 0.95)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        padding: '10px 14px',
        borderRadius: '10px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        fontSize: '12px'
      }}>
        <div style={{ color: '#888', marginBottom: '6px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>⏱</span>
          <span>{label || 'Live'}</span>
        </div>
        {payload.map((entry, idx) => {
          const val = typeof entry.value === 'number' 
            ? (precision === 3 ? entry.value.toFixed(3) : entry.value.toFixed(precision))
            : entry.value;
          return (
            <div key={idx} style={{ color: entry.color || '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', margin: '2px 0' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: entry.color, display: 'inline-block' }} />
              <span style={{ color: '#ddd' }}>{entry.name || 'Value'}:</span>
              <span style={{ color: entry.color || '#fff' }}>{val} {unit}</span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

export default function EnergyGraphsPage() {
  const navigate = useNavigate();
  const [activeTab] = useState('graphs');
  
  const { 
    powerData, 
    liveVoltage, 
    livePower, 
    liveCurrent, 
    liveEnergy, 
    isHardwareOnline,
    appliances 
  } = useContext(MqttContext);

  const savedUser = JSON.parse(localStorage.getItem('enersense_user') || '{}');
  const userInitial = (savedUser.firstName || savedUser.email || 'U')[0].toUpperCase();

  // Dynamic appliance names from PostgreSQL/context
  const app1 = appliances?.find(a => a.channel === 1) || { name: 'Appliance 1' };
  const app2 = appliances?.find(a => a.channel === 2) || { name: 'Appliance 2' };

  // Calculate live summary metrics
  const maxPower = useMemo(() => {
    if (!powerData || powerData.length === 0) return 0;
    return Math.max(...powerData.map(d => d.totalPower || d.power || 0), livePower || 0);
  }, [powerData, livePower]);

  const latestApp1Watts = appliances?.find(a => a.channel === 1)?.wattage || 0;
  const latestApp2Watts = appliances?.find(a => a.channel === 2)?.wattage || 0;

  return (
    <div className="dashboard-layout" style={{ overflowY: 'auto' }}>
      {/* Absolute Logo Top Left */}
      <div style={{ position: 'fixed', top: '0px', left: '56px', zIndex: 101 }}>
        <img 
          src="/assets/enersense_logo.png" 
          alt="EnerSense" 
          style={{ height: '112px', filter: 'brightness(0) invert(1)' }} 
        />
      </div>

      {/* Top Navigation */}
      <div style={{ position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)', width: 'auto', zIndex: 100 }}>
        <GlassSurface width="auto" height={72} borderRadius={100} borderWidth={0.03} brightness={70} opacity={0.8} blur={16} displace={5} backgroundOpacity={0.05} saturation={1.2}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 32px' }}>
            <nav style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <button 
                className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} 
                onClick={() => navigate('/dashboard')} 
                style={{ padding: '8px 16px', whiteSpace: 'nowrap', color: '#fff' }}
              >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </button>
              <button 
                className={`nav-item ${activeTab === 'appliances' ? 'active' : ''}`} 
                onClick={() => navigate('/appliances')} 
                style={{ padding: '8px 16px', whiteSpace: 'nowrap', color: '#fff' }}
              >
                <Cpu size={18} />
                <span>Appliances</span>
              </button>
              <button 
                className={`nav-item ${activeTab === 'graphs' ? 'active' : ''}`} 
                onClick={() => navigate('/graphs')} 
                style={{ padding: '8px 16px', whiteSpace: 'nowrap', color: '#fff' }}
              >
                <LineChartIcon size={18} />
                <span>Energy Graphs</span>
              </button>
              <button 
                className="nav-item" 
                onClick={() => navigate('/alerts')} 
                style={{ padding: '8px 16px', whiteSpace: 'nowrap', color: '#fff' }}
              >
                <Bell size={18} />
                <span>Alerts</span>
              </button>

              <div 
                onClick={() => navigate('/profile')} 
                style={{ 
                  width: 36, 
                  height: 36, 
                  borderRadius: '50%', 
                  background: '#cd1f59', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: '#fff', 
                  fontWeight: 'bold', 
                  marginLeft: '12px', 
                  cursor: 'pointer' 
                }}
              >
                {userInitial}
              </div>
            </nav>
          </div>
        </GlassSurface>
      </div>

      {/* Main Content Area */}
      <main className="dashboard-main" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        width: '100%', 
        minHeight: '100vh', 
        padding: '130px 4% 60px' 
      }}>
        <div style={{ width: '100%', maxWidth: '1400px' }}>
          
          {/* Header & Status Banner */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-end', 
            marginBottom: '28px',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <h1 style={{ color: '#fff', fontSize: '36px', fontWeight: 700, margin: 0, letterSpacing: '-0.5px' }}>
                  Live Energy Telemetry
                </h1>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: isHardwareOnline ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                  border: isHardwareOnline ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
                  color: isHardwareOnline ? '#10b981' : '#f59e0b'
                }}>
                  <Radio size={14} className={isHardwareOnline ? 'pulse-icon' : ''} />
                  {isHardwareOnline ? 'LIVE STREAM (3s)' : 'STANDBY'}
                </span>
              </div>
              <p style={{ color: '#888', margin: 0, fontSize: '15px' }}>
                Real-time Modbus telemetry streamed from dual Peacefair PZEM-004T sensors via HiveMQ MQTT
              </p>
            </div>

            {/* Quick Metrics KPI Row */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{
                background: 'rgba(26, 26, 26, 0.6)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '10px 18px',
                borderRadius: '14px',
                minWidth: '120px'
              }}>
                <div style={{ color: '#888', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Mains Voltage</div>
                <div style={{ color: '#f59e0b', fontSize: '20px', fontWeight: 700 }}>
                  {liveVoltage ? `${liveVoltage} V` : 'Offline'}
                </div>
              </div>

              <div style={{
                background: 'rgba(26, 26, 26, 0.6)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '10px 18px',
                borderRadius: '14px',
                minWidth: '120px'
              }}>
                <div style={{ color: '#888', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Total Current</div>
                <div style={{ color: '#ec4899', fontSize: '20px', fontWeight: 700 }}>
                  {typeof liveCurrent === 'number' ? liveCurrent.toFixed(3) : '0.000'} A
                </div>
              </div>

              <div style={{
                background: 'rgba(26, 26, 26, 0.6)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '10px 18px',
                borderRadius: '14px',
                minWidth: '120px'
              }}>
                <div style={{ color: '#888', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Instant Power</div>
                <div style={{ color: '#0ea5e9', fontSize: '20px', fontWeight: 700 }}>
                  {livePower} W
                </div>
              </div>

              <div style={{
                background: 'rgba(26, 26, 26, 0.6)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '10px 18px',
                borderRadius: '14px',
                minWidth: '120px'
              }}>
                <div style={{ color: '#888', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Cumulative Meter</div>
                <div style={{ color: '#10b981', fontSize: '20px', fontWeight: 700 }}>
                  {liveEnergy} kWh
                </div>
              </div>
            </div>
          </div>

          {/* 🌟 1. MAIN USAGE GRAPH (HERO FULL-WIDTH) */}
          <GlassCard style={{ 
            padding: '28px 32px', 
            background: 'rgba(20, 20, 20, 0.65)', 
            marginBottom: '32px',
            border: '1px solid rgba(14, 165, 233, 0.2)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap size={22} color="#0ea5e9" />
                  <h2 style={{ color: '#fff', margin: 0, fontSize: '24px', fontWeight: 700 }}>
                    Main Active Power Load Curve
                  </h2>
                </div>
                <p style={{ color: '#888', margin: '4px 0 0 30px', fontSize: '13px' }}>
                  Total combined household power demand in real time
                </p>
              </div>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#888', fontSize: '11px', textTransform: 'uppercase' }}>Current Draw</div>
                  <div style={{ color: '#0ea5e9', fontSize: '22px', fontWeight: 700 }}>
                    {livePower} <span style={{ fontSize: '14px', fontWeight: 500 }}>W</span>
                  </div>
                </div>
                <div style={{ width: '1px', height: '32px', background: 'rgba(255,255,255,0.1)' }} />
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#888', fontSize: '11px', textTransform: 'uppercase' }}>Session Peak</div>
                  <div style={{ color: '#fff', fontSize: '22px', fontWeight: 700 }}>
                    {maxPower} <span style={{ fontSize: '14px', fontWeight: 500 }}>W</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Area Chart */}
            <div style={{ height: '340px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={powerData} margin={{ top: 15, right: 20, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="mainPowerGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.07)" vertical={false} />
                  <XAxis 
                    dataKey="time" 
                    stroke="#555" 
                    tick={{ fill: '#777', fontSize: 11 }}
                    tickLine={{ stroke: '#444' }}
                  />
                  <YAxis 
                    stroke="#555" 
                    unit=" W" 
                    tick={{ fill: '#777', fontSize: 11 }}
                    tickLine={{ stroke: '#444' }}
                  />
                  <Tooltip content={<CustomTooltip unit="W" precision={1} />} />
                  <Area 
                    type="monotone" 
                    dataKey="totalPower" 
                    name="Total Power"
                    stroke="#0ea5e9" 
                    strokeWidth={3} 
                    fill="url(#mainPowerGrad)" 
                    dot={{ r: 4, fill: '#0ea5e9', stroke: '#fff', strokeWidth: 1.5 }}
                    activeDot={{ r: 7, fill: '#38bdf8', stroke: '#fff', strokeWidth: 2 }}
                    isAnimationActive={false} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* 📊 2. THE 4 PARAMETER SUB-GRAPHS (2x2 GRID) */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(540px, 1fr))', 
            gap: '24px',
            marginBottom: '40px'
          }}>
            
            {/* SUB-GRAPH 1: VOLTAGE STABILITY */}
            <GlassCard style={{ padding: '24px 28px', background: 'rgba(20, 20, 20, 0.65)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap size={18} color="#f59e0b" />
                  <div>
                    <h3 style={{ color: '#fff', margin: 0, fontSize: '18px', fontWeight: 600 }}>
                      Mains Voltage Stability
                    </h3>
                    <p style={{ color: '#777', margin: 0, fontSize: '12px' }}>
                      Grid AC fluctuations (nominal 230V ± 6%)
                    </p>
                  </div>
                </div>
                <div style={{ 
                  color: '#f59e0b', 
                  fontSize: '18px', 
                  fontWeight: 700,
                  background: 'rgba(245, 158, 11, 0.12)',
                  padding: '4px 12px',
                  borderRadius: '10px'
                }}>
                  {liveVoltage ? `${liveVoltage} V` : '0 V'}
                </div>
              </div>

              <div style={{ height: '230px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={powerData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="voltGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                    <XAxis dataKey="time" stroke="#555" tick={{ fill: '#777', fontSize: 10 }} />
                    <YAxis 
                      stroke="#555" 
                      unit="V" 
                      domain={['auto', 'auto']}
                      tick={{ fill: '#777', fontSize: 10 }} 
                    />
                    <Tooltip content={<CustomTooltip unit="V" precision={1} />} />
                    <Area 
                      type="monotone" 
                      dataKey="voltage" 
                      name="Mains Voltage"
                      stroke="#f59e0b" 
                      strokeWidth={2.5} 
                      fill="url(#voltGrad)"
                      dot={{ r: 3, fill: '#f59e0b' }}
                      isAnimationActive={false} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            {/* SUB-GRAPH 2: TOTAL CURRENT DRAW */}
            <GlassCard style={{ padding: '24px 28px', background: 'rgba(20, 20, 20, 0.65)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity size={18} color="#ec4899" />
                  <div>
                    <h3 style={{ color: '#fff', margin: 0, fontSize: '18px', fontWeight: 600 }}>
                      Total Current Amperage
                    </h3>
                    <p style={{ color: '#777', margin: 0, fontSize: '12px' }}>
                      Instantaneous current draw across split-core CTs
                    </p>
                  </div>
                </div>
                <div style={{ 
                  color: '#ec4899', 
                  fontSize: '18px', 
                  fontWeight: 700,
                  background: 'rgba(236, 72, 153, 0.12)',
                  padding: '4px 12px',
                  borderRadius: '10px'
                }}>
                  {typeof liveCurrent === 'number' ? liveCurrent.toFixed(3) : '0.000'} A
                </div>
              </div>

              <div style={{ height: '230px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={powerData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="currentGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ec4899" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#ec4899" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                    <XAxis dataKey="time" stroke="#555" tick={{ fill: '#777', fontSize: 10 }} />
                    <YAxis 
                      stroke="#555" 
                      unit="A" 
                      tick={{ fill: '#777', fontSize: 10 }} 
                    />
                    <Tooltip content={<CustomTooltip unit="A" precision={3} />} />
                    <Area 
                      type="monotone" 
                      dataKey="current" 
                      name="Total Current"
                      stroke="#ec4899" 
                      strokeWidth={2.5} 
                      fill="url(#currentGrad)"
                      dot={{ r: 3, fill: '#ec4899' }}
                      isAnimationActive={false} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            {/* SUB-GRAPH 3: POWER BREAKDOWN BY APPLIANCE */}
            <GlassCard style={{ padding: '24px 28px', background: 'rgba(20, 20, 20, 0.65)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Cpu size={18} color="#38bdf8" />
                  <div>
                    <h3 style={{ color: '#fff', margin: 0, fontSize: '18px', fontWeight: 600 }}>
                      Appliance Power Breakdown
                    </h3>
                    <p style={{ color: '#777', margin: 0, fontSize: '12px' }}>
                      Real-time channel distribution: {app1.name} vs {app2.name}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ 
                    color: '#38bdf8', 
                    fontSize: '13px', 
                    fontWeight: 600,
                    background: 'rgba(56, 189, 248, 0.1)',
                    padding: '3px 8px',
                    borderRadius: '6px'
                  }}>
                    {app1.name}: {latestApp1Watts}W
                  </span>
                  <span style={{ 
                    color: '#c084fc', 
                    fontSize: '13px', 
                    fontWeight: 600,
                    background: 'rgba(192, 132, 252, 0.1)',
                    padding: '3px 8px',
                    borderRadius: '6px'
                  }}>
                    {app2.name}: {latestApp2Watts}W
                  </span>
                </div>
              </div>

              <div style={{ height: '230px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={powerData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                    <XAxis dataKey="time" stroke="#555" tick={{ fill: '#777', fontSize: 10 }} />
                    <YAxis stroke="#555" unit="W" tick={{ fill: '#777', fontSize: 10 }} />
                    <Tooltip content={<CustomTooltip unit="W" precision={1} />} />
                    <Legend 
                      verticalAlign="top" 
                      align="right"
                      wrapperStyle={{ paddingBottom: '10px', fontSize: '12px' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="app1Power" 
                      name={app1.name} 
                      stroke="#38bdf8" 
                      strokeWidth={2.5} 
                      dot={{ r: 3, fill: '#38bdf8' }}
                      isAnimationActive={false} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="app2Power" 
                      name={app2.name} 
                      stroke="#c084fc" 
                      strokeWidth={2.5} 
                      dot={{ r: 3, fill: '#c084fc' }}
                      isAnimationActive={false} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            {/* SUB-GRAPH 4: CUMULATIVE ENERGY METER */}
            <GlassCard style={{ padding: '24px 28px', background: 'rgba(20, 20, 20, 0.65)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TrendingUp size={18} color="#10b981" />
                  <div>
                    <h3 style={{ color: '#fff', margin: 0, fontSize: '18px', fontWeight: 600 }}>
                      Cumulative Energy Meter
                    </h3>
                    <p style={{ color: '#777', margin: 0, fontSize: '12px' }}>
                      Non-volatile energy register (kWh) from PZEM
                    </p>
                  </div>
                </div>
                <div style={{ 
                  color: '#10b981', 
                  fontSize: '18px', 
                  fontWeight: 700,
                  background: 'rgba(16, 185, 129, 0.12)',
                  padding: '4px 12px',
                  borderRadius: '10px'
                }}>
                  {liveEnergy} kWh
                </div>
              </div>

              <div style={{ height: '230px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={powerData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                    <XAxis dataKey="time" stroke="#555" tick={{ fill: '#777', fontSize: 10 }} />
                    <YAxis 
                      stroke="#555" 
                      unit=" kWh" 
                      domain={['auto', 'auto']}
                      tick={{ fill: '#777', fontSize: 10 }} 
                    />
                    <Tooltip content={<CustomTooltip unit="kWh" precision={3} />} />
                    <Area 
                      type="monotone" 
                      dataKey="energy" 
                      name="Cumulative Energy"
                      stroke="#10b981" 
                      strokeWidth={2.5} 
                      fill="url(#energyGrad)"
                      dot={{ r: 3, fill: '#10b981' }}
                      isAnimationActive={false} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

          </div>
        </div>
      </main>
    </div>
  );
}
