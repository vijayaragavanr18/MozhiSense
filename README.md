# MozhiSense - Premium Gamified Tamil Learning

MozhiSense is a modern, high-end Tamil language learning application. It focuses on teaching words through their semantic relationships using interactive challenges, 3D mascot guidance, and visual knowledge maps.

**Fully responsive for web and mobile, and Progressive Web App (PWA) ready.**

---

## 🚀 Live Demo & Hosting
The application is designed for easy deployment to **Vercel** or **Netlify**.
- **Frontend**: React.js + Vite + Vanilla CSS (Premium Dark Gray Theme)
- **Backend**: FastAPI + SQLite (Optimized for Hugging Face Spaces / Render)

---

## ✨ Key Features

### 👦 3D Learning Mascot
- **Guided Experience**: A Pixar-style 3D mascot (little boy) greets you and provides real-time encouragement during challenges.
- **Visual Feedback**: The mascot reacts to your performance, making the learning journey feel alive and engaging.

### 🎮 Interactive Learning (Challenge Page)
- **5-Question Sessions**: Every challenge is standardized to 5 high-quality questions for focused learning.
- **Drag-and-Drop Challenges**: Complete Tamil sentences by dragging the correct morphological form into the blank.
- **Real-time Feedback**: Instant visual encouragement via the mascot and accuracy-based scoring.

### 🕸️ Semantic Exploration (Explore Page)
- **Visual Knowledge Map**: Powered by `vis-network`, see how words branch into various senses and morphological forms.
- **Interactive Nodes**: Click on any sense to see its definition and examples.

### 📊 Personal Dashboard (Profile Page)
- **Level Progression**: Advance through tiers from "Learner" to "Tamil Master".
- **Streak Tracking**: Maintain your daily habit with a premium visual streak ring.

### 📱 Premium Aesthetic Overhaul
- **Dark Gray Theme**: A sophisticated, non-"AI looking" design with deep charcoal backgrounds and vibrant teal accents.
- **Floating Oval Navigation**: A state-of-the-art floating pill-shaped navigation container for superior mobile usability.
- **Glassmorphism Design**: High-end backdrop blurs and subtle elevation shadows throughout.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Vanilla CSS (Premium Design System)
- **State Management**: React Hooks + LocalStorage Persistence
- **Interactions**: `@dnd-kit/core` (Drag-and-Drop)
- **Visualizations**: `vis-network` (Graph API)
- **AI Content**: Ollama (`qwen2:1.5b`) with Few-Shot Prompt Optimization
- **Backend API**: FastAPI (Python)

---

## 📦 Installation & Local Setup

### 1. Prerequisite: Ollama
For challenge generation, you need [Ollama](https://ollama.com/) running locally with the `qwen2:1.5b` model.

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

## 📂 Project Structure

- `src/assets/`: Premium assets (3D Mascot, icons)
- `src/pages/`: Main application screens (Home, Challenge, Graph, Results, Profile)
- `src/components/shared/`: Reusable UI elements (TopBar, BottomNav)
- `src/styles/`: Design system and premium CSS tokens
- `backend/`: FastAPI server and optimized challenge generation logic

---

## 📜 License
Educational use. Built for advanced Tamil language learning.
