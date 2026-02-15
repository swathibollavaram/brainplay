const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(express.static("public"));

app.post("/questions", async (req, res) => {

  let count = parseInt(req.body.count) || 10;
  const mode = req.body.mode || "math";
  const mathConfig = req.body.mathConfig || {};


  // Limit count to prevent AI truncation
  if (count > 10) count = 10;

  // Mode-based prompt
  let typePrompt = "";

  if (mode === "math") {

  const digits = mathConfig.digits || 2;
  const decimals = mathConfig.decimals;
  const negative = mathConfig.negative;

  let rangeText = "";

  if (digits == 2) rangeText = "Use numbers from 10 to 99";
  if (digits == 3) rangeText = "Use numbers from 100 to 999";
  if (digits == 4) rangeText = "Use numbers from 1000 to 9999";

  typePrompt = `
Generate arithmetic questions for children.

Rules:
- ${rangeText}
- Use operators: +, -, *, /
- ${decimals ? "Include decimal numbers sometimes" : "Use whole numbers only"}
- ${negative ? "Allow negative answers" : "Do NOT allow negative answers"}
- Keep questions simple and child-friendly
- One line questions only

Return ONLY JSON:
[
 {"question":"45 + 22","answer":67}
]
`;
}
 else if (mode === "logic") {
  typePrompt = `
VERY SIMPLE logical thinking questions for children aged 6–10.

Use:
• daily life situations
• fun comparisons
• ordering
• shapes
• animals
• easy reasoning

Avoid:
• puzzles that need deep thinking
• tricky riddles
• adult logic
• abstract concepts
• long stories

Examples:
Who is taller: a cat or an elephant?
Which is heavier: a feather or a book?
If you have 3 apples and eat 1, how many are left?
Which comes first: morning or night?
Which is faster: a turtle or a rabbit?

Keep questions:
• short
• fun
• easy to imagine
• one-line only
`;
} else if (mode === "pattern") {
  typePrompt = `
VERY SIMPLE pattern questions for children aged 6–10.

Use:
• colors
• shapes
• numbers (very small)
• everyday objects
• animals

Focus on:
• what comes next
• what is missing
• repeating patterns

Avoid:
• complex sequences
• tricky logic
• long questions
• abstract symbols

Examples:
Red, Blue, Red, Blue, ?
Circle, Square, Circle, Square, ?
🐶 🐱 🐶 🐱 ?
1, 2, 1, 2, ?

Keep questions:
• visual
• fun
• short
• easy to imagine

Answer should be one word or number.
`;
} else if (mode === "word") {
  typePrompt = `
SHORT and FUN story-based questions for children aged 6–10.

Use:
• animals
• toys
• fruits
• school
• daily life

Make stories:
• 1 or 2 lines only
• happy and playful
• very easy to understand

Avoid:
• long problems
• tricky math
• confusing words

Examples:
Riya has 2 apples and gets 1 more. How many now?
Tom has 3 balloons. One flies away. How many left?
A dog has 4 bones and eats 1. How many remain?

Keep:
• simple
• cheerful
• child-friendly

Answer should be a number or one word.
`;
}

  try {
    const response = await axios.post(
      "http://localhost:11434/api/generate",
      {
        model: "mistral",
        prompt: `
You are a JSON generator.

STRICT RULES:
- Output ONLY valid JSON
- Do NOT explain anything
- Do NOT add extra text
- Do NOT add notes
- Do NOT add trailing commas
- Do NOT add markdown
- Do NOT add comments

Return ONLY this format:

[
 {"question":"2 + 3","answer":5}
]

Now generate ${count} questions.

${typePrompt}
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

app.get("/fun-facts", async (req, res) => {
  try {
    const response = await axios.get(
      "https://opentdb.com/api.php?amount=10&type=multiple"
    );

    const formatted = response.data.results.map(q => ({
      question: q.question.replace(/&#039;/g, "'"),
      answer: q.correct_answer
    }));

    res.json(formatted);

  } catch {
    res.json([
      { question: "Which animal says Moo?", answer: "Cow" },
      { question: "How many days are in a week?", answer: "7" }
    ]);
  }
});



app.listen(3001, "0.0.0.0", () => {
  console.log("Server running at http://localhost:3001");
});

