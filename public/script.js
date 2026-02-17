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
let mathConfig = {
  digits: 1,
  decimals: false,
  negative: false,
  mixed: false,
  operators: ["+", "-", "*", "/"]
};






// ================= START GAME =================
async function startGame(mode) {

  if (mode === "math") {
    showMathSettings();
    return;
  }

  startQuiz(mode);
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

  revealTimer = setTimeout(() => {
    const ans = document.getElementById("fact-answer");
    if (ans) ans.style.opacity = 1;
  }, 10000);

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

  setTimeout(() => {
    answerBox.focus();
  }, 100);
}


// ================= SUBMIT =================
function submitAnswer() {

  const userAnswer = document.getElementById("answer").value.trim();
  userAnswers.push(userAnswer);

  if (
    userAnswer.trim().toLowerCase() ===
    String(questions[index].answer).trim().toLowerCase()
  ) {
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

  clearInterval(timerInterval);

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
    `⏱ Time Taken: ${minutes} min ${seconds} sec`;

  showReview();
}


// ================= REVIEW =================
function showReview() {

  const reviewSection = document.getElementById("review-section");
  reviewSection.innerHTML = "";

  questions.forEach((q, i) => {

    const userAns = userAnswers[i];
    const correctAns = q.answer;

    const isCorrect =
      String(userAns).trim().toLowerCase() ===
      String(correctAns).trim().toLowerCase();

    const div = document.createElement("div");
    div.classList.add("review-item");

    div.innerHTML = `
      <p><strong>Q${i + 1}:</strong> ${q.question}</p>
      <p>Your Answer: <span class="${isCorrect ? 'correct' : 'wrong'}">${userAns || "No Answer"}</span></p>
      <p>Correct Answer: <span class="correct">${correctAns}</span></p>
    `;

    reviewSection.appendChild(div);
  });
}



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


// ================= PLAY AGAIN =================
function playAgain() {

  clearInterval(timerInterval);
  stopFunFacts();

  document.getElementById("result-screen").classList.add("hidden");
  document.getElementById("mode-selection").classList.remove("hidden");

  index = 0;
  score = 0;
  userAnswers = [];

  document.getElementById("timer").innerText = "⏱ 0s";
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


function startMathWithSettings() {

  mathConfig.digits = parseInt(document.getElementById("digit-select").value) || 1;
  mathConfig.decimals = document.getElementById("include-decimals").checked;
  mathConfig.negative = document.getElementById("allow-negative").checked;
  mathConfig.mixed = document.getElementById("allow-mixed").checked;



  // GET SELECTED OPERATORS
  const selectedOps = Array.from(document.querySelectorAll(".operator:checked"))
                          .map(op => op.value);

  mathConfig.operators = selectedOps.length ? selectedOps : ["+", "-", "*", "/"];

  document.getElementById("math-settings").classList.add("hidden");

  startQuiz("math");
}



function showMathSettings() {

  // Reset math config defaults every time
  mathConfig = {
  digits: 1,
  decimals: false,
  negative: false,
  operators: ["+", "-", "*", "/"]
};


  document.querySelector(".hero").classList.add("hidden");
  document.getElementById("mode-selection").classList.add("hidden");
  document.getElementById("math-settings").classList.remove("hidden");
}


async function startQuiz(mode) {

  aiReady = false;
  index = 0;
  score = 0;
  userAnswers = [];

  // STOP OLD TIMERS
  clearInterval(timerInterval);
  clearTimeout(funFactTimer);
  clearTimeout(revealTimer);

  // RESET TIMER
  document.getElementById("timer").innerText = "⏱ 0s";

  // RESET UI
  document.querySelector(".hero").classList.add("hidden");
  document.getElementById("mode-selection").classList.add("hidden");
  document.getElementById("math-settings").classList.add("hidden");
  document.getElementById("quiz-screen").classList.add("hidden");
  document.getElementById("result-screen").classList.add("hidden");
  document.getElementById("coming-soon").classList.add("hidden");

  // SHOW LOADING
  document.getElementById("loading-screen").classList.remove("hidden");

  startFunFacts();

  fetch("/questions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mode,
      count: 10,
      mathConfig
    })
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



