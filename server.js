const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(express.static("public"));

app.post("/questions", async (req, res) => {

  let count = parseInt(req.body.count) || 10;
  const mode = req.body.mode || "math";

  // Limit count to prevent AI truncation
  if (count > 10) count = 10;

  // Mode-based prompt
  let typePrompt = "";

  if (mode === "math") {
    typePrompt = `
basic arithmetic questions using ONLY numbers.

Use only these operators:
+  -  *  /

Do NOT include:
- words
- stories
- reasoning
- explanations
- Do not skip questions

Example format:
3 + 5
10 - 4
6 * 2
12 / 3
`;

  } else if (mode === "logic") {
    typePrompt = "basic logical reasoning questions for kids simple patterns and sequences";
  } else if (mode === "pattern") {
    typePrompt = "pattern recognition questions for kids fun shapes and colors";
  } else if (mode === "word") {
    typePrompt = "easy word problems for kids fun and engaging stories";
  }

  try {
    const response = await axios.post(
      "http://localhost:11434/api/generate",
      {
        model: "mistral",
        prompt: `
Return ONLY JSON.

Generate ${count} ${typePrompt}.

Make them fun and kid-friendly.

Example:
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

    if (start === -1 || end === -1) {
      throw new Error("Invalid AI response");
    }

    const questions = JSON.parse(raw.substring(start, end));

    // Validate output
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("AI returned empty questions");
    }

    res.json(questions);

  } catch (err) {
    console.error("❌ Ollama error:", err.message);
    res.status(500).json({
      error: "AI failed to generate questions"
    });
  }
});

app.listen(3001, "0.0.0.0", () => {
  console.log("Server running at http://localhost:3001");
});

