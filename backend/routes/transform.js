const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getPrompt = (action, text, targetLanguage = "Hindi") => {
  switch (action) {
    case 'simplify':
      return `Explain the following legal text to a non-lawyer in simple, clear terms. Maintain the core meaning but avoid jargon:\n\n"${text}"`;
    case 'translate':
      return `Strictly translate the following English text to ${targetLanguage}. Provide only the translated text and nothing else. Do not add explanations, notes, or phonetics.\n\nEnglish text: "${text}"`;
    default:
      return text;
  }
};

router.post("/", async (req, res) => {
  try {
    const { text, action, targetLanguage } = req.body;

    if (!text || !action) {
      return res.status(400).json({ error: "Missing required fields: text and action." });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const prompt = getPrompt(action, text, targetLanguage);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const transformedText = await response.text();

    res.json({ transformedText });
  } catch (error) {
    console.error("❌ Text Transformation Error:", error);
    res.status(500).json({ error: "Failed to transform text." });
  }
});

module.exports = router; 