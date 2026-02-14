let questions = [];
let userAnswers = [];
let index = 0;
let score = 0;
let startTime;
let timerInterval;
let funFacts = [];
let funFactTimer;
let aiReady = false;

// Start Game
async function startGame(mode) {

  aiReady = false;
  index = 0;
  score = 0;
  userAnswers = [];

  document.getElementById("mode-selection").classList.add("hidden");
  document.getElementById("loading-screen").classList.remove("hidden");

  startFunFacts();

  // Load Ollama in background
  fetch("/questions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode, count: 10 })
  })
  .then(res => res.json())
  .then(aiData => {

    if (aiData && aiData.length) {
      aiReady = true;
      stopFunFacts();

      questions = aiData;
      index = 0;

      document.getElementById("loading-screen").classList.add("hidden");
      document.getElementById("quiz-screen").classList.remove("hidden");

      startTimer();
      showQuestion();
    }
  });
}

// FUN FACTS FROM API
async function startFunFacts() {

  try {
    const res = await fetch("/fun-facts");
    funFacts = await res.json();
  } catch {
    funFacts = [
      { question: "Which animal says Moo?", answer: "Cow" }
    ];
  }

  showFunFact();

  funFactTimer = setInterval(() => {
    if (!aiReady) showFunFact();
  }, 10000);
}

function showFunFact() {

  if (!funFacts.length) return;

  const random = funFacts[Math.floor(Math.random() * funFacts.length)];

  document.getElementById("fun-fact-text").innerHTML = `
    🤔 ${random.question}
    <br><br>
    <span id="fact-answer" style="opacity:0;">
      💡 ${random.answer}
    </span>
  `;

  setTimeout(() => {
    const ans = document.getElementById("fact-answer");
    if (ans) ans.style.opacity = 1;
  }, 5000);
}

function stopFunFacts() {
  clearInterval(funFactTimer);
}

// QUIZ
function showQuestion() {
  document.getElementById("progress").innerText =
    `Level ${index + 1} of ${questions.length}`;

  document.getElementById("question").innerText =
    questions[index].question;

  document.getElementById("answer").value = "";
}

// Submit
function submitAnswer() {

  const userAnswer = document.getElementById("answer").value.trim();
  userAnswers.push(userAnswer);

  if (userAnswer == questions[index].answer) {
    score++;
  }

  index++;

  if (index < questions.length) {
    showQuestion();
  } else {
    endQuiz();
  }
}

// Timer
function startTimer() {
  startTime = new Date();
  timerInterval = setInterval(() => {
    const now = new Date();
    const seconds = Math.floor((now - startTime) / 1000);
    document.getElementById("timer").innerText = `⏱ ${seconds}s`;
  }, 1000);
}

// End Quiz
function endQuiz() {
  clearInterval(timerInterval);

  document.getElementById("quiz-screen").classList.add("hidden");
  document.getElementById("result-screen").classList.remove("hidden");

  document.getElementById("final-score").innerText =
    `⭐ Score: ${score} / ${questions.length}`;

  showReview();   // 👈 THIS WAS MISSING
}

// ENTER KEY
document.addEventListener("DOMContentLoaded", () => {
  const answerInput = document.getElementById("answer");

  if (answerInput) {
    answerInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        submitAnswer();
      }
    });
  }
});

function showModeSelection() {
  document.querySelector(".hero").classList.add("hidden");
  document.getElementById("mode-selection").classList.remove("hidden");
}

function goHome() {

  document.querySelector(".hero").classList.remove("hidden");
  document.getElementById("mode-selection").classList.add("hidden");
  document.getElementById("quiz-screen").classList.add("hidden");
  document.getElementById("result-screen").classList.add("hidden");
  document.getElementById("loading-screen").classList.add("hidden");
  document.getElementById("coming-soon").classList.add("hidden");

  index = 0;
  score = 0;
  userAnswers = [];
}


function showComingSoon() {

  // Hide all sections
  document.querySelector(".hero").classList.add("hidden");
  document.getElementById("mode-selection").classList.add("hidden");
  document.getElementById("quiz-screen").classList.add("hidden");
  document.getElementById("result-screen").classList.add("hidden");
  document.getElementById("loading-screen").classList.add("hidden");

  // Show only coming soon
  document.getElementById("coming-soon").classList.remove("hidden");
}


function showReview() {

  const reviewSection = document.getElementById("review-section");
  reviewSection.innerHTML = "";

  questions.forEach((q, i) => {

    const userAns = userAnswers[i];
    const correctAns = q.answer;

    const isCorrect = userAns == correctAns;

    const div = document.createElement("div");
    div.classList.add("review-item");

    div.innerHTML = `
      <p><strong>Q${i + 1}:</strong> ${q.question}</p>
      <p>
        Your Answer:
        <span class="${isCorrect ? 'correct' : 'wrong'}">
          ${userAns || "No Answer"}
        </span>
      </p>
      <p>
        Correct Answer:
        <span class="correct">
          ${correctAns}
        </span>
      </p>
    `;

    reviewSection.appendChild(div);
  });
}
