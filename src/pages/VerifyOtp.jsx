import { useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import secureImg from "../assets/images/secure.png";
import "../styles/login.css";
import { BASE_URL } from "../api/auth.js";
// تعيين رابط السيرفر المرفوع لضمان الاتصال

function VerifyOtpPage() {
  const [otp, setOtp] = useState(new Array(4).fill(""));
  const inputRefs = useRef([]); 
  
  const location = useLocation();
  const navigate = useNavigate();
  
  // استلام الإيميل ونوع العملية من الصفحة السابقة
  const email = location.state?.email || "";
  const type = location.state?.type || "signup"; 

  const handleChange = (element, index) => {
    const value = element.value;
    if (isNaN(value)) return; 

    let newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1); 
    setOtp(newOtp);

    if (value && index < 3) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join("");
    
    if (otpString.length < 4) {
      Swal.fire({ icon: "warning", title: "Wait!", text: "Please enter the 4-digit code" });
      return;
    }

    try {
      // التعديل هنا: استخدام الرابط المرفوع بدلاً من localhost
      const res = await axios.post(
        `${BASE_URL}/auth/verify-email`, 
        { email, otp: otpString, type }
      );

      if (res.data.token) {
        if (res.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user)); 
        }
        const user = res.data.user;

        if (user && user.role === "Admin") { 
            await Swal.fire({
                icon: "success",
                title: "Admin Access Granted 🛠️",
                text: "Welcome back, Admin!",
                confirmButtonColor: "#3085d6"
            });
            navigate("/admin/dashboard");
        } else {
            if (type === "signup") {
              localStorage.setItem('showTourAfterLogin', 'true');
            }

            await Swal.fire({
              icon: "success",
              title: type === "login" ? "Welcome back! 👋" : "Verified ✅",
              text: "Your account is now active and secure.",
              confirmButtonColor: "#3085d6"
            });

            navigate("/home"); 
        }
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Invalid OTP ❌",
        text: err.response?.data?.message || "Please try again",
      });
    }
  };

  const handleResend = async () => {
    try {
      // التعديل هنا: استخدام الرابط المرفوع
      await axios.post(`${BASE_URL}/auth/resend-otp`, { email });
      Swal.fire({
        icon: "success",
        title: "OTP Request Sent 📩",
        text: "Since this is a demo, please check the alert on your signup screen.",
      });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error ❌", text: "Could not process request." });
    }
  };

  return (
    <div className="login-page">
      <div className="left-side">
        <img src={secureImg} alt="Secure Illustration" />
      </div>

      <div className="login-card">
        <h2 className="otp-main-title">OTP Verification</h2>
        <p className="otp-main-subtitle">
          Please enter the OTP sent to <strong>{email}</strong>
        </p>

        <div className="otp-container">
          {otp.map((data, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              className="otp-input"
              value={data}
              ref={(el) => (inputRefs.current[index] = el)}
              onChange={(e) => handleChange(e.target, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onFocus={(e) => e.target.select()}
            />
          ))}
        </div>

        <button className="login-btn" onClick={handleVerify}>
          Verify
        </button>

        <button
          className="login-btn resend-btn"
          style={{ marginTop: "10px" }}
          onClick={handleResend}
        >
          Resend OTP
        </button>

        <div className="forgot" style={{ marginTop: "15px" }}>
          <Link to="/" style={{ color: "#4fa3f7", textDecoration: "none" }}>
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default VerifyOtpPage;