import "dotenv/config";
import express from "express";
import cors from "cors";
import { createAgent } from "./agent.js";

const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.static("public"));

const agent = createAgent();

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    mode: process.env.AI_BASE_URL && process.env.AI_API_KEY ? "live" : "demo",
    model: process.env.AI_MODEL || "demo-model"
  });
});

app.get("/api/skills", async (req, res) => {
  res.json(await agent.listSkills());
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message, context = {}, confirm = false } = req.body || {};
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "message is required" });
    }
    const result = await agent.run(message, context, { confirm });
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Agent error" });
  }
});

app.listen(port, () => {
  console.log(`Yawar AI Agent running at http://localhost:${port}`);
});
