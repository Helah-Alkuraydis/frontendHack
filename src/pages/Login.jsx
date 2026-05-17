import secureImg from "../assets/images/secure.png";
import LoginCard from "../components/LoginCard";
import "../styles/login.css";

function Login() {
  return (
    <div className="login-page flex flex-col md:grid min-h-screen">
      
      <div className="left-side flex h-[35vh] sm:h-[38vh] md:h-auto justify-center items-center">
        <img 
          src={secureImg} 
          alt="Cyber Illustration" 
          className="h-full max-h-[400px] w-auto object-contain" 
        />
      </div>

      <LoginCard />
    </div>
  );
}

export default Login;
