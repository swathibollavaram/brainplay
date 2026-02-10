let questions = [];
let index = 0;
let score = 0;

async function startQuiz() {
  const count = document.getElementById("questionCount").value;

  const res = await fetch("/questions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ count })
  });

  questions = await res.json();

  document.getElementById("start-screen").classList.add("hidden");
  document.getElementById("quiz-screen").classList.remove("hidden");

  showQuestion();
}

function showQuestion() {
  document.getElementById("question").innerText =
    questions[index].question;
  document.getElementById("answer").value = "";
}

function submitAnswer() {
  const userAnswer = Number(document.getElementById("answer").value);

  if (userAnswer === questions[index].answer) {
    score++;
  }

  index++;

  if (index < questions.length) {
    showQuestion();
  } else {
    showResult();
  }
}

function showResult() {
  document.getElementById("quiz-screen").classList.add("hidden");
  document.getElementById("result-screen").classList.remove("hidden");

  document.getElementById("score").innerText =
    `Your Score: ${score} / ${questions.length}`;
}
