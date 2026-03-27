import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css"; // 👈 import CSS

function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="home-container">
      <div className="home-card">
        <h1>Home</h1>
        <p>You are logged in 🎉</p>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default Home;