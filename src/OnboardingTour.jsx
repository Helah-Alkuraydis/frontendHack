import { useState, useEffect, useCallback } from 'react';
import { 
  X, Rocket, CheckCircle, Gamepad2, Swords, 
  Trophy, LayoutDashboard, Users, User 
} from 'lucide-react';

const OnboardingTour = ({ onComplete, onStepChange }) => {
  const [step, setStep] = useState(0);
  const [coords, setCoords] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // تحديث حالة الشاشة عند التكبير والتصغير لضمان عزل حقيقي
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const steps = [
    {
      title: "Welcome to HackHero!",
      content: "Get ready to dive into the digital world. Learn, play, and master cybersecurity skills to become the ultimate protector.",
      position: "center",
      layout: "astra",
      btnNext: "Start Mission",
      btnIcon: <Rocket size={24} fill="currentColor" />
    },
    {
      title: "Games , The Arena",
      content: "Time to lock and load! Dive into interactive simulations like Phishing Hunter and Firewall Defender to sharpen your skills and farm massive XP",
      position: "games",
      btnNext: "Next",
      btnSkip: "Skip",
      showAvatar: true,
      avatar: "/game-icon.png",
      icon: <Gamepad2 size={24} className="text-blue-400" />, // أيقونة احتياطية
      role: "guide_small",
      hasArrow: true
    },
    {
      title: "Join the Challenges !",
      content: "Think you're the best? Face off against players-built puzzles or deploy your own digital Challenges to test the skills of hackers worldwide",
      position: "challenge",
      btnNext: "Next", 
      btnBack: "Back",
      showAvatar: true,
      avatar: "/Avatar.png", 
      icon: <Swords size={24} className="text-blue-400" />,
      role: "guide_small",
      hasArrow: true
    },
    {
      title: "Get achievements !",
      content: "Legendary status awaits! Review your collection of rare badges. Every trophy tells the story of your rise to the top",
      position: "achievements",
      avatar: "/achievement.png", // 🟢 صورة أساسية
      btnNext: "Next",
      btnBack: "Back",
      showAvatar: true,
      role: "guide_small",
      hasArrow: true
    },
    {
      title: "Dashboard , Command Center",
      content: "Real-time intel at your fingertips. Monitor your tactical efficiency, win rates, and XP progression to stay ahead of the competition",
      position: "dashboard",
      avatar: "/dashboard-icon.png",
      icon: <LayoutDashboard size={24} className="text-blue-400" />, // أيقونة احتياطية
      btnNext: "Next",
      btnBack: "Back",
      showAvatar: true,
      role: "guide_small",
      hasArrow: true
    },
    {
      title: "Cyber Network ( Friends )",
      content: "Cybersecurity is better together! Connect with friends, build your team, and see who's online.",
      position: "friends",
      avatar: "/friends-icon.png",
      icon: <Users size={24} className="text-blue-400" />, // أيقونة احتياطية
      btnNext: "Next",
      btnBack: "Back",
      showAvatar: true,
      role: "guide_small",
      hasArrow: true
    },
    {
      title: "Profile",
      content: "This is your personal command center. Here you can change your tactical avatar, update your bio, and manage your account security. It’s where you define how the global community sees your legend",
      position: "profile",
      avatar: "/Avatar.png", // 🟢 صورة أساسية
      btnNext: "Next",
      btnBack: "Back",
      showAvatar: true,
      role: "guide_small",
      hasArrow: true
    },
    {
      title: "All Set!",
      content: "I'll be right here on the side if you ever need a hand just call me anytime. Good luck on your mission!",
      position: "center",
      layout: "astra",
      btnNext: "Let's Go",
      btnIcon: <CheckCircle size={24} />
    }
  ];

  const currentStep = steps[step];

  const updatePosition = useCallback(() => {
    // تنظيف كلاسات التوهج للجوال
    document.querySelectorAll('.active-tour-glow').forEach(el => el.classList.remove('active-tour-glow'));

    if (currentStep.position === "center") {
      setCoords(null);
      return;
    }
    
    let elementId = "";
    if (currentStep.position === "games") elementId = "games-step";
    if (currentStep.position === "challenge") elementId = "challenge-step";
    if (currentStep.position === "achievements") elementId = "achievements-step"; 
    if (currentStep.position === "dashboard") elementId = "dashboard-step"; 
    if (currentStep.position === "friends") elementId = "friends-step"; 
    if (currentStep.position === "profile") elementId = "profile-step"; 

    if (window.innerWidth < 768) {
      // 📱 [بيئة الجوال معزولة تماماً]: نبحث فقط عن الأيقونة النشطة داخل الـ MobileNav السفلي
      const elements = document.querySelectorAll(`#${elementId}`);
      const element = Array.from(elements).find(el => el.closest('nav')) || document.getElementById(elementId);
      
      if (element) {
        const rect = element.getBoundingClientRect();
        element.classList.add('active-tour-glow');
        setCoords({
          top: rect.top,
          left: rect.left + rect.width / 2,
          isMobile: true // وسم لتأكيد تفعيل استثناء الجوال
        });
      } else {
        setCoords(null);
      }
    } else {
      // 💻 [بيئة اللابتوب معزولة ومحمية 100%]: الكود والعمليات الحسابية الأصلية حقتكم بدون لمس أي حرف
      const element = document.getElementById(elementId);
      if (element) {
        const rect = element.getBoundingClientRect();
        setCoords({
          top: rect.top + rect.height / 2,
          left: rect.right + 25, 
          isMobile: false
        });
      } else {
        setCoords(null);
      }
    }
  }, [currentStep.position]);

  useEffect(() => {
    if (onStepChange) onStepChange(step);
    updatePosition();
  }, [step, onStepChange, updatePosition]);

  useEffect(() => {
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [updatePosition]);

  const handleNext = () => step < steps.length - 1 ? setStep(step + 1) : onComplete();
  const handleSkip = () => onComplete();

  if (currentStep.layout === 'astra') {
    return (
      <div className="fixed inset-0 z-[10000] flex items-center justify-center pt-24">
        <div className="absolute inset-0 bg-[#050810]/85 backdrop-blur-sm transition-opacity duration-500"></div>
        <div key={step} className="relative w-[85%] max-w-[340px] bg-gradient-to-b from-[#2a324b]/90 to-[#161b2e]/95 backdrop-blur-xl border border-blue-500/20 rounded-[2.5rem] p-5 shadow-2xl animate-in zoom-in fade-in duration-500 text-white">
          <div className="absolute -top-[110px] left-1/2 -translate-x-1/2 w-[200px] z-20 pointer-events-none">
            <img src="/Astra.png" alt="Astra Guide" className="w-full h-full object-contain drop-shadow-2xl" />
          </div>
          <div className="flex flex-col items-center text-center mt-[85px] relative z-10">
            <h2 className="text-2xl font-extrabold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">{currentStep.title}</h2>
            <p className="text-blue-100/80 text-sm leading-relaxed mb-6 font-medium">{currentStep.content}</p>
            <button onClick={handleNext} className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2">
              {currentStep.btnIcon} {currentStep.btnNext}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[10000]">
      {/* ستايل التوهج السيبراني للأيقونة في الجوال فقط ولا يظهر في اللابتوب */}
      <style>{`
        .active-tour-glow {
          position: relative;
          z-index: 100005;
          background: rgba(6, 182, 212, 0.2) !important;
          box-shadow: 0 0 15px 5px rgba(6, 182, 212, 0.5) !important;
          border-radius: 30% !important;
          transition: all 0.3s ease-in-out;
        }
      `}</style>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-500"></div>

      <div
        style={(coords && !coords.isMobile) ? {
          // 💻 قواعد اللابتوب الأصلية الناجحة والقديمة حقتكم رجعت تماماً بمكانها الطبيعي
          position: "fixed",
          top: `${coords.top}px`,
          left: `${coords.left}px`,
          transform: "translateY(-50%)",
          zIndex: 10001
        } : (coords && coords.isMobile) ? {
          // 📱 استثناء الجوال الخاص: يطير فوق الأيقونة السفلية النشطة بالضبط
          position: "fixed",
          bottom: `${window.innerHeight - coords.top + 12}px`, 
          left: `${coords.left}px`,
          transform: "translateX(-50%)",
          zIndex: 10001
        } : {
          position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 10001
        }}
        className="transition-all duration-300 ease-out"
      >
        {/* 🟢 عزل الحجم التام: إذا كان لابتوب يرجع w-[380px] وبادينج p-6، وإذا كان جوال يصغر لـ w-[280px] وبادينج p-4 عشان ما يغطي على الأيقونات جمبه */}
        <div 
          key={step} 
          className={`relative bg-[#1e2330]/95 backdrop-blur-xl border border-gray-600/30 rounded-[1.5rem] shadow-2xl text-white animate-in zoom-in duration-300 mx-auto
            ${coords?.isMobile ? 'w-[280px] p-4' : 'w-[380px] p-6'}`}
        >
          
          {/* سهم اللابتوب الأصلي (يشير لليسار باتجاه السايد بار الجانبي) */}
          {!coords?.isMobile && currentStep.hasArrow && coords && (
            <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-4 h-4 bg-[#1e2330] border-l border-b border-gray-600/30 rotate-45"></div>
          )}

          {/* سهم الجوال المستثنى (يشير للأسفل باتجاه الناف بار السفلي) */}
          {coords?.isMobile && currentStep.hasArrow && coords && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#1e2330] border-r border-b border-gray-600/30 rotate-45"></div>
          )}

          <button onClick={handleSkip} className="absolute top-5 right-5 text-gray-400 hover:text-white bg-white/5 rounded-full p-1 transition-colors">
            <X size={20} />
          </button>

          <div className="flex gap-2 mb-6">
            {steps.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-blue-500' : 'w-2 bg-white/20'}`}></div>
            ))}
          </div>

          <div className="flex flex-col items-start relative z-10 w-full">
            {currentStep.showAvatar ? (
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full border border-blue-500 p-[2px] bg-[#121620] flex items-center justify-center overflow-hidden">
                  { (currentStep.position === 'profile' || currentStep.position === 'achievements') ? (
                    <img src={currentStep.avatar} className="w-full h-full object-cover rounded-full" alt="Avatar" />
                  ) : (
                    currentStep.icon || <img src={currentStep.avatar} className="w-full h-full object-cover rounded-full" />
                  )}
                </div>
                <h2 className="text-lg font-semibold">{currentStep.title}</h2>
              </div>
            ) : (
              <h2 className="text-2xl font-bold mb-4">{currentStep.title}</h2>
            )}

            {/* عزل مقاسات النصوص والهوامش الداخلية لتصغر فقط في شاشة الجوال */}
            <p className={`text-gray-300 leading-relaxed font-medium whitespace-pre-line ${coords?.isMobile ? 'text-xs mb-4' : 'text-sm mb-6'}`}>
              {currentStep.content}
            </p>

            <div className="flex gap-3 w-full justify-end border-t border-white/10 pt-4">
              <button onClick={() => setStep(step - 1)} disabled={step === 0} className="px-6 py-2 rounded-xl font-bold text-gray-400 hover:text-white transition-colors text-sm">
                Back
              </button>
              <button onClick={handleNext} className="px-8 py-2 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20 transition-all text-sm">
                {currentStep.btnNext}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;