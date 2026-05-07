import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import "../styles/login.css"; 

const Signup = () => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('https://hackhero-tpme.onrender.com/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (data.success) {
                // هذا السطر هو اللي يطلع الرمز للبنات
                alert(`Account created! 🎉\n\nDemo Activation Code: ${data.code}`);
                navigate('/verify-otp', { state: { email: formData.email, type: 'signup' } }); 
            } else {
                alert(data.message || "Registration failed");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <h2>Sign Up - HackHero</h2>
                <form onSubmit={handleSubmit}>
                    <input type="text" name="username" placeholder="Username" onChange={(e) => setFormData({...formData, username: e.target.value})} required className="login-input" />
                    <input type="email" name="email" placeholder="Email" onChange={(e) => setFormData({...formData, email: e.target.value})} required className="login-input" />
                    <input type="password" name="password" placeholder="Password" onChange={(e) => setFormData({...formData, password: e.target.value})} required className="login-input" />
                    <button type="submit" className="login-btn">Create Account</button>
                </form>
            </div>
        </div>
    );
};
export default Signup;