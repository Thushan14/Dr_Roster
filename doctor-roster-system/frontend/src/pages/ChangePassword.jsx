import { useState } from "react";
import { changePassword } from "../services/authService";
import "./Login.css";

function ChangePassword({ user, onPasswordChanged, onLogout }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert("New passwords do not match");
      return;
    }

    try {
      await changePassword(user.email, currentPassword, newPassword);

      onPasswordChanged({
        ...user,
        mustChangePassword: false,
      });
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="loginPage">
      <form className="loginCard" onSubmit={handleSubmit}>
        <h3 style={{ color: "white", textAlign: "center" }}>
          Create New Password
        </h3>

        <div className="inputBox">
          <span>▣</span>
          <input
            type="password"
            placeholder="CURRENT PASSWORD"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>

        <div className="inputBox">
          <span>▣</span>
          <input
            type="password"
            placeholder="NEW PASSWORD"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>

        <div className="inputBox">
          <span>▣</span>
          <input
            type="password"
            placeholder="CONFIRM PASSWORD"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="loginBtn">
          SAVE PASSWORD
        </button>

        <button type="button" className="forgotBtn" onClick={onLogout}>
          Logout
        </button>
      </form>
    </div>
  );
}

export default ChangePassword;