import secureImg from "../assets/images/secure.png";
import LoginCard from "../components/LoginCard";
import "../styles/login.css";

function Login() {
  return (
    <div className="login-page flex flex-col md:flex-row items-center justify-center min-h-screen">
      
      <div className="left-side hidden md:flex md:w-1/2 justify-center items-center">
        <img src={secureImg} alt="Cyber Illustration" className="max-w-[80%] object-contain" />
      </div>

      <div className="w-full md:w-1/2 flex justify-center items-center p-6">
        <LoginCard />
      </div>
      
    </div>
  );
}

export default Login;