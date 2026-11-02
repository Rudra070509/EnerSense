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

  // Persistent live energy & cost so page navigation or refresh NEVER resets to 0.000
  const [liveEnergy, setLiveEnergy] = useState(() => localStorage.getItem('enersense_today_kwh') || '0.000');
  const [todayCost, setTodayCost] = useState(() => localStorage.getItem('enersense_today_cost') || '0.00');
  const [liveVoltage, setLiveVoltage] = useState(0);
  const [livePower, setLivePower] = useState(0); // Watts
  const [liveCurrent, setLiveCurrent] = useState(0); // Amperes
  const [isHardwareOnline, setIsHardwareOnline] = useState(false);

  // Manual or auto sensor channel swap (in case CT 1 is clamped to Relay 2 or vice versa)
  const [swapSensors, setSwapSensors] = useState(() => localStorage.getItem('enersense_sensor_swap') === 'true');

  const toggleSwapSensors = () => {
    setSwapSensors(prev => {
      const next = !prev;
      localStorage.setItem('enersense_sensor_swap', String(next));
      return next;
    });
  };

  const accumulatedEnergyRef = useRef(parseFloat(localStorage.getItem('enersense_today_kwh') || '0'));
  const appliancesRef = useRef(appliances);
  useEffect(() => {
    appliancesRef.current = appliances;
  }, [appliances]);

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
  
  // Real-time bill calculations (initialized from stored kWh)
  const [billPrediction, setBillPrediction] = useState(() => 
    calculateMonthlyPrediction(parseFloat(localStorage.getItem('enersense_today_kwh') || '0'), 0)
  );

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
      const token = localStorage.getItem('enersense_token') || localStorage.getItem('token');
      if (!token) return;

      const headers = { 'Authorization': `Bearer ${token}` };

      // 1. Fetch user's appliances
      const appRes = await fetch(`${API_BASE_URL}/api/appliances`, { headers });
      if (appRes.ok) {
        const dbApps = await appRes.json();
        if (Array.isArray(dbApps) && dbApps.length > 0) {
          setAppliances(prev => dbApps.map(dbA => {
            const existing = prev.find(p => p.channel === dbA.channel || p.id === dbA.channel);
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
      const energyRes = await fetch(`${API_BASE_URL}/api/energy/today`, { headers });
      if (energyRes.ok) {
        const stats = await energyRes.json();
        if (stats.hasLogsToday && stats.todayKwh) {
          const dbKwh = parseFloat(stats.todayKwh) || 0;
          if (dbKwh > accumulatedEnergyRef.current) {
            accumulatedEnergyRef.current = dbKwh;
            const formatted = dbKwh.toFixed(3);
            setLiveEnergy(formatted);
            localStorage.setItem('enersense_today_kwh', formatted);

            const cost = calculateTodayCost(dbKwh);
            setTodayCost(cost.toFixed(2));
            localStorage.setItem('enersense_today_cost', cost.toFixed(2));

            const prediction = calculateMonthlyPrediction(dbKwh, livePower);
            setBillPrediction(prediction);
          }
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
          const now = Date.now();
          const dtSeconds = Math.min(Math.max((now - lastTelemetryTime.current) / 1000, 0.5), 10);
          lastTelemetryTime.current = now;
          setIsHardwareOnline(true);
          
          let rawApp1Power = data.appliance1?.power || 0;
          let rawApp2Power = data.appliance2?.power || 0;
          let rawApp1Current = data.appliance1?.current || 0;
          let rawApp2Current = data.appliance2?.current || 0;
          let rawApp1Energy = data.appliance1?.energy || 0;
          let rawApp2Energy = data.appliance2?.energy || 0;

          let voltage = 0;
          if (data.appliance1?.voltage && data.appliance1.voltage > 0) {
            voltage = data.appliance1.voltage;
          } else if (data.appliance2?.voltage && data.appliance2.voltage > 0) {
            voltage = data.appliance2.voltage;
          }

          const combinedPower = rawApp1Power + rawApp2Power;
          const totalCurrent = rawApp1Current + rawApp2Current;
          const hardwareTotalEnergy = rawApp1Energy + rawApp2Energy;

          // Smart Auto-Routing / Channel Swap:
          // Check which appliance the user has turned ON in the UI
          const currentApps = appliancesRef.current;
          const app1 = currentApps.find(a => (a.channel || a.id) === 1);
          const app2 = currentApps.find(a => (a.channel || a.id) === 2);
          const app1IsOn = app1?.isOn || false;
          const app2IsOn = app2?.isOn || false;

          let effectiveApp1Power = rawApp1Power;
          let effectiveApp2Power = rawApp2Power;
          let effectiveApp1Current = rawApp1Current;
          let effectiveApp2Current = rawApp2Current;

          // If manual swap is enabled OR if only Appliance 2 is ON but raw power arrived on Sensor 1:
          const shouldSwap = swapSensors || (!app1IsOn && app2IsOn && rawApp1Power > 5 && rawApp2Power === 0);
          if (shouldSwap) {
            effectiveApp1Power = rawApp2Power;
            effectiveApp2Power = rawApp1Power;
            effectiveApp1Current = rawApp2Current;
            effectiveApp2Current = rawApp1Current;
          }

          setLiveVoltage(Math.round(voltage));
          setLivePower(Math.round(combinedPower));
          setLiveCurrent(parseFloat(totalCurrent.toFixed(3)));

          // Real-time incremental energy integration:
          // Even if PZEM takes minutes to increment its 1 Wh counter, integrate wattage in real-time
          if (combinedPower > 0) {
            const incrementalKwh = (combinedPower * dtSeconds) / 3600000;
            accumulatedEnergyRef.current += incrementalKwh;
          }

          const effectiveEnergy = Math.max(hardwareTotalEnergy, accumulatedEnergyRef.current);
          const formattedKwh = effectiveEnergy.toFixed(3);
          setLiveEnergy(formattedKwh);
          localStorage.setItem('enersense_today_kwh', formattedKwh);

          const costToday = calculateTodayCost(effectiveEnergy);
          setTodayCost(costToday.toFixed(2));
          localStorage.setItem('enersense_today_cost', costToday.toFixed(2));

          const prediction = calculateMonthlyPrediction(effectiveEnergy, combinedPower);
          setBillPrediction(prediction);
          
          // Update appliance wattages WITHOUT overriding isOn states of turned-off appliances
          setAppliances(prev => prev.map(app => {
            const chan = app.channel || app.id;
            if (chan === 1) {
              const w = Math.round(effectiveApp1Power);
              return { ...app, wattage: w };
            }
            if (chan === 2) {
              const w = Math.round(effectiveApp2Power);
              return { ...app, wattage: w };
            }
            return app;
          }));

          // Update graph data with all real-time parameters
          const dateObj = new Date();
          const timeStr = `${dateObj.getHours()}:${dateObj.getMinutes().toString().padStart(2, '0')}:${dateObj.getSeconds().toString().padStart(2, '0')}`;
          const newPoint = { 
            time: timeStr, 
            power: Math.round(combinedPower),
            totalPower: Math.round(combinedPower),
            app1Power: Math.round(effectiveApp1Power * 10) / 10,
            app2Power: Math.round(effectiveApp2Power * 10) / 10,
            voltage: Math.round(voltage * 10) / 10,
            current: parseFloat(totalCurrent.toFixed(3)),
            app1Current: parseFloat(effectiveApp1Current.toFixed(3)),
            app2Current: parseFloat(effectiveApp2Current.toFixed(3)),
            energy: parseFloat(formattedKwh)
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
  }, [swapSensors]);

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
      setAppliances(prev => prev.map(app => 
        (app.channel === channel || app.id === channel) ? { ...app, name: newName, room: newRoom } : app
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
      const res = await fetch(`${API_BASE_URL}/api/appliances`, {
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
      setAppliances(prev => prev.filter(a => (a.channel !== channel && a.id !== channel)));
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
      setChatMessages,
      swapSensors,
      toggleSwapSensors
    }}>
      {children}
    </MqttContext.Provider>
  );
};
