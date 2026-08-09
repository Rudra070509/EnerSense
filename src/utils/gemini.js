import { GoogleGenAI } from '@google/genai';

/**
 * Gemini AI Helper Utility
 * 
 * This file handles the communication with the Google Gemini API. 
 * It wraps the user's prompt with real-time context data (like power usage) 
 * so the AI can provide personalized, accurate responses.
 */

// Initialize the Gemini client
// In a real production app, this should be handled securely on a backend server.
const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY || 'PLACEHOLDER_KEY',
});

/**
 * Sends a message to the Gemini API and returns the response.
 * @param {string} prompt - The user's query or prompt.
 * @param {object} contextData - Real-time sensor data to inject as context.
 * @returns {Promise<string>} - The text response from Gemini.
 */
export const getGeminiResponse = async (prompt, contextData = {}) => {
  try {
    // Format the real-time sensor data into a readable string for the AI
    const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    const systemContext = `
      CURRENT SMART HOME SENSOR DATA:
      - Today's Date: ${currentDate}
      - Total Power Consumed Today: ${contextData.totalPowerToday || '14.2'} kWh
      - Estimated Monthly Bill: ₹${contextData.estMonthlyBill || '3,450'}
      - Top Active Appliances: ${contextData.topAppliances || 'AC Unit (66%), Fridge (24%)'}
      
      You have access to this live data. ONLY mention or reference this data if the user specifically asks about their usage, cost, appliances, or energy saving tips. If the user just says "hi" or a general greeting, simply greet them back warmly and ask how you can help without dumping their stats.
      
      CRITICAL INSTRUCTIONS:
      1. Keep ALL responses strictly under 2 sentences unless explicitly asked for more detail.
      2. Be extremely direct and precise. Do not use filler words.
      3. Do not use markdown formatting (like bolding or bullet points) unless absolutely necessary.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      config: {
        systemInstruction: "You are EnerSense AI, a highly concise, direct, and expert smart home energy assistant. " + systemContext,
        temperature: 0.5,
      }
    });

    return response.text;
  } catch (error) {
    console.error('Error fetching response from Gemini:', error);
    
    // Check for API key errors explicitly to provide a better UX fallback
    if (error.message?.includes('API key not valid') || error.message?.includes('API_KEY_INVALID') || error.message?.includes('403')) {
        return "It looks like your Gemini API key is missing or invalid. Please add `VITE_GEMINI_API_KEY` to your `.env.local` file.";
    }

    return "I'm sorry, I couldn't process that right now. Please try again later.";
  }
};
