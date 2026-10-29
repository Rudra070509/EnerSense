import React, { createContext, useState, useEffect, useRef } from 'react';
import mqtt from 'mqtt';
import { calculateTodayCost, calculateMonthlyPrediction } from '../utils/billing';

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
  const [isHardwareOnline, setIsHardwareOnline] = useState(false);
  const [powerData, setPowerData] = useState(
    Array.from({ length: 15 }, () => ({ time: '', power: 0 }))
  );
  
  // Real-time bill calculations
  const [todayCost, setTodayCost] = useState('0.00');
  const [billPrediction, setBillPrediction] = useState(() => calculateMonthlyPrediction(0, 0));

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
      const appRes = await fetch('http://localhost:5000/api/appliances', { headers });
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
      const energyRes = await fetch('http://localhost:5000/api/energy/today', { headers });
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
    const client = mqtt.connect('ws://broker.hivemq.com:8000/mqtt');
    
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

          if (data.appliance1) {
            if (data.appliance1.energy !== undefined) totalEnergy += data.appliance1.energy;
            if (data.appliance1.power !== undefined) combinedPower += data.appliance1.power;
            if (data.appliance1.voltage !== undefined && data.appliance1.voltage > 0) voltage = data.appliance1.voltage;
          }
          if (data.appliance2) {
            if (data.appliance2.power !== undefined) combinedPower += data.appliance2.power;
            if (voltage === 0 && data.appliance2.voltage !== undefined && data.appliance2.voltage > 0) {
              voltage = data.appliance2.voltage;
            }
          }

          setLiveVoltage(Math.round(voltage));
          setLivePower(Math.round(combinedPower));

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

          // Update graph data
          const now = new Date();
          const timeStr = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
          const newPoint = { time: timeStr, power: Math.round(combinedPower) };
          
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

      const token = localStorage.getItem('token');
      if (token) {
        await fetch(`http://localhost:5000/api/appliances/${channel}`, {
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

  return (
    <MqttContext.Provider value={{
      appliances,
      toggleAppliance,
      turnAllOff,
      renameAppliance,
      refreshAppliances: loadUserDataFromDb,
      liveEnergy,
      liveVoltage,
      livePower,
      isHardwareOnline,
      powerData,
      todayCost,
      billPrediction
    }}>
      {children}
    </MqttContext.Provider>
  );
};
