const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(express.static("public"));

app.post("/questions", async (req, res) => {

  let count = parseInt(req.body.count) || 10;
  const mode = req.body.mode || "math";
  const mathConfig = req.body.mathConfig || {};

  if (count > 10) count = 10;

  console.log("\n📩 New request received from UI");
  console.log("➡️ Mode:", mode);

  let typePrompt = "";

  // ================= MATH =================
  if (mode === "math") {

    console.log("🧮 Math Config:", mathConfig);

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

  // ================= LOGIC =================
  else if (mode === "logic") {
  typePrompt = `
Generate VERY SIMPLE LOGIC questions for children aged 6–10.

STRICT RULES:
- DO NOT include numbers
- DO NOT include math
- Use comparison or real-world thinking
- Questions must be one line

IMPORTANT:
For EVERY question you MUST include:
- "question"
- "answer"

Answer must be ONE WORD only (Yes/No or object name).

Return ONLY valid JSON in this format:

[
 {"question":"Is a lion stronger than a rabbit?","answer":"Yes"},
 {"question":"Which is colder: ice or fire?","answer":"Ice"}
]
`;
  }

  // ================= PATTERN =================
else if (mode === "pattern") {
  typePrompt = `
Generate FUN pattern thinking questions for children aged 6–10.

Goal:
Improve observation + thinking skills.

Do NOT generate math problems.

Use different types of patterns:

1. Repeating patterns
Example:
Red, Blue, Red, Blue, ?
Answer: Red

2. Growing patterns
Example:
2, 4, 6, ?
Answer: 8

3. Alternating logic
Example:
Cat, Dog, Dog, Cat, ?
Answer: Cat

4. Missing middle
Example:
Sun, ?, Sun
Answer: Moon

5. Opposites
Example:
Hot, Cold, Hot, ?
Answer: Cold

6. Category pattern
Example:
Apple, Mango, Apple, ?
Answer: Mango

7. Direction pattern
Example:
Left, Right, Left, ?
Answer: Right

8. Size pattern
Example:
Big, Small, Bigger, Smaller, ?
Answer: Biggest

Rules:
• Keep questions very short
• Answer must be one word or number
• No emojis
• No math operations like + - * /
• Easy to imagine
• Easy to type

Return ONLY JSON like:
[
 {"question":"Red, Blue, Red, Blue, ?","answer":"Red"}
]
`;
}


  // ================= WORD =================
  else if (mode === "word") {
  typePrompt = `
Generate FUN real-life story questions for children aged 6–10.

Goal:
Improve imagination + understanding.

Use:
• toys
• animals
• school
• fruits
• games
• friends
• daily activities

Stories should be:
• 1 or 2 lines only
• simple and happy
• easy to visualize

Question types:
1. Counting
Example:
Riya has 2 balloons and gets 1 more. How many now?

2. Sharing
Example:
Tom has 4 chocolates and gives 1 to his friend. How many left?

3. Comparison
Example:
A dog has 3 bones and a cat has 2. Who has more?

4. Situation thinking
Example:
Sam had 5 marbles and lost 2 while playing. How many remain?

5. Everyday logic
Example:
If Meena drinks 1 glass of milk in the morning and 1 at night, how many in a day?

Rules:
• Keep story short
• Use simple words
• Answer must be a number or one word
• No tricky math
• No long sentences
• No emojis

Return ONLY JSON like:
[
 {"question":"Tom has 4 chocolates and gives 1 away. How many left?","answer":3}
]
`;
}


  try {

    console.log("🚀 Sending request to Ollama...");

    const response = await axios.post(
      "http://localhost:11434/api/generate",
      {
        model: "mistral",
        prompt: `
You are a JSON generator.

STRICT RULES:
- Output ONLY valid JSON
- No explanation
- No markdown
- No comments

Return ONLY:
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

    console.log("✅ Response received from Ollama");
    console.log("🧠 Raw response length:", raw.length);

    console.log("🔍 Extracting JSON from response...");

    const start = raw.indexOf("[");
    const end = raw.lastIndexOf("]") + 1;

    if (start === -1 || end === -1) {
      throw new Error("Invalid AI response");
    }

    const questions = JSON.parse(raw.substring(start, end));

    console.log("🎯 JSON parsing successful");
    console.log("📊 Total questions generated:", questions.length);

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("AI returned empty questions");
    }

    res.json(questions);

  } catch (err) {
    console.error("❌ Ollama error occurred!");
    console.error("Reason:", err.message);

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

