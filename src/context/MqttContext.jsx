import React, { createContext, useState, useEffect, useRef } from 'react';
import mqtt from 'mqtt';
import { calculateTodayCost, calculateMonthlyPrediction } from '../utils/billing';
import { API_BASE_URL } from '../utils/api';

export const MqttContext = createContext();

export const MqttProvider = ({ children }) => {
  // Start with clean dynamic appliances (fetched from DB)
  const [appliances, setAppliances] = useState([
    { id: 1, channel: 1, name: 'Appliance 1', room: 'Living Room', type: 'light', wattage: 0, isOn: false, image: '/assets/appliance_card1.jpg' },
    { id: 2, channel: 2, name: 'Appliance 2', room: 'Living Room', type: 'tv', wattage: 0, isOn: false, image: '/assets/appliance_card2.jpg' },
  ]);

  // Clean initialization starting at 0.000 (No more fake 0.800)
  const [liveEnergy, setLiveEnergy] = useState('0.000');
  const [liveVoltage, setLiveVoltage] = useState(0);
  const [livePower, setLivePower] = useState(0); // Watts
  const [liveCurrent, setLiveCurrent] = useState(0); // Amperes
  const [isHardwareOnline, setIsHardwareOnline] = useState(false);
  const [powerData, setPowerData] = useState(
    Array.from({ length: 20 }, () => ({
      time: '',
      power: 0,
      totalPower: 0,
      app1Power: 0,
      app2Power: 0,
      voltage: 0,
      current: 0,
      app1Current: 0,
      app2Current: 0,
      energy: 0
    }))
  );
  
  // Real-time bill calculations
  const [todayCost, setTodayCost] = useState('0.00');
  const [billPrediction, setBillPrediction] = useState(() => calculateMonthlyPrediction(0, 0));

  // Global AI chat messages (persisted across page navigation)
  const [chatMessages, setChatMessages] = useState([
    { role: 'ai', text: "Hello! I'm EnerSense AI. Ask me about your live energy consumption, current power draw, or estimated electricity bill!" }
  ]);

  const mqttClientRef = useRef(null);
  const powerDataRef = useRef(powerData);
  const lastTelemetryTime = useRef(Date.now());

  // Fetch logged-in user's custom named appliances & today's cumulative energy from DB
  const loadUserDataFromDb = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const headers = { 'Authorization': `Bearer ${token}` };

      // 1. Fetch user's appliances
      const appRes = await fetch('${API_BASE_URL}/api/appliances', { headers });
      if (appRes.ok) {
        const dbApps = await appRes.json();
        if (Array.isArray(dbApps) && dbApps.length > 0) {
          setAppliances(prev => dbApps.map(dbA => {
            const existing = prev.find(p => p.channel === dbA.channel);
            return {
              id: dbA.channel,
              channel: dbA.channel,
              name: dbA.name || `Appliance ${dbA.channel}`,
              room: dbA.room || 'Living Room',
              type: dbA.type || 'light',
              wattage: existing ? existing.wattage : 0,
              isOn: existing ? existing.isOn : false,
              image: dbA.image || (dbA.channel === 1 ? '/assets/appliance_card1.jpg' : '/assets/appliance_card2.jpg')
            };
          }));
        }
      }

      // 2. Fetch today's database consumption
      const energyRes = await fetch('${API_BASE_URL}/api/energy/today', { headers });
      if (energyRes.ok) {
        const stats = await energyRes.json();
        if (stats.hasLogsToday && stats.todayKwh) {
          setLiveEnergy(stats.todayKwh);
          const cost = calculateTodayCost(stats.todayKwh);
          setTodayCost(cost.toFixed(2));
        }
      }
    } catch (e) {
      console.warn('Could not load user data from backend:', e.message);
    }
  };

  useEffect(() => {
    loadUserDataFromDb();
  }, []);

  // Check hardware online watchdog (every 6 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      const diff = Date.now() - lastTelemetryTime.current;
      if (diff > 10000 && isHardwareOnline) {
        setIsHardwareOnline(false);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isHardwareOnline]);

  useEffect(() => {
    const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
    const defaultBroker = isHttps ? 'wss://broker.hivemq.com:8884/mqtt' : 'ws://broker.hivemq.com:8000/mqtt';
    const brokerUrl = import.meta.env.VITE_MQTT_BROKER_URL || defaultBroker;
    const client = mqtt.connect(brokerUrl);
    
    client.on('connect', () => {
      console.log('Global MQTT Connected');
      client.subscribe('enersense/telemetry');
    });

    client.on('message', (topic, message) => {
      if (topic === 'enersense/telemetry') {
        try {
          const data = JSON.parse(message.toString());
          lastTelemetryTime.current = Date.now();
          setIsHardwareOnline(true);
          
          let totalEnergy = 0;
          let combinedPower = 0;
          let voltage = 0;
          let totalCurrent = 0;
          let app1Power = 0;
          let app2Power = 0;
          let app1Current = 0;
          let app2Current = 0;

          if (data.appliance1) {
            if (data.appliance1.energy !== undefined) totalEnergy += data.appliance1.energy;
            if (data.appliance1.power !== undefined) {
              combinedPower += data.appliance1.power;
              app1Power = data.appliance1.power;
            }
            if (data.appliance1.voltage !== undefined && data.appliance1.voltage > 0) {
              voltage = data.appliance1.voltage;
            }
            if (data.appliance1.current !== undefined) {
              totalCurrent += data.appliance1.current;
              app1Current = data.appliance1.current;
            }
          }
          if (data.appliance2) {
            if (data.appliance2.power !== undefined) {
              combinedPower += data.appliance2.power;
              app2Power = data.appliance2.power;
            }
            if (voltage === 0 && data.appliance2.voltage !== undefined && data.appliance2.voltage > 0) {
              voltage = data.appliance2.voltage;
            }
            if (data.appliance2.current !== undefined) {
              totalCurrent += data.appliance2.current;
              app2Current = data.appliance2.current;
            }
          }

          setLiveVoltage(Math.round(voltage));
          setLivePower(Math.round(combinedPower));
          setLiveCurrent(parseFloat(totalCurrent.toFixed(3)));

          if (totalEnergy > 0) {
            const formattedKwh = totalEnergy.toFixed(3);
            setLiveEnergy(formattedKwh);

            const costToday = calculateTodayCost(totalEnergy);
            setTodayCost(costToday.toFixed(2));

            const prediction = calculateMonthlyPrediction(totalEnergy, combinedPower);
            setBillPrediction(prediction);
          } else {
            const prediction = calculateMonthlyPrediction(0, combinedPower);
            setBillPrediction(prediction);
          }
          
          // Update appliance wattages
          setAppliances(prev => prev.map(app => {
            if (app.channel === 1 && data.appliance1 && data.appliance1.power !== undefined) {
              const w = Math.round(data.appliance1.power);
              return { ...app, wattage: w, isOn: w > 0 || app.isOn };
            }
            if (app.channel === 2 && data.appliance2 && data.appliance2.power !== undefined) {
              const w = Math.round(data.appliance2.power);
              return { ...app, wattage: w, isOn: w > 0 || app.isOn };
            }
            return app;
          }));

          // Update graph data with all real-time parameters
          const now = new Date();
          const timeStr = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
          const newPoint = { 
            time: timeStr, 
            power: Math.round(combinedPower),
            totalPower: Math.round(combinedPower),
            app1Power: Math.round(app1Power * 10) / 10,
            app2Power: Math.round(app2Power * 10) / 10,
            voltage: Math.round(voltage * 10) / 10,
            current: parseFloat(totalCurrent.toFixed(3)),
            app1Current: parseFloat(app1Current.toFixed(3)),
            app2Current: parseFloat(app2Current.toFixed(3)),
            energy: parseFloat(totalEnergy.toFixed(3))
          };
          
          const newData = [...powerDataRef.current.slice(1), newPoint];
          powerDataRef.current = newData;
          setPowerData(newData);
          
        } catch (e) {
          console.error("Failed to parse telemetry:", e);
        }
      }
    });

    mqttClientRef.current = client;

    return () => client.end();
  }, []);

  const toggleAppliance = (id) => {
    setAppliances(prev => prev.map(app => {
      if (app.id === id || app.channel === id) {
        const newState = !app.isOn;
        if (mqttClientRef.current) {
          const payload = JSON.stringify({ applianceId: app.channel || id, state: newState ? "ON" : "OFF" });
          mqttClientRef.current.publish('enersense/commands', payload);
        }
        return { ...app, isOn: newState };
      }
      return app;
    }));
  };

  const turnAllOff = () => {
    setAppliances(prev => prev.map(app => {
      if (app.isOn && mqttClientRef.current) {
        mqttClientRef.current.publish('enersense/commands', JSON.stringify({ applianceId: app.channel || app.id, state: "OFF" }));
      }
      return { ...app, isOn: false };
    }));
  };

  // Rename appliance & save to PostgreSQL
  const renameAppliance = async (channel, newName, newRoom = 'Living Room') => {
    try {
      // Optimistic UI update
      setAppliances(prev => prev.map(app => 
        app.channel === channel ? { ...app, name: newName, room: newRoom } : app
      ));

      const token = localStorage.getItem('enersense_token') || localStorage.getItem('token');
      if (token) {
        await fetch(`${API_BASE_URL}/api/appliances/${channel}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ name: newName, room: newRoom })
        });
      }
    } catch (e) {
      console.error('Failed to rename appliance:', e);
    }
  };

  // Add new appliance & persist to PostgreSQL
  const addAppliance = async (newAppData) => {
    try {
      const token = localStorage.getItem('enersense_token') || localStorage.getItem('token');
      const res = await fetch('${API_BASE_URL}/api/appliances', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(newAppData)
      });

      if (res.ok) {
        const created = await res.json();
        setAppliances(prev => {
          const formatted = {
            id: created.channel,
            channel: created.channel,
            name: created.name,
            room: created.room || 'Living Room',
            type: created.type || 'light',
            wattage: 0,
            isOn: false,
            image: created.image || '/assets/appliance_card1.jpg'
          };
          const existingIdx = prev.findIndex(a => a.channel === created.channel);
          if (existingIdx >= 0) {
            const next = [...prev];
            next[existingIdx] = formatted;
            return next;
          }
          return [...prev, formatted];
        });
        return created;
      }
    } catch (e) {
      console.error('Failed to add appliance to backend:', e);
    }

    // Local state fallback if backend/token unavailable
    const fallbackChannel = newAppData.channel || appliances.length + 1;
    const fallbackApp = {
      id: fallbackChannel,
      channel: fallbackChannel,
      name: newAppData.name || `Appliance ${fallbackChannel}`,
      room: newAppData.room || 'Living Room',
      type: newAppData.type || 'light',
      wattage: 0,
      isOn: false,
      image: newAppData.image || '/assets/appliance_card1.jpg'
    };
    setAppliances(prev => [...prev, fallbackApp]);
    return fallbackApp;
  };

  // Delete appliance
  const deleteAppliance = async (channel) => {
    try {
      setAppliances(prev => prev.filter(a => a.channel !== channel));
      const token = localStorage.getItem('enersense_token') || localStorage.getItem('token');
      if (token) {
        await fetch(`${API_BASE_URL}/api/appliances/${channel}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
    } catch (e) {
      console.error('Failed to delete appliance:', e);
    }
  };

  return (
    <MqttContext.Provider value={{
      appliances,
      toggleAppliance,
      turnAllOff,
      renameAppliance,
      addAppliance,
      deleteAppliance,
      refreshAppliances: loadUserDataFromDb,
      liveEnergy,
      liveVoltage,
      livePower,
      liveCurrent,
      isHardwareOnline,
      powerData,
      todayCost,
      billPrediction,
      chatMessages,
      setChatMessages
    }}>
      {children}
    </MqttContext.Provider>
  );
};
