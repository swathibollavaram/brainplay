let questions = [];
let userAnswers = [];
let index = 0;
let score = 0;
let startTime;
let timerInterval = null;
let funFacts = [];
let funFactTimer = null;
let revealTimer = null;
let aiReady = false;


// ================= START GAME =================
async function startGame(mode) {

  aiReady = false;
  index = 0;
  score = 0;
  userAnswers = [];

  // STOP OLD TIMERS (important)
  clearInterval(timerInterval);
  clearTimeout(funFactTimer);
  clearTimeout(revealTimer);

  // RESET TIMER DISPLAY
  document.getElementById("timer").innerText = "⏱ 0s";

  document.getElementById("mode-selection").classList.add("hidden");
  document.getElementById("loading-screen").classList.remove("hidden");

  startFunFacts();

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


// ================= FUN FACTS =================
async function startFunFacts() {

  try {
    const res = await fetch("/fun-facts");
    funFacts = await res.json();
  } catch {
    funFacts = [
      { question: "Which animal says Moo?", answer: "Cow" }
    ];
  }

  showTimedFunFact();
}


function showTimedFunFact() {

  if (!funFacts.length || aiReady) return;

  const random = funFacts[Math.floor(Math.random() * funFacts.length)];
  const factText = document.getElementById("fun-fact-text");

  factText.innerHTML = `
    🤔 ${random.question}
    <br><br>
    <span id="fact-answer" style="opacity:0; font-weight:bold;">
      💡 ${random.answer}
    </span>
  `;

  // Reveal answer after 10 sec
  revealTimer = setTimeout(() => {
    const ans = document.getElementById("fact-answer");
    if (ans) ans.style.opacity = 1;
  }, 10000);

  // Next fact after 15 sec
  funFactTimer = setTimeout(() => {
    if (!aiReady) showTimedFunFact();
  }, 15000);
}


function stopFunFacts() {
  clearTimeout(funFactTimer);
  clearTimeout(revealTimer);
}


// ================= QUIZ =================
function showQuestion() {

  document.getElementById("progress").innerText =
    `Level ${index + 1} of ${questions.length}`;

  document.getElementById("question").innerText =
    questions[index].question;

  const answerBox = document.getElementById("answer");
  answerBox.value = "";

  // 👇 AUTO FOCUS after fun facts / next question
  setTimeout(() => {
    answerBox.focus();
  }, 100);
}



// ================= SUBMIT =================
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


// ================= TIMER =================
function startTimer() {

  clearInterval(timerInterval);   // prevent duplicate timers

  startTime = new Date();

  timerInterval = setInterval(() => {
    const now = new Date();
    const seconds = Math.floor((now - startTime) / 1000);
    document.getElementById("timer").innerText = `⏱ ${seconds}s`;
  }, 1000);
}


// ================= END QUIZ =================
function endQuiz() {

  clearInterval(timerInterval);

  const endTime = new Date();
  const totalSeconds = Math.floor((endTime - startTime) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  document.getElementById("quiz-screen").classList.add("hidden");
  document.getElementById("result-screen").classList.remove("hidden");

  document.getElementById("final-score").innerText =
    `⭐ Score: ${score} / ${questions.length}`;

  document.getElementById("time-taken").innerText =
    `⏱ Time Taken: ${minutes} minutes and ${seconds} seconds`;

  showReview();
}



// ================= REVIEW =================
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


// ================= ENTER KEY =================
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


// ================= NAVIGATION =================
function showModeSelection() {
  document.querySelector(".hero").classList.add("hidden");
  document.getElementById("mode-selection").classList.remove("hidden");
}

function goHome() {

  clearInterval(timerInterval);
  stopFunFacts();

  document.querySelector(".hero").classList.remove("hidden");
  document.getElementById("mode-selection").classList.add("hidden");
  document.getElementById("quiz-screen").classList.add("hidden");
  document.getElementById("result-screen").classList.add("hidden");
  document.getElementById("loading-screen").classList.add("hidden");
  document.getElementById("coming-soon").classList.add("hidden");

  document.getElementById("timer").innerText = "⏱ 0s";

  index = 0;
  score = 0;
  userAnswers = [];
}

function showComingSoon() {

  clearInterval(timerInterval);
  stopFunFacts();

  document.querySelector(".hero").classList.add("hidden");
  document.getElementById("mode-selection").classList.add("hidden");
  document.getElementById("quiz-screen").classList.add("hidden");
  document.getElementById("result-screen").classList.add("hidden");
  document.getElementById("loading-screen").classList.add("hidden");

  document.getElementById("coming-soon").classList.remove("hidden");
}
