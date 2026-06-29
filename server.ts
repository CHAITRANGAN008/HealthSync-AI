import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // AI Chat Endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history, context } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const systemInstruction = `You are HealthSync AI, an advanced, empathetic, and knowledgeable health and wellness coach. 
      You help users with fitness, nutrition, mental wellness, and general health queries. 
      Always include a disclaimer for medical advice (e.g. "I am an AI, please consult a doctor for medical conditions").
      Keep your responses concise, structured, and encouraging.
      
      ${context ? `Here is the user's latest health data context: ${context}` : ''}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
            { role: "user", parts: [{ text: systemInstruction }] },
            { role: "model", parts: [{ text: "Understood. How can I help you today?" }] },
            ...history.map((msg: any) => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            })),
            { role: "user", parts: [{ text: message }] }
        ],
      });

      res.json({ reply: response.text });
    } catch (error: any) {
      console.error("AI Error:", error);
      res.status(500).json({ error: "Failed to generate AI response." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
