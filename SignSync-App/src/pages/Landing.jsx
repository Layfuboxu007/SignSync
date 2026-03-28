import { Link } from "react-router-dom";
import "../styles/Landing.css";

function Landing() {
  return (
    <div className="landing-container">
      <div className="landing-left">
        <h1>SignSync</h1>
        <p>Connect, manage, and stay organized.</p>
      </div>

      <div className="landing-right">
        <div className="landing-card">
          <h2>Welcome</h2>

          <Link to="/login">
            <button className="landing-btn login-btn">Login</button>
          </Link>

          <Link to="/register">
            <button className="landing-btn register-btn">Register</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Landing;