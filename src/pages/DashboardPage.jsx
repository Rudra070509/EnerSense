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
  Info
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
    appliances 
  } = useContext(MqttContext);
  
  // Controls the currently active tab in the top navigation bar
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // State for the AI Chat Assistant
  const [chatMessages, setChatMessages] = useState([
    { role: 'ai', text: "Hello! I'm EnerSense AI. Ask me about your live energy consumption, current power draw, or estimated electricity bill!" }
  ]);
  
  const [chatInput, setChatInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);
  const chatEndRef = useRef(null);

  // Read user data for avatar
  const savedUser = JSON.parse(localStorage.getItem('enersense_user') || '{}');
  const userInitial = (savedUser.firstName || savedUser.email || 'U')[0].toUpperCase();

  // Dynamic appliance breakdown based on real data
  const totalApplianceWatts = appliances.reduce((sum, app) => sum + (app.wattage || 0), 0);
  const app1Watt = appliances.find(a => a.id === 1)?.wattage || 0;
  const app2Watt = appliances.find(a => a.id === 2)?.wattage || 0;

  const app1Pct = totalApplianceWatts > 0 ? Math.round((app1Watt / totalApplianceWatts) * 100) : 50;
  const app2Pct = totalApplianceWatts > 0 ? Math.round((app2Watt / totalApplianceWatts) * 100) : 50;

  // Dynamic 7-day usage chart reflecting real scaled baseline
  const dailyBase = parseFloat(billPrediction.estimatedDailyKwh) || 3.5;
  const dynamicUsageData = [
    { name: 'Mon', value: Math.round(dailyBase * 85), saved: 25 },
    { name: 'Tue', value: Math.round(dailyBase * 92), saved: 30 },
    { name: 'Wed', value: Math.round(dailyBase * 110), saved: 15 },
    { name: 'Thu', value: Math.round(dailyBase * 105), saved: 20 },
    { name: 'Fri', value: Math.round(dailyBase * 95), saved: 35 },
    { name: 'Sat', value: Math.round(dailyBase * 120), saved: 10 },
    { name: 'Today', value: Math.round((parseFloat(liveEnergy) || 0.1) * 100), saved: 45 },
  ];

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendChat = async () => {
    if (!chatInput.trim() || isAiLoading) return;
    
    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsAiLoading(true);

    const currentDashboardData = {
      totalPowerToday: `${liveEnergy} kWh`,
      currentWatts: `${livePower} W`,
      liveVoltage: `${liveVoltage || 238} V`,
      estMonthlyBill: `₹${billPrediction.predictedBill.toLocaleString('en-IN')}`,
      projectedMonthlyKwh: `${billPrediction.projectedMonthlyKwh} kWh`,
      todayCost: `₹${todayCost}`,
      topAppliances: `Smart AC (${app1Pct}%), OLED TV (${app2Pct}%)`
    };

    const aiResponse = await getGeminiResponse(userMsg, currentDashboardData);
    setChatMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
    setIsAiLoading(false);
  };

  const handleClearChat = () => {
    setChatMessages([
      { role: 'ai', text: "Hello! I'm EnerSense AI. Ask me about your live energy consumption, current power draw, or estimated electricity bill!" }
    ]);
  };

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
            {/* Nav Links */}
            <nav style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')} style={{ padding: '8px 16px', whiteSpace: 'nowrap', color: '#fff' }}>
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

              {/* Profile */}
              <div onClick={() => navigate('/profile')} style={{ width: 36, height: 36, minWidth: 36, minHeight: 36, flexShrink: 0, borderRadius: '50%', background: '#cd1f59', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', marginLeft: '12px', cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }} onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 0 16px rgba(205,31,89,0.5)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}>
                {userInitial}
              </div>
            </nav>
          </div>
        </GlassSurface>
      </div>

      {/* Main Content Area */}
      <main className="dashboard-main">
        <div className="wrapped-dashboard-container">
          <div className="wrapped-grid">
            
            {/* CARD 1: POWER CONSUMED TODAY (Left Column) */}
            <GlassCard colSpan={6} rowSpan={7} style={{ background: "url('/assets/site_bg.jpeg') center/cover no-repeat" }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 className="wrapped-card-label" style={{ color: '#ffffff' }}>POWER CONSUMED TODAY</h3>
                <span style={{ background: 'rgba(0,0,0,0.4)', padding: '4px 12px', borderRadius: '100px', color: '#38bdf8', fontSize: '12px', fontWeight: 'bold', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                  ⚡ {livePower} W Draw
                </span>
              </div>
              
              <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%' }}>
                <div style={{ flex: 1, paddingRight: '24px' }}>
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

            {/* CARD 2: ESTIMATED MONTHLY BILL (Middle Column) */}
            <GlassCard 
              colSpan={3} 
              rowSpan={5} 
              variant="black" 
              style={{ cursor: 'pointer' }} 
              onClick={() => setShowBillModal(true)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 className="wrapped-card-label" style={{ color: '#ffffff', margin: 0 }}>PREDICTED MONTHLY BILL</h3>
                <span style={{ color: '#ec4899', fontSize: '20px', lineHeight: 1 }}>→</span>
              </div>
              
              <div style={{ marginTop: 'auto' }}>
                <div className="wrapped-card-value" style={{ color: '#ec4899', fontSize: '56px' }}>
                  ₹{billPrediction.predictedBill.toLocaleString('en-IN')}
                </div>
                <div className="wrapped-card-subvalue" style={{ color: '#10b981', fontSize: '13px', marginTop: '14px', background: 'rgba(16, 185, 129, 0.1)', padding: '6px 12px', borderRadius: '6px', width: 'fit-content', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <TrendingDown size={14} />
                  Est. {billPrediction.projectedMonthlyKwh} kWh / month (Tier {billPrediction.slabTier})
                </div>
              </div>
            </GlassCard>

            {/* CARD 3: AI ASSISTANT (Right Column Full Height) */}
            <GlassCard colSpan={3} rowSpan={10} variant="white" style={{ borderRadius: '80px', padding: '24px 24px 40px 24px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ width: '28px' }}></div>
                <span style={{ background: '#1A1A1A', color: '#fff', padding: '6px 16px', borderRadius: '100px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={14} color="#ec4899" />
                  EnerSense AI
                </span>
                <button 
                  onClick={handleClearChat}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Clear Chat"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '4px', marginBottom: '16px', scrollbarWidth: 'none' }}>
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`chat-bubble ${msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}`}>
                    {msg.text}
                  </div>
                ))}
                {isAiLoading && (
                  <div style={{ alignSelf: 'flex-start', padding: '12px 16px', color: '#64748b' }}>
                    <Loader2 size={16} className="animate-spin" />
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="chat-input-wrapper">
                <input 
                  type="text" 
                  placeholder="Ask EnerSense AI about your bill..." 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                  className="chat-input-field"
                />
                <button 
                  onClick={handleSendChat}
                  disabled={isAiLoading || !chatInput.trim()}
                  className={`chat-send-btn ${chatInput.trim() && !isAiLoading ? 'active' : 'disabled'}`}
                >
                  <Send size={16} />
                </button>
              </div>
            </GlassCard>

            {/* CARD 4: TOP APPLIANCES (Middle Column) */}
            <GlassCard colSpan={3} rowSpan={5} variant="black" style={{ cursor: 'pointer' }} onClick={() => navigate('/appliances')}>
               <h3 className="wrapped-card-label" style={{ color: '#ffffff', margin: 0, textTransform: 'none', fontSize: '20px', fontWeight: 'bold', letterSpacing: '0' }}>Active<br/>Appliances</h3>
               <span style={{ color: '#64748b', fontSize: '10px', position: 'absolute', top: 32, right: 32, textAlign: 'right' }}>Real PZEM<br/>Breakdown</span>
               
               <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: 'auto' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                   <div style={{ flex: 1, color: '#fff', fontWeight: 'bold', fontSize: '12px' }}>Smart AC (Relay 1)<br/><span style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'normal' }}>{app1Watt} W</span></div>
                   <div style={{ color: '#38bdf8', fontWeight: 'bold', fontSize: '13px' }}>{app1Pct}%</div>
                 </div>
                 <div style={{ width: '100%', height: '3px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
                   <div style={{ width: `${app1Pct}%`, height: '100%', background: '#38bdf8', borderRadius: '2px' }}></div>
                 </div>

                 <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
                   <div style={{ flex: 1, color: '#fff', fontWeight: 'bold', fontSize: '12px' }}>OLED TV (Relay 2)<br/><span style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'normal' }}>{app2Watt} W</span></div>
                   <div style={{ color: '#a855f7', fontWeight: 'bold', fontSize: '13px' }}>{app2Pct}%</div>
                 </div>
                 <div style={{ width: '100%', height: '3px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
                   <div style={{ width: `${app2Pct}%`, height: '100%', background: '#a855f7', borderRadius: '2px' }}></div>
                 </div>
               </div>
            </GlassCard>

            {/* CARD 5: USAGE TREND (Left Column Bottom Left) */}
            <GlassCard colSpan={3} rowSpan={3} variant="magenta" style={{ borderRadius: '60px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
              <h3 className="wrapped-card-label" style={{ color: '#ffffff', textTransform: 'uppercase', fontSize: '12px', marginBottom: '16px', textAlign: 'center' }}>Daily Projection (Wh)</h3>
              
              <div style={{ flex: 1, width: '100%', minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dynamicUsageData} margin={{ top: 15, right: 0, left: 0, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.7)" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.1)' }}
                      contentStyle={{ background: '#1A1A1A', border: 'none', borderRadius: '12px' }}
                      itemStyle={{ color: '#F071F0', fontWeight: 'bold' }}
                      labelStyle={{ color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}
                    />
                    <Bar dataKey="value" fill="rgba(16, 14, 14, 0.9)" radius={[4, 4, 0, 0]}>
                      <LabelList dataKey="value" position="top" fill="rgba(249, 245, 245, 0.9)" fontSize={10}  />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            {/* CARD 6: PEAK USAGE & LIVE TELEMETRY (Left Column Bottom Right) */}
            <GlassCard colSpan={3} rowSpan={3} variant="black" style={{ borderRadius: '60px', padding: '24px 32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="wrapped-card-label" style={{ color: '#ffffff', textTransform: 'uppercase', fontSize: '12px', margin: 0 }}>LIVE LOAD</h3>
                <span style={{ color: '#10b981', fontSize: '12px', fontWeight: 'bold' }}>{liveVoltage || 239} V</span>
              </div>
              <div className="wrapped-card-value" style={{ color: '#fff', fontSize: '30px', marginTop: '8px' }}>
                {livePower} W
              </div>
              <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px' }}>
                Est. {billPrediction.estimatedDailyKwh} kWh/day run-rate
              </div>
              
              <div style={{ display: 'flex', gap: '4px', marginTop: 'auto' }}>
                <div style={{ flex: 1, height: 16, background: livePower > 10 ? '#10b981' : 'rgba(16, 185, 129, 0.2)', borderRadius: '2px' }}></div>
                <div style={{ flex: 1, height: 16, background: livePower > 100 ? '#38bdf8' : 'rgba(56, 189, 248, 0.2)', borderRadius: '2px' }}></div>
                <div style={{ flex: 1, height: 16, background: livePower > 500 ? '#f59e0b' : 'rgba(245, 158, 11, 0.2)', borderRadius: '2px' }}></div>
                <div style={{ flex: 1, height: 16, background: livePower > 1000 ? '#ef4444' : 'rgba(239, 68, 68, 0.2)', borderRadius: '2px' }}></div>
              </div>
            </GlassCard>

          </div>
        </div>
      </main>

      {/* Bill Breakdown Modal */}
      {showBillModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }} onClick={() => setShowBillModal(false)}>
          <div style={{
            background: '#121214',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '460px',
            width: '90%',
            color: '#fff'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>⚡ Monthly Bill Forecast</h2>
              <button 
                onClick={() => setShowBillModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer' }}
              >✕</button>
            </div>

            <div style={{ background: 'rgba(236, 72, 153, 0.1)', border: '1px solid rgba(236, 72, 153, 0.3)', borderRadius: '16px', padding: '16px', marginBottom: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '13px', color: '#ec4899', fontWeight: 'bold' }}>PROJECTED 30-DAY TOTAL</div>
              <div style={{ fontSize: '42px', fontWeight: 'bold', color: '#fff', margin: '4px 0' }}>
                ₹{billPrediction.predictedBill.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                Based on current {livePower}W load & {liveEnergy} kWh accumulated
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ color: '#94a3b8' }}>Projected Monthly Units:</span>
                <span style={{ fontWeight: 'bold' }}>{billPrediction.projectedMonthlyKwh} kWh</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ color: '#94a3b8' }}>Tariff Slab Tier:</span>
                <span style={{ fontWeight: 'bold', color: '#38bdf8' }}>Tier {billPrediction.slabTier} (Discom Slab)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ color: '#94a3b8' }}>Base Energy Charges:</span>
                <span>₹{billPrediction.baseEnergyCost}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ color: '#94a3b8' }}>State Electricity Duty (9%):</span>
                <span>₹{billPrediction.dutyCharge}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ color: '#94a3b8' }}>Fixed Meter Charges:</span>
                <span>₹{billPrediction.fixedCharge}</span>
              </div>
            </div>

            <button 
              onClick={() => setShowBillModal(false)}
              style={{
                width: '100%',
                marginTop: '24px',
                padding: '12px',
                background: '#ec4899',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
