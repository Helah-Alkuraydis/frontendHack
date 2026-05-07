import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import InputField from "../components/InputField";
import secureImg from "../assets/images/secure.png";
import Swal from "sweetalert2";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "../styles/login.css";
import { BASE_URL } from "../api/auth.js";

function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const token = location.pathname.split("/reset/")[1];

  const passwordRules = {
    length: newPassword.length >= 10,
    upper: /[A-Z]/.test(newPassword),
    lower: /[a-z]/.test(newPassword),
    number: /\d/.test(newPassword),
    special: /[@$!%*?&]/.test(newPassword),
  };
  const isPasswordStrong =
    passwordRules.length &&
    passwordRules.upper &&
    passwordRules.number &&
    passwordRules.special;

  const doPasswordsMatch = newPassword === confirmPassword;

  const handleReset = async () => {
    if (!newPassword || !confirmPassword) {
      Swal.fire({ icon: "warning", title: "Oops! ⚠️", text: "Please fill all fields" });
      return;
    }

    if (!isPasswordStrong) {
      Swal.fire({ icon: "warning", title: "Weak Password ⚠️", text: "Please follow the password rules." });
      return;
    }

    if (!doPasswordsMatch) {
      Swal.fire({ icon: "error", title: "Mismatch ❌", text: "Passwords do not match" });
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();

      if (res.ok) {
        Swal.fire({ icon: "success", title: "Success ✅", text: data.message || "Password reset successfully!" })
          .then(() => navigate("/"));
      } else {
        Swal.fire({ icon: "error", title: "Failed ❌", text: data.message || "Unable to reset password." });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Error ❌", text: "Something went wrong." });
    }
  };

  return (
    <div className="login-page">
      <div className="left-side">
        <img src={secureImg} alt="Cyber Illustration" />
      </div>

      <div className="login-card">
        <h2 style={{ color: "white", marginBottom: "10px" }}>Reset Password</h2>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", marginBottom: "20px" }}>
          Enter your new password
        </p>

        <div className="password-field">
  <InputField
    type={showNewPassword ? "text" : "password"}
    placeholder="New Password"
    value={newPassword}
    onChange={(e) => setNewPassword(e.target.value)}
  />
  <span className="eye-icon" onClick={() => setShowNewPassword(!showNewPassword)}>
    {showNewPassword ? <FaEye /> : <FaEyeSlash />}
  </span>
</div>

{newPassword && (
  <div className="password-rules">
    <p className={passwordRules.length ? "valid" : "invalid"}>At least 10 characters</p>
    <p className={passwordRules.upper ? "valid" : "invalid"}>One uppercase letter</p>
    <p className={passwordRules.number ? "valid" : "invalid"}>One number</p>
    <p className={passwordRules.special ? "valid" : "invalid"}>One special character (@$!%*?&)</p>
  </div>
)}

<div className="password-field">
  <InputField
    type={showConfirmPassword ? "text" : "password"}
    placeholder="Confirm New Password"
    value={confirmPassword}
    onChange={(e) => setConfirmPassword(e.target.value)}
  />
  <span className="eye-icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
    {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
  </span>
</div>

{!doPasswordsMatch && confirmPassword && (
  <p className="invalid" style={{ marginTop: "4px" }}>Passwords do not match ❌</p>
)}


        <button
          className="login-btn"
          onClick={handleReset}
          disabled={!isPasswordStrong || !doPasswordsMatch}
        >
          Reset Password
        </button>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
