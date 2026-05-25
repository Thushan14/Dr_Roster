import { useState } from "react";
import "./Login.css";

const accounts = [
  { email: "doctor1@gmail.com", password: "1234", name: "Dr. Sanjaya Perera" },
  { email: "doctor2@gmail.com", password: "1234", name: "Dr. Kasun Silva" },
  { email: "doctor3@gmail.com", password: "1234", name: "Dr. Nimal Fernando" },
  { email: "doctor4@gmail.com", password: "1234", name: "Dr. Amaya Jayasinghe" },
];

function Login({ onLogin }) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    const user = accounts.find(
      (acc) => acc.email === email && acc.password === password
    );

    if (user) {
      onLogin(user);
    } else {
      alert("Invalid email or password");
    }
  };

  return (
    <div className="loginPage">
      <div className="loginHeader">
        <div className="medicalIcon">✚</div>
        <h1>Doctor Roster System</h1>
        <p>Hospital Weekly Roster Portal</p>
      </div>

      <form className="loginCard" onSubmit={handleLogin}>
        <h2>Welcome Back</h2>
        <p className="subtitle">Please sign in to your account</p>

        <label>Email / Username</label>
        <div className="inputBox">
          <span>✉</span>
          <input
            type="email"
            placeholder="doctor1@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <label>Password</label>
        <div className="inputBox">
          <span>🔒</span>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="eyeBtn"
            onClick={() => setShowPassword(!showPassword)}
          >
            👁
          </button>
        </div>

        <button type="button" className="forgotBtn">
          Forgot Password?
        </button>

        <button type="submit" className="loginBtn">
          Login →
        </button>

        <div className="secureText">🛡 Secure Login</div>
      </form>
    </div>
  );
}

export default Login;