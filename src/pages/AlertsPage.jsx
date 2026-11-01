import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MqttContext } from '../context/MqttContext';
import { getGeminiAlerts } from '../utils/gemini';
import { 
  LayoutDashboard, 
  Cpu, 
  LineChart as LineChartIcon, 
  Bell,
  AlertTriangle,
  Info,
  TrendingUp,
  Zap,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Radio,
  CheckCircle2
} from 'lucide-react';
import '../styles/dashboard.css';
import GlassSurface from '../components/GlassSurface/GlassSurface';
import GlassCard from '../components/Dashboard/GlassCard';

export default function AlertsPage() {
  const navigate = useNavigate();
  const [activeTab] = useState('alerts');
  const [filter, setFilter] = useState('all'); // 'all' | 'warning' | 'alert' | 'success' | 'info'
  const [aiAlerts, setAiAlerts] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const { 
    livePower, 
    liveVoltage, 
    liveCurrent, 
    liveEnergy, 
    isHardwareOnline, 
    appliances, 
    billPrediction, 
    todayCost 
  } = useContext(MqttContext);

  const savedUser = JSON.parse(localStorage.getItem('enersense_user') || '{}');
  const avatarLetter = (savedUser.firstName || savedUser.email || 'K')[0].toUpperCase();

  // 1. Dynamic Rule-Based Real-time Alerts from live hardware telemetry
  const telemetryAlerts = useMemo(() => {
    const alerts = [];

    // Rule 1: Hardware Connection Heartbeat
    if (isHardwareOnline) {
      alerts.push({
        id: 'hw-online',
        type: 'success',
        category: 'System',
        title: 'ESP32 Hardware Connected',
        message: 'Edge gateway is actively publishing dual-channel PZEM telemetry over HiveMQ MQTT.',
        time: 'Live',
        icon: Radio,
        color: '#10b981'
      });
    } else {
      alerts.push({
        id: 'hw-standby',
        type: 'warning',
        category: 'System',
        title: 'Hardware in Standby Mode',
        message: 'No live telemetry received in past 10 seconds. Waiting for ESP32 MQTT packet.',
        time: 'Standby',
        icon: AlertTriangle,
        color: '#f59e0b'
      });
    }

    // Rule 2: AC Mains Voltage Monitoring
    if (liveVoltage > 0 && liveVoltage < 210) {
      alerts.push({
        id: 'volt-low',
        type: 'alert',
        category: 'Voltage',
        title: 'Low Mains Voltage Detected',
        message: `AC supply is ${liveVoltage}V (below nominal 230V single-phase rating). May cause brownout on motor loads.`,
        time: 'Active',
        icon: AlertTriangle,
        color: '#ef4444'
      });
    } else if (liveVoltage > 250) {
      alerts.push({
        id: 'volt-high',
        type: 'alert',
        category: 'Voltage',
        title: 'High Voltage Surge Alert',
        message: `Mains line is at ${liveVoltage}V (exceeds standard 230V ±8% ceiling). Recommend checking surge protector.`,
        time: 'Active',
        icon: Zap,
        color: '#ef4444'
      });
    } else if (liveVoltage >= 210) {
      alerts.push({
        id: 'volt-normal',
        type: 'info',
        category: 'Voltage',
        title: 'Mains Voltage Stable',
        message: `Grid AC supply is operating normally at ${liveVoltage}V, 50 Hz. Clean electrical waveform.`,
        time: 'Normal',
        icon: Zap,
        color: '#38bdf8'
      });
    }

    // Rule 3: Active Load & Appliance Consumption Checks
    const activeApps = appliances.filter(a => a.isOn);
    if (activeApps.length > 0) {
      activeApps.forEach(app => {
        if (app.wattage > 100) {
          alerts.push({
            id: `load-high-${app.channel}`,
            type: 'warning',
            category: 'Load',
            title: `High Draw on ${app.name}`,
            message: `${app.name} in ${app.room} is currently consuming ${app.wattage}W. Consider turning off if not in use.`,
            time: 'Ongoing',
            icon: AlertTriangle,
            color: '#f59e0b'
          });
        }
      });
    } else {
      alerts.push({
        id: 'load-zero',
        type: 'success',
        category: 'Load',
        title: 'Standby Baseline Active',
        message: 'All controlled appliances are switched OFF. Idle household power draw is 0W.',
        time: 'Standby',
        icon: ShieldCheck,
        color: '#10b981'
      });
    }

    // Rule 4: MERC Tariff Slab Projection
    const projKwh = parseFloat(billPrediction?.projectedMonthlyKwh || 0);
    if (projKwh > 300) {
      alerts.push({
        id: 'tariff-slab3',
        type: 'alert',
        category: 'Tariff',
        title: 'MERC Tier 3 Threshold Breach',
        message: `Projected ${projKwh} kWh will enter highest residential slab (>300 units @ ₹7.10/kWh). Est. bill: ₹${billPrediction.predictedBill}.`,
        time: 'Projection',
        icon: TrendingUp,
        color: '#ef4444'
      });
    } else if (projKwh > 100) {
      alerts.push({
        id: 'tariff-slab2',
        type: 'warning',
        category: 'Tariff',
        title: 'MERC Tier 2 Slab Active',
        message: `Consumption entering 101–300 unit slab billed at ₹5.40/kWh. Est. monthly bill: ₹${billPrediction.predictedBill}.`,
        time: 'Projection',
        icon: TrendingUp,
        color: '#f59e0b'
      });
    } else {
      alerts.push({
        id: 'tariff-slab1',
        type: 'success',
        category: 'Tariff',
        title: 'Subsidized Tier 1 Slab',
        message: `Usage within base tier (≤100 units @ ₹3.15/kWh). Maximum tariff efficiency achieved.`,
        time: 'Economical',
        icon: TrendingUp,
        color: '#10b981'
      });
    }

    return alerts;
  }, [livePower, liveVoltage, isHardwareOnline, appliances, billPrediction]);

  // Trigger Gemini AI Smart Energy Audit
  const handleRunAiAudit = async () => {
    setIsAiLoading(true);
    try {
      const contextData = {
        livePower,
        liveVoltage,
        liveCurrent,
        liveEnergy,
        predictedBill: billPrediction?.predictedBill,
        projectedMonthlyKwh: billPrediction?.projectedMonthlyKwh,
        appliances: appliances.map(a => ({ name: a.name, room: a.room, wattage: a.wattage, isOn: a.isOn }))
      };

      const result = await getGeminiAlerts(contextData);
      if (result && Array.isArray(result)) {
        const formatted = result.map((item, idx) => ({
          id: `ai-${idx}-${Date.now()}`,
          type: item.type || 'info',
          category: item.category || 'AI Advisor',
          title: item.title || 'Smart Energy Insight',
          message: item.message,
          time: 'AI Real-Time',
          icon: Sparkles,
          isAi: true,
          color: item.type === 'alert' ? '#ef4444' : item.type === 'warning' ? '#f59e0b' : item.type === 'success' ? '#10b981' : '#a855f7'
        }));
        setAiAlerts(formatted);
      }
    } catch (e) {
      console.error('Error fetching AI alerts:', e);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Run AI Audit once on component mount if key is available
  useEffect(() => {
    handleRunAiAudit();
  }, []);

  // Merge AI alerts with live telemetry rules
  const allAlerts = useMemo(() => {
    const list = [];
    if (aiAlerts && aiAlerts.length > 0) {
      list.push(...aiAlerts);
    }
    list.push(...telemetryAlerts);

    if (filter === 'all') return list;
    return list.filter(a => a.type === filter);
  }, [aiAlerts, telemetryAlerts, filter]);

  return (
    <div className="dashboard-layout" style={{ overflowY: 'auto' }}>
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

              {/* Profile */}
              <div 
                onClick={() => navigate('/profile')} 
                style={{ 
                  width: 36, 
                  height: 36, 
                  minWidth: 36, 
                  minHeight: 36, 
                  flexShrink: 0, 
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
                {avatarLetter}
              </div>
            </nav>
          </div>
        </GlassSurface>
      </div>

      <main className="dashboard-main" style={{ paddingTop: '120px', minHeight: '100vh', paddingBottom: '60px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column' }}>
          
          {/* Page Title & Action Controls */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-end', 
            marginBottom: '28px',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                <h1 className="wrapped-title" style={{ fontSize: '38px', margin: 0, letterSpacing: '-0.5px' }}>
                  System Alerts & AI Insights
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
                  {isHardwareOnline ? 'TELEMETRY LIVE' : 'HARDWARE STANDBY'}
                </span>
              </div>
              <p className="wrapped-subtitle" style={{ margin: 0, fontSize: '15px' }}>
                Real-time electrical safety notifications, tariff thresholds, and Google Gemini AI diagnostics.
              </p>
            </div>

            {/* Run Gemini AI Audit Button */}
            <button
              onClick={handleRunAiAudit}
              disabled={isAiLoading}
              style={{
                padding: '12px 24px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
                border: 'none',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 700,
                cursor: isAiLoading ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 8px 24px rgba(168, 85, 247, 0.35)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => !isAiLoading && (e.currentTarget.style.transform = 'scale(1.04)')}
              onMouseLeave={e => !isAiLoading && (e.currentTarget.style.transform = 'scale(1)')}
            >
              <Sparkles size={16} className={isAiLoading ? 'spin-icon' : ''} />
              <span>{isAiLoading ? 'Analyzing Telemetry...' : 'Run Gemini AI Energy Audit'}</span>
            </button>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: `All Alerts (${allAlerts.length})` },
              { id: 'warning', label: 'Warnings' },
              { id: 'alert', label: 'Critical Alerts' },
              { id: 'success', label: 'Healthy / Normal' },
              { id: 'info', label: 'Grid Status' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  background: filter === f.id ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  border: filter === f.id ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)',
                  color: filter === f.id ? '#fff' : '#888',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Alerts Feed */}
          <GlassCard variant="glass" style={{ padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ 
              padding: '24px 32px', 
              borderBottom: '1px solid rgba(255,255,255,0.06)', 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: 8, height: 8, background: '#10b981', borderRadius: '50%', boxShadow: '0 0 10px #10b981' }} />
                Smart Telemetry & AI Diagnostic Feed
              </h3>
              <span style={{ color: '#777', fontSize: '12px' }}>
                Showing {allAlerts.length} active notices
              </span>
            </div>
            
            <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {allAlerts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#777' }}>
                  No alerts found under this category.
                </div>
              ) : (
                allAlerts.map((notif) => {
                  const Icon = notif.icon;
                  return (
                    <div 
                      key={notif.id} 
                      style={{ 
                        display: 'flex', 
                        gap: '20px', 
                        padding: '20px 24px', 
                        background: notif.isAi ? 'rgba(168, 85, 247, 0.06)' : 'rgba(255,255,255,0.02)', 
                        borderRadius: '16px', 
                        border: notif.isAi ? '1px solid rgba(168, 85, 247, 0.25)' : '1px solid rgba(255,255,255,0.05)',
                        transition: 'transform 0.2s, background 0.2s',
                        alignItems: 'center'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = notif.isAi ? 'rgba(168, 85, 247, 0.12)' : 'rgba(255,255,255,0.05)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }} 
                      onMouseLeave={e => {
                        e.currentTarget.style.background = notif.isAi ? 'rgba(168, 85, 247, 0.06)' : 'rgba(255,255,255,0.02)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      {/* Alert Icon Bubble */}
                      <div style={{ 
                        width: 48, 
                        height: 48, 
                        borderRadius: '50%', 
                        background: `${notif.color}18`, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        flexShrink: 0,
                        border: `1px solid ${notif.color}33`
                      }}>
                        <Icon size={22} color={notif.color} />
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                          <span style={{ color: '#fff', fontSize: '15px', fontWeight: '700' }}>
                            {notif.title}
                          </span>
                          <span style={{
                            fontSize: '11px',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            background: notif.isAi ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                            color: notif.isAi ? '#c084fc' : '#aaa',
                            fontWeight: 600,
                            letterSpacing: '0.4px'
                          }}>
                            {notif.category}
                          </span>
                          {notif.isAi && (
                            <span style={{
                              fontSize: '10px',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: 'linear-gradient(90deg, #a855f7, #6366f1)',
                              color: '#fff',
                              fontWeight: 800,
                              letterSpacing: '0.5px'
                            }}>
                              GEMINI AI
                            </span>
                          )}
                        </div>
                        <p style={{ color: '#bbb', fontSize: '14px', margin: 0, lineHeight: '1.4' }}>
                          {notif.message}
                        </p>
                      </div>

                      {/* Timestamp Badge */}
                      <div style={{ 
                        color: notif.color, 
                        fontSize: '11px', 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.5px', 
                        fontWeight: '700',
                        background: `${notif.color}10`,
                        padding: '4px 10px',
                        borderRadius: '8px',
                        flexShrink: 0
                      }}>
                        {notif.time}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </GlassCard>

        </div>
      </main>
    </div>
  );
}
