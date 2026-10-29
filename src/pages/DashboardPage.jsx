import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { MqttContext } from '../context/MqttContext';
import { 
  LayoutDashboard, 
  Cpu, 
  LineChart as LineChartIcon, 
  Sparkles, 
  FileText,
  Send,
  Loader2,
  Trash2,
  Bell,
  Zap,
  TrendingDown,
  Info,
  Radio
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, LabelList } from 'recharts';
import '../styles/dashboard.css';
import GlassCard from '../components/Dashboard/GlassCard';
import GlassSurface from '../components/GlassSurface/GlassSurface';
import { getGeminiResponse } from '../utils/gemini';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { 
    liveEnergy, 
    liveVoltage, 
    livePower, 
    todayCost, 
    billPrediction, 
    appliances,
    isHardwareOnline 
  } = useContext(MqttContext);
  
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [chatMessages, setChatMessages] = useState([
    { role: 'ai', text: "Hello! I'm EnerSense AI. Ask me about your live energy consumption, current power draw, or yesterday's usage!" }
  ]);
  
  const [chatInput, setChatInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);
  const [weeklyUsageData, setWeeklyUsageData] = useState([]);
  const chatEndRef = useRef(null);

  // Read user data for avatar
  const savedUser = JSON.parse(localStorage.getItem('enersense_user') || '{}');
  const userInitial = (savedUser.firstName || savedUser.email || 'U')[0].toUpperCase();

  // Dynamic appliance breakdown based on REAL active wattages
  const totalApplianceWatts = appliances.reduce((sum, app) => sum + (app.wattage || 0), 0);
  const app1 = appliances.find(a => a.channel === 1) || { name: 'Appliance 1', wattage: 0 };
  const app2 = appliances.find(a => a.channel === 2) || { name: 'Appliance 2', wattage: 0 };

  const app1Pct = totalApplianceWatts > 0 ? Math.round((app1.wattage / totalApplianceWatts) * 100) : 0;
  const app2Pct = totalApplianceWatts > 0 ? Math.round((app2.wattage / totalApplianceWatts) * 100) : 0;

  // Fetch real 7-day usage from backend PostgreSQL database
  useEffect(() => {
    const fetchWeeklyData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await fetch('http://localhost:5000/api/energy/weekly', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setWeeklyUsageData(data);
            return;
          }
        }
      } catch (err) {
        console.warn('Could not fetch weekly energy:', err);
      }
      
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];
      setWeeklyUsageData(days.map((d, i) => ({
        name: d,
        value: i === 6 ? Math.round((parseFloat(liveEnergy) || 0) * 1000) : 0
      })));
    };

    fetchWeeklyData();
  }, [liveEnergy]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendChat = async () => {
    if (!chatInput.trim() || isAiLoading) return;
    
    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsAiLoading(true);

    let dbSummary = null;
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const summaryRes = await fetch('http://localhost:5000/api/energy/summary-for-ai', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (summaryRes.ok) {
          dbSummary = await summaryRes.json();
        }
      }
    } catch (e) {
      // fallback
    }

    const currentDashboardData = {
      totalPowerToday: `${liveEnergy} kWh`,
      currentWatts: `${livePower} W`,
      liveVoltage: liveVoltage > 0 ? `${liveVoltage} V` : 'Offline (0 V)',
      estMonthlyBill: `₹${(billPrediction?.predictedBill || 80).toLocaleString('en-IN')}`,
      projectedMonthlyKwh: `${billPrediction?.projectedMonthlyKwh || '0.0'} kWh`,
      todayCost: `₹${todayCost}`,
      topAppliances: totalApplianceWatts > 0 ? `${app1.name} (${app1.wattage}W), ${app2.name} (${app2.wattage}W)` : 'All appliances currently OFF',
      yesterdayKwh: dbSummary ? `${dbSummary.yesterdayKwh} kWh` : '0.000 kWh',
      yesterdayAvgPower: dbSummary ? `${dbSummary.yesterdayAvgPower} W` : '0 W',
      registeredAppliances: appliances.map(a => `${a.name} (Channel ${a.channel})`).join(', ')
    };

    try {
      const aiReply = await getGeminiResponse(userMsg, currentDashboardData);
      setChatMessages(prev => [...prev, { role: 'ai', text: aiReply }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'ai', text: "I'm having trouble analyzing the energy network right now. Please try again!" }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Absolute Logo Top Left */}
      <div style={{ position: 'fixed', top: '0px', left: '56px', zIndex: 101 }}>
        <img src="/assets/enersense_logo.png" alt="EnerSense" style={{ height: '112px', filter: 'brightness(0) invert(1)' }} />
      </div>

      {/* Top Floating Glass Navigation Bar */}
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
              <button 
                className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} 
                onClick={() => { setActiveTab('dashboard'); navigate('/dashboard'); }} 
                style={{ padding: '8px 16px', whiteSpace: 'nowrap', color: '#fff' }}
              >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </button>
              <button 
                className={`nav-item ${activeTab === 'appliances' ? 'active' : ''}`} 
                onClick={() => { setActiveTab('appliances'); navigate('/appliances'); }} 
                style={{ padding: '8px 16px', whiteSpace: 'nowrap', color: '#fff' }}
              >
                <Cpu size={18} />
                <span>Appliances</span>
              </button>
              <button 
                className={`nav-item ${activeTab === 'graphs' ? 'active' : ''}`} 
                onClick={() => { setActiveTab('graphs'); navigate('/graphs'); }} 
                style={{ padding: '8px 16px', whiteSpace: 'nowrap', color: '#fff' }}
              >
                <LineChartIcon size={18} />
                <span>Energy Graphs</span>
              </button>
              <button 
                className={`nav-item ${activeTab === 'alerts' ? 'active' : ''}`} 
                onClick={() => { setActiveTab('alerts'); navigate('/alerts'); }} 
                style={{ padding: '8px 16px', whiteSpace: 'nowrap', color: '#fff' }}
              >
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
        {userInitial}
      </div>

      {/* Main Wrapped Grid */}
      <main className="dashboard-main">
        <div className="wrapped-dashboard-container">
          <div className="wrapped-grid">
            
            {/* CARD 1: POWER CONSUMED TODAY (Left Column) */}
            <GlassCard colSpan={5} rowSpan={6} variant="purple" style={{ padding: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="wrapped-card-label" style={{ color: '#ffffff' }}>POWER CONSUMED TODAY</h3>
                <span style={{ 
                  background: isHardwareOnline ? 'rgba(56, 189, 248, 0.2)' : 'rgba(0,0,0,0.4)', 
                  padding: '4px 12px', 
                  borderRadius: '100px', 
                  color: isHardwareOnline ? '#38bdf8' : '#94a3b8', 
                  fontSize: '12px', 
                  fontWeight: 'bold', 
                  border: isHardwareOnline ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)' 
                }}>
                  ⚡ {livePower} W Draw
                </span>
              </div>
              
              <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <div className="wrapped-card-value" style={{ fontSize: '100px', color: '#ffffff', lineHeight: 1 }}>{liveEnergy}</div>
                  <div className="wrapped-card-subvalue" style={{ color: '#ffffff', opacity: 0.8, fontSize: '15px', fontWeight: 'normal', marginTop: '8px' }}>
                    kWh consumed since reset.
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="wrapped-card-value" style={{ fontSize: '32px', color: '#10b981', lineHeight: 1 }}>₹{todayCost}</div>
                  <div className="wrapped-card-subvalue" style={{ color: '#ffffff', opacity: 0.8, fontSize: '14px', fontWeight: 'normal', marginTop: '8px' }}>
                    Est. cost today
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* CARD 2: PREDICTED MONTHLY BILL (Middle Column) */}
            <GlassCard 
              colSpan={3} 
              rowSpan={6} 
              variant="black" 
              style={{ padding: '32px', cursor: 'pointer' }}
              onClick={() => setShowBillModal(true)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="wrapped-card-label" style={{ color: '#ffffff', margin: 0 }}>PREDICTED MONTHLY BILL</h3>
                <span style={{ color: '#ec4899', fontSize: '20px', lineHeight: 1 }}>→</span>
              </div>
              
              <div style={{ marginTop: 'auto' }}>
                <div className="wrapped-card-value" style={{ color: '#ec4899', fontSize: '56px' }}>
                  ₹{(billPrediction?.predictedBill || 80).toLocaleString('en-IN')}
                </div>
                <div className="wrapped-card-subvalue" style={{ color: '#10b981', fontSize: '13px', marginTop: '14px', background: 'rgba(16, 185, 129, 0.1)', padding: '6px 12px', borderRadius: '6px', width: 'fit-content', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <TrendingDown size={14} />
                  MERC FY25 • {billPrediction?.projectedMonthlyKwh || '0.0'} kWh ({typeof billPrediction?.slabTier === 'string' ? billPrediction.slabTier.split(' ')[0] : `Tier ${billPrediction?.slabTier || 1}`})
                </div>
              </div>
            </GlassCard>

            {/* CARD 3: AI ASSISTANT (Right Column Full Height) */}
            <GlassCard colSpan={4} rowSpan={10} variant="white" style={{ borderRadius: '80px', padding: '24px 24px 40px 24px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ 
                  background: '#1a1a1a', 
                  color: '#fff', 
                  padding: '6px 16px', 
                  borderRadius: '20px', 
                  fontSize: '12px', 
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <Sparkles size={14} color="#ec4899" />
                  <span>EnerSense AI</span>
                </div>
                <button 
                  onClick={() => setChatMessages([{ role: 'ai', text: "History cleared! Ask me anything about your power network." }])}
                  style={{ background: 'transparent', border: 'none', color: '#999', cursor: 'pointer', padding: '4px' }}
                  title="Clear Chat"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Chat Messages */}
              <div style={{ 
                flex: 1, 
                overflowY: 'auto', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '12px',
                paddingRight: '4px',
                marginBottom: '16px'
              }}>
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`chat-bubble ${msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}`}>
                    {msg.text}
                  </div>
                ))}
                {isAiLoading && (
                  <div className="chat-bubble chat-bubble-ai" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Analyzing database & telemetry...</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div className="chat-input-wrapper">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                  placeholder="Ask about your usage, yesterday, or bill..."
                  className="chat-input-field"
                />
                <button 
                  onClick={handleSendChat}
                  disabled={!chatInput.trim() || isAiLoading}
                  className={`chat-send-btn ${chatInput.trim() && !isAiLoading ? 'active' : 'disabled'}`}
                >
                  <Send size={16} />
                </button>
              </div>
            </GlassCard>

            {/* CARD 4: DAILY PROJECTION (Pink Bar Chart) */}
            <GlassCard colSpan={3} rowSpan={4} variant="pink" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
              <h3 className="wrapped-card-label" style={{ color: '#ffffff', textTransform: 'uppercase', fontSize: '12px', marginBottom: '16px', textAlign: 'center' }}>
                Daily Usage (Wh)
              </h3>
              
              <div style={{ flex: 1, width: '100%', minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyUsageData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#ffffff', fontSize: 10, fontWeight: 500 }}
                    />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div style={{ background: '#111', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '10px' }}>
                              {payload[0].value} Wh
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="value" fill="#18181b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            {/* CARD 5: LIVE LOAD (Middle Bottom) */}
            <GlassCard colSpan={2} rowSpan={4} variant="black" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="wrapped-card-label" style={{ color: '#ffffff', textTransform: 'uppercase', fontSize: '12px', margin: 0 }}>LIVE LOAD</h3>
                <span style={{ 
                  color: liveVoltage > 0 ? '#10b981' : '#64748b', 
                  fontSize: '12px', 
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Radio size={12} color={liveVoltage > 0 ? '#10b981' : '#64748b'} />
                  {liveVoltage > 0 ? `${liveVoltage} V` : 'Offline'}
                </span>
              </div>
              <div className="wrapped-card-value" style={{ color: '#fff', fontSize: '30px', marginTop: '8px' }}>
                {livePower} W
              </div>
              <div className="wrapped-card-subvalue" style={{ color: '#888', marginTop: '2px' }}>
                Est. {((livePower * 24) / 1000).toFixed(2)} kWh/day run-rate
              </div>
              <div style={{ display: 'flex', gap: '4px', marginTop: '12px' }}>
                <div style={{ flex: 1, height: '6px', borderRadius: '3px', background: livePower > 0 ? '#059669' : '#222' }}></div>
                <div style={{ flex: 1, height: '6px', borderRadius: '3px', background: livePower > 500 ? '#0284c7' : '#222' }}></div>
                <div style={{ flex: 1, height: '6px', borderRadius: '3px', background: livePower > 1500 ? '#d97706' : '#222' }}></div>
                <div style={{ flex: 1, height: '6px', borderRadius: '3px', background: livePower > 2500 ? '#dc2626' : '#222' }}></div>
              </div>
            </GlassCard>

            {/* CARD 6: ACTIVE APPLIANCES (Left Bottom) */}
            <GlassCard colSpan={3} rowSpan={4} variant="black" style={{ padding: '32px', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <h3 className="wrapped-card-label" style={{ color: '#ffffff', margin: 0, textTransform: 'none', fontSize: '20px', fontWeight: 'bold', letterSpacing: '0' }}>Active<br/>Appliances</h3>
                <span style={{ color: '#64748b', fontSize: '10px', textAlign: 'right' }}>Real PZEM<br/>Breakdown</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '12px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{app1.name} (Relay 1)</span>
                    <span style={{ color: '#38bdf8', fontWeight: 700 }}>{totalApplianceWatts > 0 ? `${app1Pct}%` : 'Standby'}</span>
                  </div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '4px' }}>{app1.wattage} W</div>
                  <div style={{ width: '100%', height: '4px', background: '#222', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${app1Pct}%`, height: '100%', background: '#38bdf8', transition: 'width 0.4s' }}></div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{app2.name} (Relay 2)</span>
                    <span style={{ color: '#c084fc', fontWeight: 700 }}>{totalApplianceWatts > 0 ? `${app2Pct}%` : 'Standby'}</span>
                  </div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '4px' }}>{app2.wattage} W</div>
                  <div style={{ width: '100%', height: '4px', background: '#222', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${app2Pct}%`, height: '100%', background: '#c084fc', transition: 'width 0.4s' }}></div>
                  </div>
                </div>
              </div>
            </GlassCard>

          </div>
        </div>
      </main>

      {/* Bill Breakdown Modal */}
      {showBillModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#18181b',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            width: '90%',
            maxWidth: '500px',
            padding: '32px',
            color: '#fff',
            position: 'relative'
          }}>
            <button 
              onClick={() => setShowBillModal(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'transparent',
                border: 'none',
                color: '#888',
                fontSize: '24px',
                cursor: 'pointer'
              }}
            >
              ×
            </button>
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>MERC Electricity Bill Projection</h3>
            <p style={{ color: '#aaa', fontSize: '13px', marginBottom: '24px' }}>Calculated according to Maharashtra Electricity Regulatory Commission tariff slabs.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #27272a' }}>
                <span style={{ color: '#aaa' }}>Current Active Slab</span>
                <span style={{ fontWeight: 600, color: '#ec4899' }}>{billPrediction?.slabTier || 'Tier 1 (0-100 units)'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #27272a' }}>
                <span style={{ color: '#aaa' }}>Monthly Forecast Units</span>
                <span style={{ fontWeight: 600 }}>{billPrediction?.projectedMonthlyKwh || '0.0'} kWh</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #27272a' }}>
                <span style={{ color: '#aaa' }}>Base Fixed Charge</span>
                <span style={{ fontWeight: 600 }}>₹{billPrediction?.fixedCharge || 90}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontSize: '18px', fontWeight: 800, color: '#ec4899' }}>
                <span>Total Predicted Bill</span>
                <span>₹{(billPrediction?.predictedBill || 80).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
