import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Cpu, 
  LineChart as LineChartIcon, 
  Sparkles, 
  FileText, 
  Send,
  Loader2,
  Trash2
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, LabelList } from 'recharts';
import '../styles/dashboard.css';
import GlassCard from '../components/Dashboard/GlassCard';
import GlassSurface from '../components/GlassSurface/GlassSurface';
import { getGeminiResponse } from '../utils/gemini';

/**
 * DashboardPage Component
 * 
 * This is the primary application interface where users view their energy 
 * consumption data, estimated bills, top appliances, and interact with the AI assistant.
 * It uses a Bento-box style grid layout made up of customized GlassCards.
 */

const mockUsageData = [
  { name: 'Mon', value: 400, saved: 120 },
  { name: 'Tue', value: 300, saved: 150 },
  { name: 'Wed', value: 550, saved: 80 },
  { name: 'Thu', value: 450, saved: 100 },
  { name: 'Fri', value: 380, saved: 140 },
  { name: 'Sat', value: 200, saved: 200 },
  { name: 'Sun', value: 250, saved: 180 },
];

const categoryData = [
  { name: 'Mon', value: 20 },
  { name: 'Tue', value: 35 },
  { name: 'Wed', value: 25 },
  { name: 'Thu', value: 45 },
  { name: 'Fri', value: 30 },
  { name: 'Sat', value: 55 },
  { name: 'Sun', value: 40 }
];

