import { useState } from "react";
import InputField from "../components/InputField";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import secureImg from "../assets/images/secure.png";
import "../styles/login.css";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

  const handleReset = async () => {
    if (!email) {
      Swal.fire({
        icon: "warning",
        title: "Oops! ⚠️",
        text: "Please enter your email",
      });
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Reset Link Sent ✅",
          text: data.message || "Check your email for the reset link.",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed ❌",
          text: data.message || "Unable to send reset link.",
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error ❌",
        text: "Something went wrong while sending the reset link.",
      });
    }
  };

  return (
    <div className="login-page">
      <div className="left-side">
        <img src={secureImg} alt="Cyber Illustration" />
      </div>

      <div className="login-card">
        <h2 style={{ color: "white", marginBottom: "10px" }}>Forgot Password</h2>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", marginBottom: "20px" }}>
          Enter your email and we will send you a reset link
        </p>

        <InputField
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button className="login-btn" onClick={handleReset}>
          Send Reset Link
        </button>

        <div className="forgot" style={{ marginTop: "15px" }}>
          <Link to="/" style={{ color: "#4fa3f7" }}>
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
