import { GoogleGenAI } from '@google/genai';

/**
 * Gemini AI Helper Utility
 * Injects genuine database history and live telemetry context
 */

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY || 'PLACEHOLDER_KEY',
});

export const getGeminiResponse = async (prompt, contextData = {}) => {
  try {
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

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemContext}\n\nUser Question: ${prompt}` }]
        }
      ],
    });

    return response.text;
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
};
