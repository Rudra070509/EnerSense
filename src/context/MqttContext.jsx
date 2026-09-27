import React, { createContext, useState, useEffect, useRef } from 'react';
import mqtt from 'mqtt';

export const MqttContext = createContext();

const INITIAL_APPLIANCES = [
  { id: 1, type: 'ac', name: 'Smart AC', room: 'Living Room', wattage: 1200, isOn: false, image: '/assets/appliance_card1.jpg' },
  { id: 2, type: 'tv', name: 'OLED TV', room: 'Living Room', wattage: 150, isOn: false, image: '/assets/appliance_card2.jpg' },
  { id: 3, type: 'light', name: 'Hue Lights', room: 'Bedroom', wattage: 35, isOn: false, image: '/assets/appliance_card3.jpg' },
];

export const MqttProvider = ({ children }) => {
  const [appliances, setAppliances] = useState(INITIAL_APPLIANCES);
  const [liveEnergy, setLiveEnergy] = useState('0.00');
  const [powerData, setPowerData] = useState(
    Array.from({ length: 15 }, () => ({ time: '', power: 0 }))
  );
  
  const mqttClientRef = useRef(null);
  const powerDataRef = useRef(powerData);

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
          
          let totalEnergy = 0;
          let combinedPower = 0;

          if (data.appliance1) {
            if (data.appliance1.energy !== undefined) totalEnergy += data.appliance1.energy;
            if (data.appliance1.power !== undefined) combinedPower += data.appliance1.power;
          }
          if (data.appliance2) {
            if (data.appliance2.energy !== undefined) totalEnergy += data.appliance2.energy;
            if (data.appliance2.power !== undefined) combinedPower += data.appliance2.power;
          }
          
          // Update live energy total
          if (totalEnergy > 0) {
            setLiveEnergy(totalEnergy.toFixed(3));
          }
          
          // Update appliance wattages in array
          setAppliances(prev => prev.map(app => {
            if (app.id === 1 && data.appliance1 && data.appliance1.power !== undefined) {
              return { ...app, wattage: Math.round(data.appliance1.power) };
            }
            if (app.id === 2 && data.appliance2 && data.appliance2.power !== undefined) {
              return { ...app, wattage: Math.round(data.appliance2.power) };
            }
            return app;
          }));

          // Update graph data with combined total power draw
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
      if (app.id === id) {
        const newState = !app.isOn;
        if (mqttClientRef.current) {
          const payload = JSON.stringify({ applianceId: id, state: newState ? "ON" : "OFF" });
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
        mqttClientRef.current.publish('enersense/commands', JSON.stringify({ applianceId: app.id, state: "OFF" }));
      }
      return { ...app, isOn: false };
    }));
  };

  return (
    <MqttContext.Provider value={{
      appliances,
      toggleAppliance,
      turnAllOff,
      liveEnergy,
      powerData
    }}>
      {children}
    </MqttContext.Provider>
  );
};
