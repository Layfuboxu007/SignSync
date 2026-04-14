import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./components/Login";
import Register from "./components/Register";
import ForgotPassword from "./components/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Courses from "./pages/Courses";
import About from "./pages/About";
import StartPage from "./pages/StartPage";
import InstructorDashboard from "./pages/InstructorDashboard";
import ASLTracker from "./components/ASLTracker";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/practice" element={<ASLTracker />} />
        <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/about" element={<About />} />
        <Route path="/start" element={<StartPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;