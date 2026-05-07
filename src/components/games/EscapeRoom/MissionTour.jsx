import React, { useState } from 'react';

const MissionTour = ({ onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);

    const steps = [
        { 
            title: "SYSTEM BREACH", 
            icon: "🚨",
            content: "Welcome to the Cyber Escape Room. To regain control, your team must clear 4 security rooms. Roles will be dynamically assigned based on your team size." 
        },
        { 
            title: "ROOM 01: ENCODING", 
            icon: "🔐",
            content: "Your objective is to analyze intercepted data packets and decrypt them using cryptographic techniques to find the access key." 
        },
        { 
            title: "ROOM 02: DEFENDER", 
            icon: "🛡️",
            content: "You must monitor live network streams, identify threats, and isolate compromised network terminals before the virus spreads." 
        },
        { 
            title: "ROOM 03: LOGIC TRAP", 
            icon: "🧠",
            content: "Your task is to bypass the security gates by solving boolean logic traps and identifying tautologies (always true statements)." 
        },
        { 
            title: "ROOM 04: CORE BREACH", 
            icon: "💻",
            content: "You will execute the final multi-layer breach by cracking dual-factor authentication (Base64 & Vigenère) to secure the system." 
        }
    ];

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onComplete(); 
        }
    };

    return (
      
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#050810]/80 backdrop-blur-sm font-mono p-4">
            
            
            <div className="relative w-full max-w-md bg-[#0a1020] border border-[#00ff96]/30 rounded-[2rem] p-8 shadow-[0_0_50px_rgba(0,255,150,0.1)] flex flex-col items-center text-center animate-in zoom-in duration-300">
                
               
                <div className="w-16 h-16 bg-[#00ff96]/10 border border-[#00ff96]/30 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-inner">
                    {steps[currentStep].icon}
                </div>

                
                <h2 className="text-xl font-black text-white italic uppercase tracking-widest mb-4">
                    {steps[currentStep].title}
                </h2>

               
                <div className="min-h-[90px] mb-8 flex items-center justify-center">
                    <p className="text-[#8a9ab0] text-sm leading-relaxed">
                        {steps[currentStep].content}
                    </p>
                </div>

                
                <div className="flex gap-2 mb-8">
                    {steps.map((_, idx) => (
                        <div 
                            key={idx} 
                            className={`h-1.5 rounded-full transition-all duration-500 ${
                                idx === currentStep ? 'w-8 bg-[#00ff96] shadow-[0_0_10px_#00ff96]' : 'w-2 bg-white/10'
                            }`}
                        />
                    ))}
                </div>

              
                <button 
                    onClick={handleNext}
                    className="w-full py-4 bg-gradient-to-r from-[#00ff96] to-[#00cc77] hover:from-white hover:to-white text-black font-black uppercase tracking-[0.2em] rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(0,255,150,0.2)] active:scale-95"
                >
                    {currentStep === steps.length - 1 ? 'Enter Lobby' : 'Next Step'}
                </button>
            </div>
        </div>
    );
};

export default MissionTour;