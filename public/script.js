let questions = [];
let userAnswers = [];
let index = 0;
let score = 0;
let startTime;
let timerInterval;

// Show mode selection
function showModeSelection() {
  document.querySelector(".hero").classList.add("hidden");
  document.getElementById("mode-selection").classList.remove("hidden");
}

// Start game
async function startGame(mode) {

  // Reset values for new game
  questions = [];
  userAnswers = [];
  index = 0;
  score = 0;

  document.getElementById("mode-selection").classList.add("hidden");
  document.getElementById("loading-screen").classList.remove("hidden");

  try {
    const res = await fetch("/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode, count: 10 })
    });

    questions = await res.json();

    // Hide loading and show quiz
    document.getElementById("loading-screen").classList.add("hidden");
    document.getElementById("quiz-screen").classList.remove("hidden");

    startTimer();
    showQuestion();

  } catch (error) {
    document.getElementById("loading-screen").innerHTML =
      "<h2>⚠️ Failed to load questions. Please try again.</h2>";
  }
}

// Display question
function showQuestion() {
  document.getElementById("progress").innerText =
    `Level ${index + 1} of ${questions.length}`;

  document.getElementById("question").innerText =
    questions[index].question;

  document.getElementById("answer").value = "";
}

// Submit answer
function submitAnswer() {
  const userAnswer = Number(document.getElementById("answer").value);
  userAnswers.push(userAnswer);

  if (userAnswer === questions[index].answer) {
    score++;
  }

  index++;

  if (index < questions.length) {
    showQuestion();
  } else {
    endQuiz();
  }
}

// Start timer
function startTimer() {
  startTime = new Date();
  timerInterval = setInterval(() => {
    const now = new Date();
    const seconds = Math.floor((now - startTime) / 1000);
    document.getElementById("timer").innerText = `⏱ ${seconds}s`;
  }, 1000);
}

// End quiz
function endQuiz() {
  clearInterval(timerInterval);

  const totalSeconds = Math.floor((new Date() - startTime) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  seconds = totalSeconds % 60;

  document.getElementById("quiz-screen").classList.add("hidden");
  document.getElementById("result-screen").classList.remove("hidden");

  document.getElementById("final-score").innerText =
    `⭐ Score: ${score} / ${questions.length}`;

  document.getElementById("time-taken").innerText =
    `Time Taken: ${minutes} minutes and ${seconds} seconds`;

  showReview();
}
function showReview() {
  const reviewSection = document.getElementById("review-section");
  reviewSection.innerHTML = "";

  questions.forEach((q, i) => {

    const userAns = userAnswers[i];
    const correctAns = q.answer;

    const isCorrect = userAns === correctAns;

    const div = document.createElement("div");
    div.classList.add("review-item");

    div.innerHTML = `
      <p><strong>Q${i + 1}:</strong> ${q.question}</p>
      <p>
        Your Answer:
        <span class="${isCorrect ? 'correct' : 'wrong'}">
          ${userAns}
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

function showComingSoon() {
  hideAllSections();
  document.getElementById("coming-soon").classList.remove("hidden");
}
function hideAllSections() {
  document.querySelectorAll("section").forEach(sec => {
    sec.classList.add("hidden");
  });
}
