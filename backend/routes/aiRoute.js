import { Router } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const aiRouter = Router();

const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

aiRouter.get("/models", async (_req, res) => {
  try {
    if (!apiKey) {
      return res.status(500).json({
        error: "Gemini is not configured. Set GOOGLE_API_KEY (or GEMINI_API_KEY) in backend environment.",
      });
    }

    const fetchFn = globalThis.fetch;
    if (typeof fetchFn !== "function") {
      return res.status(500).json({
        error: "Model listing requires Node.js with global fetch support.",
      });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`;
    const resp = await fetchFn(url);
    const body = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      return res.status(resp.status).json({
        error: "Failed to list Gemini models.",
        details: body,
      });
    }

    const models = Array.isArray(body?.models) ? body.models : [];
    const simplified = models.map((m) => ({
      name: m?.name,
      supportedGenerationMethods: m?.supportedGenerationMethods || m?.supportedMethods,
    }));

    res.json({ models: simplified });
  } catch (error) {
    console.error("AI models error:", error);
    res.status(500).json({ error: "Failed to list models" });
  }
});

aiRouter.post("/chat", async (req, res) => {
  try {
    console.log("Chat request received:", { message: req.body.message?.substring(0, 50) });
    
    if (!genAI) {
      console.log("genAI is null/undefined");
      return res.status(500).json({
        error: "Gemini is not configured. Set GOOGLE_API_KEY (or GEMINI_API_KEY) in backend environment.",
      });
    }

    const { message, context } = req.body;

    const systemPrompt = `You are an AI assistant for a Smart Classroom Scheduler application. 
You help users with scheduling questions.

Current context: ${JSON.stringify(context || {})}

Provide helpful, accurate responses about scheduling, timetable management, and educational administration.`;

    console.log("Getting model...");
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_CHAT_MODEL || process.env.GEMINI_MODEL || "gemini-1.5-flash",
      generationConfig: { temperature: 0.2 },
    });
    
    console.log("Generating content...");
    const result = await model.generateContent(`${systemPrompt}\nUser: ${message}\nAI:`);
    
    const text = result.response.text();
    console.log("Response generated successfully");

    res.json({ response: text });
  } catch (error) {
    console.error("AI Chat error:", error.message);
    console.error("AI Chat error stack:", error.stack);
    res.status(500).json({ error: "Failed to process AI request", details: error.message });
  }
});
