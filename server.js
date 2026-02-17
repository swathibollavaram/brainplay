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

const digits = mathConfig.digits || 1;
const decimals = mathConfig.decimals;
const negative = mathConfig.negative;
const mixed = mathConfig.mixed;
const operators = mathConfig.operators || ["+", "-", "*", "/"];

let rangeText = "";
if (digits == 1) rangeText = "Use numbers from 0 to 9";
if (digits == 2) rangeText = "Use numbers from 10 to 99";
if (digits == 3) rangeText = "Use numbers from 100 to 999";
if (digits == 4) rangeText = "Use numbers from 1000 to 9999";

typePrompt = `
Generate arithmetic questions for children.

Rules:
- ${rangeText}
- Use ONLY these operators: ${operators.join(", ")}
- ${decimals ? "Include decimal numbers sometimes" : "Use whole numbers only"}
- ${negative ? "Allow negative answers" : "Do NOT allow negative answers"}

${mixed ? 
`
MUST generate questions with TWO operations.
Each question MUST contain exactly TWO operators.

Examples:
3 + 4 - 1
6 * 2 + 3
8 / 2 * 3

DO NOT generate single-operation questions.
DO NOT generate more than two operations.
DO NOT generate questions with only one number.
`
:
`
Each question MUST contain exactly ONE operator.
Do NOT generate multiple operations.
Do NOT generate questions with only one number.
`
}

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
Generate VERY SIMPLE logical thinking MCQ questions for children aged 6–10.

STRICT RULES:

Each question MUST have:
- question
- 4 options
- 1 correct answer

Format MUST be:

[
 {
   "question": "Which is bigger?",
   "options": ["Ant", "Elephant", "Cat", "Rat"],
   "answer": "Elephant"
 }
]

Guidelines:
- Use daily life examples
- Keep questions short
- Answers must be from options
- No maths questions
- No riddles
- No explanation

Examples of question types:

Which is heavier?
Which comes first?
Which is faster?
Which is bigger?
Which is used for writing?

Return ONLY JSON.
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

STRICT RULES:
• Keep story short
• Use simple words
• No emojis
• Answer must ALWAYS be:
   - a number (without quotes)
   OR
   - a word INSIDE DOUBLE QUOTES

Examples of valid answers:
"more"
"less"
"yes"
"no"

Return ONLY valid JSON.

Example:
[
 {"question":"A dog has 3 bones and a cat has 2. Who has more?","answer":"dog"},
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