export default function DashboardPage() {
  const navigate = useNavigate();
  
  // Controls the currently active tab in the top navigation bar (e.g., 'dashboard', 'appliances')
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // State for the AI Chat Assistant. Pre-populated with a greeting message.
  const [chatMessages, setChatMessages] = useState([{ role: 'ai', text: "Hello! I'm EnerSense AI. Ask me about your energy consumption, appliances, or how to save on your bill!" }]);
  
  // Holds the text currently typed into the chat input field
  const [chatInput, setChatInput] = useState('');
  
  // Boolean to show a loading spinner while waiting for the Gemini API response
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // Reference to the bottom of the chat list, used to auto-scroll when new messages arrive
  const chatEndRef = useRef(null);

  // Read user data for the avatar initial
  const savedUser = JSON.parse(localStorage.getItem('enersense_user') || '{}');
  const userInitial = (savedUser.firstName || savedUser.email || 'U')[0].toUpperCase();

  // Scroll to the bottom of the chat window whenever a new message is added
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  /**
   * Handles sending a message to the AI assistant.
   * Updates UI immediately with user message, triggers API call, 
   * and appends AI response when finished.
   */
  const handleSendChat = async () => {
    if (!chatInput.trim() || isAiLoading) return; // Don't send empty messages or if already loading
    
    const userMsg = chatInput.trim();
    setChatInput(''); // Clear input field
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]); // Add user message to UI
    setIsAiLoading(true);

    // Provide the AI with context about the current dashboard values
    // (In the future, this will be real dynamic data from the database/MQTT)
    const currentDashboardData = {
      totalPowerToday: '14.2',
      estMonthlyBill: '3,450',
      topAppliances: 'AC Unit (66%), Fridge (24%), Washer (10%)'
    };

    // Fetch response from Gemini AI
    const aiResponse = await getGeminiResponse(userMsg, currentDashboardData);
    
    // Add AI response to UI
    setChatMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
    setIsAiLoading(false);
  };

  /**
   * Clears the chat history back to just the initial greeting
   */
  const handleClearChat = () => {
    setChatMessages([{ role: 'ai', text: "Hello! I'm EnerSense AI. Ask me about your energy consumption, appliances, or how to save on your bill!" }]);
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
              <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')} style={{ padding: '8px 16px', whiteSpace: 'nowrap', color: 'rgba(255, 255, 255, 0.8)' }}>
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </button>
              <button className={`nav-item ${activeTab === 'appliances' ? 'active' : ''}`} onClick={() => setActiveTab('appliances')} style={{ padding: '8px 16px', whiteSpace: 'nowrap', color: 'rgba(255, 255, 255, 0.8)' }}>
                <Cpu size={18} />
                <span>Appliances</span>
              </button>
              <button className="nav-item" style={{ padding: '8px 16px', whiteSpace: 'nowrap', color: 'rgba(255, 255, 255, 0.8)' }}>
                <LineChartIcon size={18} />
                <span>Energy Graphs</span>
              </button>
              <button className="nav-item" style={{ padding: '8px 16px', whiteSpace: 'nowrap', color: 'rgba(255, 255, 255, 0.8)' }}>
                <FileText size={18} />
                <span>Reports</span>
              </button>

              {/* Profile */}
              <div onClick={() => navigate('/profile')} style={{ width: 36, height: 36, minWidth: 36, minHeight: 36, flexShrink: 0, borderRadius: '50%', background: '#cd1f59', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', marginLeft: '12px', cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }} onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 0 16px rgba(205,31,89,0.5)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}>{userInitial}</div>
            </nav>
          </div>
        </GlassSurface>
      </div>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="wrapped-dashboard-container">
          <div className="wrapped-grid">
            {/* ROW 1-7: Left Column */}
            <GlassCard colSpan={6} rowSpan={7} style={{ background: "url('/assets/jellyfish_bg.png') center/cover no-repeat" }}>
              <h3 className="wrapped-card-label" style={{ color: '#ffffff' }}>POWER CONSUMED TODAY</h3>
              
              <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%' }}>
                <div style={{ flex: 1, paddingRight: '24px' }}>
                  <div className="wrapped-card-value" style={{ fontSize: '120px', color: '#ffffff', lineHeight: 1 }}>14.2</div>
                  <div className="wrapped-card-subvalue" style={{ color: '#ffffff', opacity: 0.8, fontSize: '16px', fontWeight: 'normal', marginTop: '8px' }}>
                    kWh consumed since midnight.
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="wrapped-card-value" style={{ fontSize: '32px', color: '#10b981', lineHeight: 1 }}>₹124.50</div>
                  <div className="wrapped-card-subvalue" style={{ color: '#ffffff', opacity: 0.8, fontSize: '16px', fontWeight: 'normal', marginTop: '8px' }}>
                    Est. cost today
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* ROW 1-5: Middle Column */}
            <GlassCard colSpan={3} rowSpan={5} variant="black" style={{ cursor: 'pointer' }} onClick={() => alert('Detailed Monthly Bill Breakdown coming soon in the Data Integration phase!')}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 className="wrapped-card-label" style={{ color: '#ffffff', margin: 0 }}>ESTIMATED MONTHLY BILL</h3>
                <span style={{ color: '#ec4899', fontSize: '20px', lineHeight: 1 }}>→</span>
              </div>
              
              <div style={{ marginTop: 'auto' }}>
                <div className="wrapped-card-value" style={{ color: '#ec4899', fontSize: '64px' }}>₹3,450</div>
                <div className="wrapped-card-subvalue" style={{ color: '#10b981', fontSize: '14px', marginTop: '16px', background: 'rgba(16, 185, 129, 0.1)', padding: '6px 12px', borderRadius: '6px', width: 'fit-content' }}>
                  ↓ 12% usage vs last month
                </div>
              </div>
            </GlassCard>

            {/* ROW 1-10: Right Column (Full Height) */}
            <GlassCard colSpan={3} rowSpan={10} variant="white" style={{ borderRadius: '80px', padding: '24px 24px 40px 24px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ width: '28px' }}></div> {/* Spacer for centering */}
                <span style={{ background: '#000', color: '#fff', padding: '6px 16px', borderRadius: '100px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={14} /> AI Suggestions
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
                  placeholder="Ask EnerSense AI..." 
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

            {/* ROW 6-10: Middle Column */}
            <GlassCard colSpan={3} rowSpan={5} variant="black">
               <h3 className="wrapped-card-label" style={{ color: '#ffffff', margin: 0, textTransform: 'none', fontSize: '20px', fontWeight: 'bold', letterSpacing: '0' }}>Top<br/>Appliances</h3>
               <span style={{ color: '#64748b', fontSize: '10px', position: 'absolute', top: 32, right: 32, textAlign: 'right' }}>Based on<br/>consumption</span>
               
               <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: 'auto' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                   <div style={{ flex: 1, color: '#fff', fontWeight: 'bold', fontSize: '12px' }}>AC<br/>Unit</div>
                   <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '12px' }}>66%</div>
                 </div>
                 <div style={{ width: '100%', height: '2px', background: 'rgba(255,255,255,0.1)' }}>
                   <div style={{ width: '66%', height: '100%', background: '#0ea5e9' }}></div>
                 </div>

                 <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                   <div style={{ flex: 1, color: '#fff', fontWeight: 'bold', fontSize: '12px' }}>Refrigerator</div>
                   <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '12px' }}>22%</div>
                 </div>
                 <div style={{ width: '100%', height: '2px', background: 'rgba(255,255,255,0.1)' }}>
                   <div style={{ width: '22%', height: '100%', background: '#0ea5e9' }}></div>
                 </div>
               </div>
            </GlassCard>

            {/* ROW 8-10: Left Column (Left Side) */}
            <GlassCard colSpan={3} rowSpan={3} variant="magenta" style={{ borderRadius: '60px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
              <h3 className="wrapped-card-label" style={{ color: '#ffffff', textTransform: 'uppercase', fontSize: '12px', marginBottom: '16px', textAlign: 'center' }}>Usage Trend</h3>
              
              <div style={{ flex: 1, width: '100%', minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockUsageData} margin={{ top: 15, right: 0, left: 0, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.7)" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.1)' }}
                      contentStyle={{ background: '#09090b', border: 'none', borderRadius: '12px' }}
                      itemStyle={{ color: '#F071F0', fontWeight: 'bold' }}
                      labelStyle={{ color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}
                    />
                    <Bar dataKey="value" fill="rgba(16, 14, 14, 0.9)" radius={[4, 4, 0, 0]}>
                      <LabelList dataKey="value" position="top" fill="rgba(249, 245, 245, 0.9)" fontSize={11}  />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            {/* ROW 8-10: Left Column (Right Side) */}
            <GlassCard colSpan={3} rowSpan={3} variant="black" style={{ borderRadius: '60px', padding: '24px 32px' }}>
              <h3 className="wrapped-card-label" style={{ color: '#ffffff', textTransform: 'uppercase', fontSize: '12px' }}>Peak Usage Time</h3>
              <div className="wrapped-card-value" style={{ color: '#fff', fontSize: '28px', marginTop: '8px' }}>Tuesday, 10 PM</div>
              <div style={{ color: '#64748b', fontSize: '12px', marginTop: '4px' }}>You are a<br/>night owl.</div>
              
              <div style={{ display: 'flex', gap: '4px', marginTop: 'auto' }}>
                <div style={{ flex: 1, height: 16, background: 'rgba(168, 85, 247, 0.2)', borderRadius: '2px' }}></div>
                <div style={{ flex: 1, height: 16, background: 'rgba(168, 85, 247, 0.4)', borderRadius: '2px' }}></div>
                <div style={{ flex: 1, height: 16, background: 'rgba(168, 85, 247, 0.6)', borderRadius: '2px' }}></div>
                <div style={{ flex: 1, height: 16, background: 'rgba(168, 85, 247, 0.8)', borderRadius: '2px' }}></div>
                <div style={{ flex: 1, height: 16, background: '#a855f7', borderRadius: '2px' }}></div>
              </div>
            </GlassCard>
          </div>
        </div>
      </main>
    </div>
  );
}
