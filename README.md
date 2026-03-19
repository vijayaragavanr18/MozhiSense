# MozhiSense - Learn Tamil Words with Semantic Sense

MozhiSense is a modern, gamified Tamil language learning application. It focuses on teaching words through their semantic relationships using interactive challenges and visual knowledge maps.

**Fully responsive for web and mobile, and Progressive Web App (PWA) ready.**

---

## 🚀 Live Demo & Hosting
The application is designed for easy deployment to **Vercel** or **Netlify**.
- **Frontend**: React.js + Vite + Tailwind CSS
- **Backend**: FastAPI + SQLite (for local dev)

---

## ✨ Key Features

### 🎮 Interactive Learning (Challenge Page)
- **Drag-and-Drop Challenges**: Complete Tamil sentences by dragging the correct word form into the blank.
- **Real-time Feedback**: Instant visual and audio feedback for correct/incorrect answers.
- **Life System**: Carefully manage your 3 hearts to complete the round.
- **Progressive Difficulty**: Challenges adapt based on your performance.

### 🕸️ Semantic Exploration (Explore Page)
- **Visual Knowledge Map**: Powered by `vis-network`, see how words branch into various senses and morphological forms.
- **Interactive Nodes**: Click on any sense to see its definition and examples.
- **Contextual Learning**: Understand *why* a word form is used in a specific context.

### 📊 Personal Dashboard (Profile Page)
- **Level Progression**: Advance through 5 tiers from "Learner" to "Tamil Master".
- **Streak Tracking**: Maintain your daily learning habit with a visual streak ring.
- **Detailed Stats**: Track total XP, best streaks, and daily challenge counts.
- **Learning Roadmap**: See your path to mastery.

### 📱 Premium Responsive UI
- **Duolingo-style Layout**: Centered content column on desktop, fluid full-width on mobile.
- **Glassmorphism Design**: Modern, premium aesthetic with deep navy and vibrant teal accents.
- **PWA Support**: Installable on iOS/Android home screens for a native-like experience.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **State Management**: React Hooks + LocalStorage Persistence
- **Interactions**: `@dnd-kit/core` (Drag-and-Drop)
- **Visualizations**: `vis-network` (Graph API)
- **Backend API**: FastAPI (Python)
- **AI Content**: Ollama (for challenge generation)

---

## 📦 Installation & Local Setup

### 1. Prerequisite: Ollama
For challenge generation, you need [Ollama](https://ollama.com/) running locally with the `qwen2:1.5b` model (or similar).

### 2. Backend Setup
```bash
cd backend
# Recommended: Create a virtual environment
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python3 main.py
```

### 3. Frontend Setup
```bash
npm install
npm run dev
```
Open `http://localhost:3000`.

---

## ⚠️ **Important: Pre-generation**
To ensure instant load times, trigger the challenge pre-generation after starting the backend:
```bash
curl -X POST http://localhost:8000/admin/pregenerate/all
```

---

## 📂 Project Structure

- `src/pages/`: Main application screens (Home, Challenge, Graph, Results, Profile)
- `src/components/shared/`: Reusable UI elements (TopBar, BottomNav)
- `src/styles/`: Design system and global CSS
- `backend/`: FastAPI server and challenge generation logic

---

## 📜 License
Educational use. Built for advanced Tamil language learning.
