import { GoogleGenAI } from '@google/genai';

/**
 * Gemini AI Helper Utility
 * Injects genuine database history and live telemetry context
 */

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY || 'PLACEHOLDER_KEY',
});

// Candidate models in preference order (gemini-3.8-flash is the latest recommended by Google)
const CANDIDATE_MODELS = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-2.5-pro'];

/**
 * Intelligent Local Fallback Response Engine
 * Evaluated whenever Google Gemini API is experiencing temporary 503 high demand or offline
 */
const generateIntelligentFallback = (prompt, contextData) => {
  const p = prompt.toLowerCase().trim();

  // 1. Greetings
  if (p === 'hi' || p === 'hello' || p === 'hey' || p.startsWith('hi ') || p.startsWith('hello ')) {
    return `Hello! I'm EnerSense AI. Your home is currently drawing ${contextData.currentWatts || '0 W'} at ${contextData.liveVoltage || '230 V'}. Today's accumulated energy is ${contextData.totalPowerToday || '0.000 kWh'}. How can I assist you today?`;
  }

  // 2. Bill / Cost / Tariff questions
  if (p.includes('bill') || p.includes('cost') || p.includes('tariff') || p.includes('rate') || p.includes('merc') || p.includes('money')) {
    return `Under the MERC LT-I (B) tariff, your estimated monthly bill is ${contextData.estMonthlyBill || '₹80'} for projected ${contextData.projectedMonthlyKwh || '0 kWh'}. Today's running electricity cost is ${contextData.todayCost || '₹0.00'}.`;
  }

  // 3. Power / Wattage / Current Draw
  if (p.includes('power') || p.includes('watt') || p.includes('current') || p.includes('voltage') || p.includes('volt') || p.includes('draw')) {
    return `Current real-time electrical draw is ${contextData.currentWatts || '0 W'} across your circuits with mains voltage at ${contextData.liveVoltage || '230 V'}. Total consumption today is ${contextData.totalPowerToday || '0.000 kWh'}.`;
  }

  // 4. Appliances / Devices
  if (p.includes('appliance') || p.includes('device') || p.includes('ac') || p.includes('tv') || p.includes('light') || p.includes('load')) {
    return `Your monitored appliances: ${contextData.registeredAppliances || 'Appliance 1 and Appliance 2'}. Real-time channel load distribution: ${contextData.topAppliances || 'All idle'}.`;
  }

  // 5. Save / Optimize / Tips
  if (p.includes('save') || p.includes('reduce') || p.includes('tip') || p.includes('optimize') || p.includes('help')) {
    return `To minimize your bill, maintain your monthly usage below 100 units to stay in MERC Slab 1 (₹3.15/kWh). Turning off appliances on standby can reduce unnecessary baseline draw.`;
  }

  // Default contextual response
  return `EnerSense Telemetry: Live draw is ${contextData.currentWatts || '0 W'}, today's energy is ${contextData.totalPowerToday || '0.000 kWh'}, and projected monthly bill is ${contextData.estMonthlyBill || '₹80'}. You can ask about your bill, current power, or active appliances.`;
};

export const getGeminiResponse = async (prompt, contextData = {}) => {
  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  
  const systemContext = `
    CURRENT SMART HOME ENERGY & DATABASE TELEMETRY:
    - Date: ${currentDate}
    - Today's Consumed Power: ${contextData.totalPowerToday || '0.000 kWh'}
    - Today's Running Cost: ${contextData.todayCost || '₹0.00'}
    - Current Instantaneous Draw: ${contextData.currentWatts || '0 W'}
    - Mains Voltage: ${contextData.liveVoltage || '230 V'}
    - Estimated Monthly Bill (MERC FY25): ${contextData.estMonthlyBill || '₹80'}
    - Projected Monthly Units: ${contextData.projectedMonthlyKwh || '0.0 kWh'}
    - Registered Appliances: ${contextData.registeredAppliances || 'Appliance 1 (Relay 1), Appliance 2 (Relay 2)'}
    - Active Power Breakdown: ${contextData.topAppliances || 'All OFF'}
    - Yesterday's Total Power Consumed: ${contextData.yesterdayKwh || '0.000 kWh'}
    - Yesterday's Average Load: ${contextData.yesterdayAvgPower || '0 W'}

    CRITICAL CONVERSATIONAL RULES:
    1. If the user asks about their usage today, yesterday, current wattage, voltage, or bill, use the EXACT real numbers provided above.
    2. If the user asks about what appliances they have, list their named appliances above.
    3. If the user just says "hi", "hello", or asks general questions, greet them warmly without dumping raw numbers.
    4. Keep ALL responses strictly under 2-3 sentences. Direct, helpful, concise.
    5. Do NOT use markdown asterisks or bullet points unless necessary.
  `;

  // Try candidate models
  for (const modelName of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemContext}\n\nUser Question: ${prompt}` }]
          }
        ],
      });

      if (response && response.text) {
        return response.text;
      }
    } catch (error) {
      console.warn(`Model [${modelName}] failed, trying next candidate:`, error.message);
    }
  }

  // If external models are rate-limited or unavailable, fall back to intelligent telemetry reasoning
  return generateIntelligentFallback(prompt, contextData);
};

/**
 * Generates dynamic, real-time energy diagnostic alerts using Gemini AI
 */
export const getGeminiAlerts = async (contextData = {}) => {
  const prompt = `
    You are the EnerSense AI Diagnostic Engine.
    Analyze this live home electrical telemetry data:
    - Current Power: ${contextData.livePower || 0} W
    - Voltage: ${contextData.liveVoltage || 230} V AC
    - Current Amps: ${contextData.liveCurrent || 0} A
    - Cumulative Energy Today: ${contextData.liveEnergy || '0.000'} kWh
    - Projected Monthly Units: ${contextData.projectedMonthlyKwh || 0} kWh
    - Estimated Monthly Bill: ₹${contextData.predictedBill || 80}
    - Appliances: ${JSON.stringify(contextData.appliances || [])}

    Generate exactly 4-5 smart, real-time energy alerts and diagnostic observations based on this data.
    Return ONLY a valid JSON array of objects with these exact keys:
    [
      {
        "type": "warning" | "alert" | "info" | "success",
        "title": "Short title (3-5 words)",
        "message": "Specific diagnostic insight or suggestion (1 sentence)",
        "category": "Tariff" | "Voltage" | "Load" | "Safety" | "Optimization",
        "time": "Just now"
      }
    ]
    DO NOT output markdown, backticks, or any other text. Output pure JSON only.
  `;

  for (const modelName of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ],
      });

      const raw = response?.text?.trim() || '';
      const jsonStr = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (err) {
      console.warn(`Gemini alerts with [${modelName}] failed, trying next:`, err.message);
    }
  }

  return null;
};
