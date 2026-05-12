const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * AI Audit Service — Performs food safety analysis using Gemini Vision.
 */

/**
 * Analyzes a food image for safety metrics.
 * @param {string} imageUrl - URL of the image stored in Cloudinary
 * @returns {Promise<Object>} Formatted audit results
 */
const analyzeFoodImage = async (imageUrl) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // 1. Fetch image and convert to Base64
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(response.data, 'binary');
    
    const imagePart = {
      inlineData: {
        data: imageBuffer.toString('base64'),
        mimeType: 'image/jpeg'
      },
    };

    // 2. Structured Prompt for Food Safety
    const prompt = `
      Analyze this food image for a surplus food redistribution platform. 
      Prioritize food safety and perishability over visual appearance.
      
      Step 1: Identify the food category (e.g., packaged snack, restaurant meal, fresh produce).
      Step 2: Determine if it is packaged/sealed vs unpackaged/open.
      Step 3: Determine if it is cooked vs uncooked.
      Step 4: Estimate perishability risk (how quickly it will spoil).
      
      Provide a detailed food safety audit in JSON format with these exact keys:
      - foodCategory: (string)
      - isPackaged: (boolean)
      - isCooked: (boolean)
      - isOpenContainer: (boolean)
      - perishabilityRisk: (string: "Low", "Medium", "High")
      - freshnessScore: (number 1-10)
      - spoilageIndicators: (array of strings, e.g., ["mold", "discoloration", "none"])
      - riskScore: (number 1-10, where 10 is high risk)
      - classification: (string: "CRITICAL", "STANDARD", or "UNSAFE")
      - confidenceScore: (number 1-100)
      - safetyNotes: (string, brief observation)

      Classification Rules:
      - UNSAFE: Any visible mold, severe bruising, signs of cross-contamination, or rotting.
      - CRITICAL: Restaurant dishes, cooked meals, fried foods, salads, buffet food, open containers, bakery items, homemade cooked food, highly perishable items.
      - STANDARD: Packaged snacks, sealed beverages, factory-packed food, canned food, branded packaged items, fresh whole produce (uncut).
      
      Respond ONLY with the JSON object.
    `;

    const result = await model.generateContent([prompt, imagePart]);
    const text = result.response.text();
    
    // Clean JSON response (handle markdown blocks if any)
    const jsonStr = text.replace(/```json|```/g, '').trim();
    const parsedData = JSON.parse(jsonStr);

    // Normalize classification case to ensure system compatibility
    if (parsedData.classification) {
      parsedData.classification = parsedData.classification.charAt(0).toUpperCase() + parsedData.classification.slice(1).toLowerCase();
    }

    return parsedData;

  } catch (err) {
    console.error('AI Audit Error:', err.message);
    // Safe fallback
    return {
      classification: 'Critical', // Fallback to Critical instead of Standard for safety
      riskScore: 8,
      safetyNotes: 'AI analysis failed. Manual inspection required. Marked as Critical for safety.'
    };
  }
};

module.exports = {
  analyzeFoodImage,
};
