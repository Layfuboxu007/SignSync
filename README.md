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
- **30-Day Membership Cycles:** Memberships are active for 30 days with automatic expiry and self-service renewal.
- **Self-Service Management:** Members can view their expiry date and cancel at any time from their Profile page.

### 🛡️ For Administrators & Instructors
- **Unified Reporting:** Export telemetry logs, user analytics, and transaction histories via CSV, Excel, and PDF.
- **Interactive Dashboards:** Track global failure rates to identify "difficult modules" that need curriculum adjustments.
- **User Management:** Full CRUD capabilities over the student base, including role assignments and membership overrides (grant/revoke).
- **Transaction Audit Trail:** Every membership state change (upgrade, cancel, admin override, auto-expiry) is logged in the transactions table with a receipt reference.

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

### 💳 Membership Architecture

The membership system uses a two-tier model (`free` → `member`) with triple-gate enforcement:

1. **Enrollment Gate:** Server rejects free-tier users from enrolling in Advanced courses (`courseService.enrollUser`).
2. **Practice Room Re-verification:** On entry, the `verifyEnrollment` middleware re-checks membership status to prevent downgrade bypass.
3. **Auto-Expiry:** The auth middleware checks `membership_expires_at` on every request and auto-downgrades expired memberships.
4. **Audit Trail:** Every state change writes to the `transactions` table with a receipt reference.

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

### 3. Database Setup
Run the setup script against your Supabase database:
```sql
-- Run supabase_task4_setup.sql for a fresh environment
-- Run migration.sql + migration_membership_v2.sql for an existing environment
```

### 4. Install Dependencies
Install dependencies for both the frontend and the backend.

```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### 5. Run the Development Servers
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
