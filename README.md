# ⚽ PitchPulse AI
> **FIFA World Cup Live Analytics Dashboard & Tactical Forecaster**

PitchPulse AI is a premium, state-of-the-art web application designed for football analysts, tacticians, and fans. It provides a real-time FIFA World Cup match tracker, detailed squad analytics, and an AI-driven Tactical Match Forecast Engine.

---

## 🚀 Key Features

* **Live Dashboard & Schedule**: Tracks all World Cup matches within a rolling 48-hour window (including ongoing live fixtures, completed matches, and upcoming schedules) with real-time stats (xG, possession, shots, pass accuracy).
* **Featured Match Carousel**: An interactive, autoplaying match poster slideshow featuring authentic game frames from the **SoccerNet** dataset, glassmorphic team flags, and live status banners.
* **Branded Logo Header**: Sleek sticky header featuring a polished, background-free transparent **FIFA branding logo**.
* **Flag-Enriched Match Cards**: Match schedules displaying team crests and flags (using automatic country-code-to-flag emoji conversions as fallback) floating transparently over glassmorphic card backdrops.
* **AI Tactical Predictor**: An advanced forecast engine simulating match results based on user-configured tactical formations (e.g., `4-3-3`, `3-5-2`, `5-4-1`) and team mentalities (balanced, attacking, defensive).
* **Player Directory & Radars**: Dynamic player cards loaded with custom biography data, tactical trait chips, attribute radar graphs (Pace, Shooting, Defending, Physical), and position-specific heatmaps.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React, Vite, Tailwind CSS, Lucide React, Recharts (Radar, Pie), Glassmorphic CSS |
| **Backend API** | Node.js, Express, mock REST endpoints, dynamic detail enrichment |
| **AI Service** | Python, FastAPI / Flask logic simulation |

---

## 📁 Repository Structure

```text
pitchpulse-ai/
├── frontend/             # React + Vite client dashboard
│   ├── src/
│   │   ├── assets/       # Media assets (FIFA logo, etc.)
│   │   ├── App.jsx       # Main Dashboard React component
│   │   ├── App.css       # Boilerplate configurations
│   │   └── index.css     # Global glassmorphic styling and utility variables
│   └── package.json
├── backend/              # Node.js + Express API server
│   ├── server.js         # REST endpoints for matches, lineups, and stats
│   ├── mockData.js       # Mock match history and squad list databases
│   └── package.json
└── ai-service/           # Python Predictive Model Service
    ├── main.py           # Core simulator engine script
    └── requirements.txt  # Python requirements (Pillow, etc.)
```

---

## 🏁 Getting Started

To run the application locally, make sure you have **Node.js (v18+)** and **Python (v3.9+)** installed.

### 1. Run the Backend API
Navigate to the `backend` folder, install dependencies, and start the development server:
```bash
cd backend
npm install
npm run dev
```
*The backend API server will run on `http://localhost:5000`.*

### 2. Run the Frontend Client
Navigate to the `frontend` folder, install dependencies, and start the Vite development server:
```bash
cd ../frontend
npm install
npm run dev
```
*The client dashboard will open automatically in your browser on `http://localhost:5173`.*

### 3. Run the AI Predictor Service (Optional)
Navigate to the `ai-service` directory, install packages, and launch the service:
```bash
cd ../ai-service
pip install -r requirements.txt
python main.py
```

---

## 💅 Visual Design Systems

The application uses custom-designed **Glassmorphism CSS** definitions in `index.css` featuring HSL tailored overlays:
* **Backgrounds**: Deep premium dark mode `#07090e` utilizing background repeating pitch lines.
* **Cards**: Translucent glass containers (`--bg-card: rgba(17, 24, 39, 0.75)`) with a thin glow border (`border: 1px solid rgba(255, 255, 255, 0.07)`) and subtle lift animations on hover.
* **Scores & Flags**: Displayed float-free on their cards and slides without blocking boxes, ensuring high visual flow.

---

## 📄 License
This project is for educational and analytics purposes. Dataset backdrops are referenced from [SoccerNet](https://www.soccer-net.org).
