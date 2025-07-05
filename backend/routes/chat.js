const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios");
require("dotenv").config();

// ✅ Ensure you're using the correct API key format
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const RAG_SERVICE_URL = "http://localhost:5001/search";

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Invalid or missing message" });
    }

    let finalPrompt = message;
    let context = "";

    try {
      // 1. Call RAG service to get context
      const ragResponse = await axios.post(RAG_SERVICE_URL, { query: message });
      const retrievedSections = ragResponse.data;

      if (retrievedSections && retrievedSections.length > 0) {
        // 2. Format the context
        context = "Based on the following legal sections:\n" + retrievedSections
          .map(sec => `${sec.section_number} - ${sec.title}: ${sec.text}`)
          .join("\n\n");
        
        // 3. Construct the final prompt
        finalPrompt = `${context}\n\nAnswer the question: ${message}`;
      }
    } catch (ragError) {
      console.error("RAG service call failed, proceeding without context:", ragError.message);
      // If RAG fails, finalPrompt remains the original message
    }

    // ✅ Correct model name for the v1 API
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // 💡 TEMPORARY LOGGING: Display the final prompt being sent to Gemini
    console.log("==================== PROMPT SENT TO GEMINI ====================");
    console.log(finalPrompt);
    console.log("=============================================================");

    // 4. Send the final prompt to Gemini
    const result = await model.generateContent(finalPrompt);
    const response = await result.response;
    const text = await response.text();

    res.json({ response: text });
  } catch (error) {
    console.error("❌ Gemini API Error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
