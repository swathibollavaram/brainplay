const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(express.static("public"));

app.post("/questions", async (req, res) => {
  const { count } = req.body;

  try {
    const response = await axios.post(
      "http://localhost:11434/api/generate",
      {
        model: "mistral",
        prompt: `
Return ONLY JSON.
Generate ${count} math questions using + - * /.

[
  {"question":"2 + 3","answer":5}
]
`,
        stream: false
      }
    );

    const raw = response.data.response;

    const start = raw.indexOf("[");
    const end = raw.lastIndexOf("]") + 1;

    const questions = JSON.parse(raw.substring(start, end));
    res.json(questions);

  } catch (err) {
    console.error("❌ Ollama error:", err.response?.data || err.message);
    res.status(500).json({ error: "Ollama failed" });
  }
});

app.listen(3001, () => {
  console.log("✅ Server running at http://localhost:3001");
});
