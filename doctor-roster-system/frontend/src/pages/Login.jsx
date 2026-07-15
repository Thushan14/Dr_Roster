import { useState } from "react";
import "./Login.css";
import { loginUser, verifyOtp } from "../services/authService";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const result = await loginUser(email, password);

      if (result.otpRequired) {
        setOtpStep(true);
      }
    } catch (error) {
      alert(error.message || "Invalid email or password");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    try {
      const user = await verifyOtp(email, otpCode);

      const savedProfile = localStorage.getItem(`profile_${user.email}`);

      if (savedProfile) {
        onLogin({ ...user, ...JSON.parse(savedProfile) });
      } else {
        onLogin(user);
      }
    } catch (error) {
      alert(error.message || "OTP verification failed");
    }
  };

  if (otpStep) {
    return (
      <div className="loginPage">
        <form className="loginCard" onSubmit={handleVerifyOtp}>
          <h3 style={{ color: "white", textAlign: "center" }}>
            Enter OTP
          </h3>

          <div className="inputBox">
            <span>▣</span>
            <input
              type="text"
              placeholder="OTP CODE"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="loginBtn">
            VERIFY OTP
          </button>

          <button
            type="button"
            className="forgotBtn"
            onClick={() => {
              setOtpStep(false);
              setOtpCode("");
            }}
          >
            Back
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="loginPage">
      <form className="loginCard" onSubmit={handleLogin}>
        <div className="inputBox">
          <span>☰</span>
          <input
            type="email"
            placeholder="EMAIL"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="inputBox">
          <span>▣</span>
          <input
            type="password"
            placeholder="PASSWORD"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="loginBtn">
          LOGIN
        </button>

        <button type="button" className="forgotBtn">
          Forgot password?
        </button>
      </form>
    </div>
  );
}

export default Login;