import { useState } from "react";
import Tabs from "./Tabs";
import InputField from "./InputField";
import SocialButton from "./SocialButton";
import { Link } from "react-router-dom";
import { FaApple, FaGoogle, FaWindows, FaEye, FaEyeSlash } from "react-icons/fa";
import { loginUser, registerUser } from "../api/auth";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

function LoginCard() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); 
  const [fullName, setFullName] = useState(""); 
  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); 
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [isTechnical, setIsTechnical] = useState(false);
  const navigate = useNavigate();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(email);

  const passwordRules = {
    length: password.length >= 10,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[@$!%*?&]/.test(password),
  };

  const isPasswordStrong =
    passwordRules.length &&
    passwordRules.upper &&
    passwordRules.lower &&
    passwordRules.number &&
    passwordRules.special;

  const handleLogin = async () => {
    try {
      if (mode === "login") {
        const res = await loginUser({ email, password });
        if (res.success) {
          Swal.fire({
            icon: "success",
            title: "OTP Sent 📩",
            text: "Please check your email for the verification code.",
          });
          navigate("/verify-otp", { state: { email, type: "login" } });
        } else {
          Swal.fire({ icon: "error", title: "Login Failed ❌", text: res.message || "Invalid email or password." });
        }
      }

      if (mode === "register") {
        if (!isPasswordStrong) return;

        if (password !== confirmPassword) {
          Swal.fire({ icon: "error", title: "Passwords do not match ❌", text: "Please make sure both password fields are identical." });
          return;
        }

        const res = await registerUser({
          username: fullName, 
          name: fullName,     
          email,
          password,
          confirmPassword,
          isTechnical
        });

        if (res.success) {
          Swal.fire({ icon: "success", title: "OTP Sent 📩", text: "Please check your email for the verification code." });
          navigate("/verify-otp", { state: { email, type: "signup" } });
        } else {
          Swal.fire({ icon: "error", title: "Signup Failed ❌", text: res.message || "Unable to create account." });
        }
      }
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Server Error 🚨", text: "Something went wrong. Please try again later." });
    }
  };

  return (
    <div className="login-card">
      <Tabs mode={mode} setMode={setMode} />

      {mode === "register" && (
        <InputField 
          type="text" 
          placeholder="Full Name" 
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      )}

      <InputField
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (!emailTouched) setEmailTouched(true);
        }}
      />

      {mode === "register" && emailTouched && !isEmailValid && (
        <div className="password-rules" style={{ fontSize: "0.8rem", marginTop: "4px" }}>
          <p className="invalid">Invalid Email ❌</p>
        </div>
      )}

      <div className="password-field">
        <InputField
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (!passwordTouched) setPasswordTouched(true);
          }}
        />
        <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
          {showPassword ? <FaEye /> : <FaEyeSlash />}
        </span>
      </div>

      {mode === "register" && passwordTouched && !isPasswordStrong && (
        <div className="password-rules">
          <p className={passwordRules.length ? "valid" : ""}>At least 10 characters</p>
          <p className={passwordRules.upper ? "valid" : ""}>One uppercase letter</p>
          <p className={passwordRules.number ? "valid" : ""}>One number</p>
          <p className={passwordRules.special ? "valid" : ""}>One special character (@$!%*?&)</p>
        </div>
      )}

      {mode === "register" && (
        <div className="password-field">
          <InputField
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <span className="eye-icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
            {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
          </span>
        </div>
      )}

      {mode === "login" && (
        <div className="forgot">
          <Link to="/forgot">Forget Password?</Link>
        </div>
      )}

      {mode === "register" && (
  <div className="player-type-section" style={{ margin: "20px 0", textAlign: "left" }}>
    <p style={{ color: "#60a5fa", fontWeight: "900", fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "15px" }}>
Define your digital expertise    </p>
    <div style={{ display: "flex", gap: "20px" }}>
      <div 
        onClick={() => setIsTechnical(true)}
        style={{
          padding: "10px 20px",
          borderRadius: "12px",
          border: `2px solid ${isTechnical ? "#60a5fa" : "#1e293b"}`,
          background: isTechnical ? "rgba(96, 165, 250, 0.1)" : "transparent",
          cursor: "pointer",
          color: isTechnical ? "#fff" : "#94a3b8",
          fontSize: "0.85rem",
          fontWeight: "bold",
          transition: "all 0.3s"
        }}
      >
        Technical
      </div>

      <div 
        onClick={() => setIsTechnical(false)}
        style={{
          padding: "10px 20px",
          borderRadius: "12px",
          border: `2px solid ${!isTechnical ? "#60a5fa" : "#1e293b"}`,
          background: !isTechnical ? "rgba(96, 165, 250, 0.1)" : "transparent",
          cursor: "pointer",
          color: !isTechnical ? "#fff" : "#94a3b8",
          fontSize: "0.85rem",
          fontWeight: "bold",
          transition: "all 0.3s",
          margin: "0 auto",
          display: "block"
        }}
      >
        Non-Technical
      </div>
    </div>
  </div>
)}

      <button
        className="login-btn"
        onClick={handleLogin}
        disabled={mode === "register" && (!isPasswordStrong || !fullName)}
      >
        
        {mode === "login" ? "Log In" : "Create Account"}
      </button>


    </div>
  );
}

export default LoginCard;