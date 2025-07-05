const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/", async (req, res) => {
  try {
    const { deponentName, address, statement } = req.body;

    if (!deponentName || !address || !statement) {
      return res.status(400).json({ error: "Missing required fields for document generation." });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Construct a detailed prompt for generating a legal affidavit
    const prompt = `
      Generate a legally appropriate affidavit for use in India based on the following details.
      The affidavit must be formal, correctly formatted, and include all necessary components like the title, deponent's details, the main statement, and a verification clause.

      **Deponent Details:**
      - Name: ${deponentName}
      - Address: ${address}

      **Statement of Facts to Include:**
      "${statement}"

      Produce the full text of the affidavit below.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

    res.json({ document: text });
  } catch (error) {
    console.error("❌ Document Generation Error:", error);
    res.status(500).json({ error: "Failed to generate document." });
  }
});

module.exports = router; 