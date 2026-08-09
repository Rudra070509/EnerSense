import { useState } from 'react';

export const useMockData = () => {
  const [metrics, setMetrics] = useState({
    currentUsage: 4.2,
    todaysCost: 145,
    thisMonthUsage: 340,
    predictedBill: 2150
  });

  const chartData = [
    { time: '00:00', usage: 1.2 },
    { time: '04:00', usage: 0.8 },
    { time: '08:00', usage: 3.5 },
    { time: '12:00', usage: 4.2 },
    { time: '16:00', usage: 3.8 },
    { time: '20:00', usage: 5.5 },
    { time: '24:00', usage: 2.1 }
  ];

  const barChartData = [
    { day: 'Mon', usage: 12 },
    { day: 'Tue', usage: 19 },
    { day: 'Wed', usage: 15 },
    { day: 'Thu', usage: 22 },
    { day: 'Fri', usage: 18 },
    { day: 'Sat', usage: 25 },
    { day: 'Sun', usage: 21 }
  ];

  const efficiencyScore = 92;
  const usageLimit = 85;


  const [appliances, setAppliances] = useState([
    { 
      id: 1, 
      name: 'AC (Master Bed)', 
      power: 2500, 
      isOn: true, 
      color: '#3b82f6', // Blue
      orbitRadius: 140, 
      orbitDuration: 45,
      startDelay: '-15s' 
    },
    { 
      id: 2, 
      name: 'Living Room Lights', 
      power: 150, 
      isOn: true, 
      color: '#eab308', // Yellow
      orbitRadius: 230, 
      orbitDuration: 65,
      startDelay: '-45s' 
    },
    { 
      id: 3, 
      name: 'Refrigerator', 
      power: 400, 
      isOn: true, 
      color: '#22c55e', // Green
      orbitRadius: 320, 
      orbitDuration: 85,
      startDelay: '-80s' 
    },
    { 
      id: 4, 
      name: 'Washing Machine', 
      power: 1200, 
      isOn: false, 
      color: '#a855f7', // Purple
      orbitRadius: 410, 
      orbitDuration: 105,
      startDelay: '-20s' 
    }
  ]);

  const toggleAppliance = (id) => {
    setAppliances(prev => prev.map(app => {
      if (app.id === id) {
        const newIsOn = !app.isOn;
        setMetrics(m => ({
          ...m,
          currentUsage: Number((m.currentUsage + (newIsOn ? app.power/1000 : -app.power/1000)).toFixed(2))
        }));
        return { ...app, isOn: newIsOn };
      }
      return app;
    }));
  };

  return { metrics, appliances, chartData, barChartData, efficiencyScore, usageLimit, toggleAppliance };
};
