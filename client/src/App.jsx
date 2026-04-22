import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useUserStore } from "./store/userStore";

import Landing from "./pages/Landing";
import Login from "./features/auth/Login";
import Register from "./features/auth/Register";
import ForgotPassword from "./features/auth/ForgotPassword";
import UpdatePassword from "./features/auth/UpdatePassword";
import Dashboard from "./features/dashboard/Dashboard";
import Settings from "./pages/Settings";
import Courses from "./features/courses/Courses";
import About from "./pages/About";
import StartPage from "./pages/StartPage";
import InstructorDashboard from "./features/dashboard/InstructorDashboard";
import ASLTracker from "./features/tracker/ASLTracker";

function App() {
  const { initializeSession } = useUserStore();

  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/update-password" element={<UpdatePassword />} />
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