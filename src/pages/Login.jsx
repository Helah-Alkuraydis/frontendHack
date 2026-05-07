import secureImg from "../assets/images/secure.png";
import LoginCard from "../components/LoginCard";
import "../styles/login.css";

function Login() {
  return (
    <div className="login-page">
      <div className="left-side">
        <img src={secureImg} alt="Cyber Illustration" />
      </div>

      <LoginCard />
    </div>
  );
}

export default Login;
