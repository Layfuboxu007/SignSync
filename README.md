<div align="center">
  <img src="client/public/vite.svg" alt="SignSync Logo" width="100"/>
  <h1>SignSync</h1>
  <p><strong>AI-Powered American Sign Language (ASL) Learning Platform</strong></p>
  <p>
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#architecture">Architecture</a> •
    <a href="#local-setup">Local Setup</a>
  </p>
</div>

<hr/>

## 🎯 Overview
SignSync is a next-generation EdTech platform designed to make learning American Sign Language (ASL) interactive, accessible, and highly accurate. Moving beyond static videos, SignSync leverages **Google MediaPipe's computer vision** to provide real-time, in-browser feedback on a user's sign accuracy.

With features like strict confidence gating, automated telemetry, and a comprehensive instructor/admin dashboard, SignSync provides a robust pedagogical environment for both self-taught learners and structured classrooms.

## ✨ Key Features

### 🎓 For Learners
- **Real-Time AI Practice Room:** Uses webcam telemetry to map 21 hand landmarks and 33 pose landmarks. Evaluates gestures in real-time and provides instantaneous visual feedback.
- **Dynamic Curriculum:** Structured courses ranging from beginner alphabet tracing to advanced conversational idioms.
- **Adaptive Fallbacks:** Features a low-FPS "Flashcard Mode" for legacy devices, ensuring accessibility regardless of hardware constraints.
- **Gamification:** Earn achievements, track streaks, and monitor accuracy over time.

### 👑 For Premium Members
- **Advanced Modules:** Unlock complex grammatical syntax and medical/emergency ASL vocabulary.
- **Priority Tracking:** Premium access routing for high-fidelity model inference.

### 🛡️ For Administrators & Instructors
- **Unified Reporting:** Export telemetry logs, user analytics, and transaction histories via CSV, Excel, and PDF.
- **Interactive Dashboards:** Track global failure rates to identify "difficult modules" that need curriculum adjustments.
- **User Management:** Full CRUD capabilities over the student base, including role assignments and manual membership overrides.

---

## 🛠 Tech Stack

SignSync utilizes a modern, decoupled Monorepo architecture designed for rapid scaling and low latency.

### Frontend
- **Framework:** React 18 / Vite
- **Styling:** Vanilla CSS (Alabaster Light Design System)
- **State Management:** Zustand
- **Computer Vision:** `@mediapipe/pose`, `@mediapipe/hands` (Web Worker Architecture)
- **Deployment:** Vercel

### Backend
- **Framework:** Node.js / Express
- **Authentication:** Supabase Auth (JWT)
- **Database:** PostgreSQL (via Supabase)
- **Deployment:** Railway

---

## 🏗 System Architecture

SignSync's AI engine is completely client-side to ensure user privacy and reduce server costs. 

1. **Webcam Feed:** The user's camera feed is captured via `react-webcam`.
2. **Web Worker Offloading:** Frames are serialized as `ImageBitmap` and sent to a dedicated Web Worker to prevent UI thread blocking.
3. **MediaPipe Inference:** The Worker runs the MediaPipe WASM binaries to extract coordinate data.
4. **Pedagogical Evaluation:** The `gestureMath.js` utility evaluates the coordinate relationships against predefined heuristic algorithms (e.g., "Is the thumb tucked under the index finger?").
5. **Telemetry Sync:** Results (successes, failures, intervention triggers) are batched and synced to the Supabase database via the Express API.

---

## 🚀 Local Setup

### Prerequisites
- Node.js (v18+)
- Supabase Account / Local CLI

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/SignSync.git
cd SignSync
```

### 2. Environment Variables
You must create a `.env` file in the `client` directory.

```env
# client/.env
VITE_SUPABASE_URL="your_supabase_project_url"
VITE_SUPABASE_ANON_KEY="your_supabase_anon_key"
VITE_API_URL="http://localhost:5000"
```

Create a `.env` file in the `server` directory.

```env
# server/.env
PORT=5000
SUPABASE_URL="your_supabase_project_url"
SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key"
FRONTEND_URL="http://localhost:5173"
```

### 3. Install Dependencies
Install dependencies for both the frontend and the backend.

```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### 4. Run the Development Servers
Open two terminal windows:

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
```

The application will be running at `http://localhost:5173`.

---

## 📄 License
This project is licensed under the MIT License.
