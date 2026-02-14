# 🧠 BrainPlay – AI Learning Playground for Kids

BrainPlay is a fun AI-powered learning platform that helps children improve their:

- Problem solving skills
- Math ability
- Logical thinking
- Pattern recognition

It generates interactive challenges using a **local AI model (Ollama)**.

This is a **local-first app**, meaning AI runs on your computer — not the cloud.

# 🧠 BrainPlay – AI Learning Playground for Kids

BrainPlay is a local-first, kid-friendly learning app that generates interactive challenges (math, logic, patterns, words) using a local Ollama model. The AI runs on your machine — no cloud required.

## Table of contents

- Features
- Requirements
- Quick start (Mac / Windows / Linux)
- Content filters & kid-safety
- How it works
- Troubleshooting
- License & Contributing

---

## Features

- Interactive math and logic challenges
- Timer and scoring
- Local AI via Ollama (privacy-first)
- Simple web UI (HTML/CSS/JS) and Node/Express backend

---

## Requirements

- Node.js (16+ recommended)
- Ollama (installed and running locally)
- A compatible Ollama model (we recommend `mistral` or another small, kid-friendly model)

---

## Quick start

Follow the steps for your OS. These commands assume you have Git installed.

### Mac / Linux

1. Install Node.js: https://nodejs.org and verify:

```bash
node -v
npm -v
```

2. Install Ollama: https://ollama.com/download and start it in a terminal:

```bash
ollama serve
# keep this terminal open while using the app
```

3. Pull a model (example):

```bash
ollama pull mistral
```

4. Clone and run the project:

```bash
git clone https://github.com/swathibollavaram/brainplay.git
cd brainplay
npm install
node server.js
# open http://localhost:3001
```

### Windows (PowerShell)

```powershell
node -v
npm -v
ollama serve  # run in a terminal and keep it open
ollama pull mistral
git clone https://github.com/swathibollavaram/brainplay.git
cd brainplay
npm install
node server.js
# open http://localhost:3001
```

---
