import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios'; 
import { 
  AlertCircle, CheckCircle2, AlertTriangle, Trash2, 
  ShieldCheck, Lock, Info, ChevronRight, LayoutDashboard,
  Trophy, LogOut, RotateCcw, Clock, Target, Activity, Loader2
} from 'lucide-react';
import { BASE_URL } from '../../api/auth.js';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const PrivacyAwareness = ({ onFinish, initialLevel, mode }: any) => {  const [currentScenario, setCurrentScenario] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [decisions, setDecisions] = useState<Record<string, any>>({});
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<any>({ score: 0, isBreach: false, details: [] });
  const [timeLeft, setTimeLeft] = useState(300);
  const [retryCount, setRetryCount] = useState(0); 
const [activeTaskInfo, setActiveTaskInfo] = useState<number | null>(null);

const fetchAIScenario = async () => {
  setLoading(true);
  setCurrentScenario(null); 
  try {
    const token = localStorage.getItem('token'); 
    const response = await axios.get(
      `${BASE_URL}/games/privacy/start?level=${initialLevel || 1}`, 
      { headers: { Authorization: `Bearer ${token}` } } 
    );
    
    if (response.data && response.data.success) {
      setCurrentScenario(response.data.data);
      console.log("Scenario Loaded from:", response.data.source); 
    }
  } catch (error) {
    console.error("Connection error to Backend");
  } finally {
    setLoading(false);
  }
};
  useEffect(() => {
    fetchAIScenario();
  }, [initialLevel]);

  const getScoreGrade = (score: number) => {
    if (score >= 95) return { text: "🛡️ Flawless Data Protection", color: "text-emerald-500" };
    if (score >= 85) return { text: "🚀 Highly Secure Blueprint", color: "text-blue-500" };
    if (score >= 70) return { text: "⚠️ Good, but can be improved", color: "text-amber-500" };
    return { text: "🚨 Mission Failed: Breach Detected", color: "text-red-500" };
  };

  useEffect(() => {
    if (timeLeft > 0 && !showResult && !loading) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !showResult) {
      validateSystem();
    }
  }, [timeLeft, showResult, loading]);

  const exitGame = () => {
    const timeSpent = 300 - timeLeft; 
    if (onFinish) {
      onFinish({ score: 0, status: 'Loss', duration: timeSpent }); 
      setTimeout(() => onFinish({ status: 'QUIT' }), 100); 
    }
  };

const validateSystem = () => {
  let score = 100;
  let feedback: any[] = [];
  let isCriticalBreach = false;

  currentScenario.correctAnswers.forEach((std: any) => {
    const userDec = decisions[std.dataId];
    const isSelected = selectedIds.includes(std.dataId);
    
    const itemInfo = currentScenario.dataItems.find((i: any) => i.id === std.dataId);
    const displayName = itemInfo ? itemInfo.name : std.dataId;

    if (!std.necessary && isSelected && std.criticalError) {
      score = 0; 
      isCriticalBreach = true;
      feedback.unshift({ 
        title: displayName, 
        correct: false, 
        isBreach: true, 
        msg: `🚨 CRITICAL BREACH: PROTOCOL VIOLATION!`, 
        tips: [`Collecting '${displayName}' is illegal for this system type.`, "Data minimization principle violated."] 
      });
    } 
    else if (std.necessary && !isSelected) {
      score -= 20;
      feedback.push({ 
        title: displayName, 
        correct: false, 
        msg: `Missing mandatory data.`, 
        tips: [`The system architecture is incomplete without ${displayName}.`] 
      });
    }
    else if (isSelected && std.necessary) {
      let errorTips: string[] = [];
      
      if (userDec.sensitivity !== std.sensitivity) 
        errorTips.push(`Security Level: Should be ${std.sensitivity.toUpperCase()}`);
      
      if (userDec.encryption !== std.encryption) 
        errorTips.push(`Storage Mode: Should be ${std.encryption.toUpperCase()}`);
      
      if (userDec.accessLevel !== std.accessLevel) 
        errorTips.push(`Access Control: Must be limited to ${std.accessLevel.toUpperCase()}`);

      if (errorTips.length > 0) {
        score -= (errorTips.length * 5); 
        feedback.push({ 
          title: displayName, 
          correct: false, 
          msg: `Configuration Error`, 
          tips: errorTips 
        });
      } else {
        feedback.push({ title: displayName, correct: true, msg: `Perfectly Secured ✓` });
      }
    }
  });

  setResult({ score: Math.max(0, score), isBreach: isCriticalBreach, details: feedback });
  setShowResult(true);
};

const handleAddData = (item: any) => {
    if (!selectedIds.includes(item.id)) {
      setSelectedIds([...selectedIds, item.id]);
      setDecisions({ 
        ...decisions, 
        [item.id]: { necessary: true, sensitivity: 'normal', encryption: 'plain', accessLevel: 'user' } 
      });
    }
  };

const resetGame = () => {
  setRetryCount(prev => prev + 1);
  
  setShowResult(false);
  setSelectedIds([]);
  setDecisions({});
  setResult({ score: 0, isBreach: false, details: [] });
  
  setTimeLeft(300); 
  
  fetchAIScenario(); 
};

 if (loading) {
  return (
    <div className="fixed inset-0 z-[600] flex flex-col items-center justify-center bg-[#f4f7fa] animate-in fade-in duration-500">
      <div className="p-12 bg-white rounded-[3.5rem] shadow-2xl flex flex-col items-center gap-8 border border-blue-50 max-w-sm w-full mx-4">
        <div className="relative">
          <Loader2 className="text-blue-500 animate-spin" size={80} />
          <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-100" size={32} />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-black italic text-gray-900 uppercase tracking-tighter">Architecting Mission...</h2>
          <p className="text-blue-600 text-xs font-black uppercase tracking-[0.2em] mt-3 animate-pulse">
            Gemini AI is generating dynamic items
          </p>
        </div>
      </div>
    </div>
  );
}

  return (
    <div className="flex flex-col h-full w-full bg-[#f4f7fa] p-4 md:p-6 font-sans overflow-y-auto">
      
      {/* 1. Header */}
      <div className="bg-white p-5 rounded-[2rem] border border-gray-200 shadow-sm mb-6 flex justify-between items-center animate-in slide-in-from-top duration-500">
        <div className="flex items-center gap-4">
           <div className="bg-gray-900 text-white p-3 rounded-2xl shadow-lg">
             <ShieldCheck className="text-blue-400" size={24}/>
           </div>
           <div>
             <h1 className="text-xl font-black text-gray-900 italic uppercase tracking-tighter leading-none">{currentScenario?.title}</h1>
             <p className="text-blue-600 text-[10px] font-black uppercase tracking-widest mt-1">Level {initialLevel || 1}</p>
           </div>
        </div>

        <div className={cn(
          "flex flex-col items-center px-8 py-2 rounded-2xl border-2 transition-all",
          timeLeft <= 10 ? "border-red-500 bg-red-50 animate-pulse scale-110" : "border-gray-100 bg-gray-50"
        )}>
          <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Time Remaining</div>
          <div className={cn("text-xl font-black italic flex items-center gap-2", timeLeft <= 10 ? "text-red-600" : "text-gray-900")}>
          <Clock size={18}/>
          {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:
          {(timeLeft % 60).toString().padStart(2, '0')}
          </div>
        </div>
      </div>
{/* 2. Context Box - Interactive Vertical Tasks */}
      <div className="bg-white border-2 border-dashed border-blue-100 rounded-[2.5rem] p-6 mb-8 flex flex-col md:flex-row gap-6 items-stretch animate-in fade-in duration-700 shadow-sm">
        
        {/* قسم السيناريو (Briefing) */}
        <div className="flex-[3] px-2 flex flex-col justify-center border-b-2 md:border-b-0 md:border-r-2 border-blue-50 border-dashed pb-6 md:pb-0 md:pr-8 text-left">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-blue-500/10 p-1.5 rounded-lg">
              <Info className="text-blue-500" size={16}/>
            </div>
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Mission Briefing</span>
          </div>
          <p className="text-gray-700 text-sm font-bold leading-relaxed italic">"{currentScenario?.context}"</p>
        </div>

        {/* قسم المهام (Your Tasks) */}
        <div className="flex-1 min-w-[170px] flex flex-col justify-center text-left">
          <div className="flex items-center gap-2 mb-4 px-1">
            <Target className="text-emerald-500" size={14}/>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Your Tasks</span>
          </div>

          <div className="flex flex-col gap-3">
            {currentScenario?.task?.map((t: any, i: number) => {
  // 1. منطق التعرف على نوع المهمة (يدعم النظام القديم والجديد معاً)
  const isProtect = t.type === 'protect' || (typeof t === 'string' && (t.toLowerCase().includes('protect') || t.toLowerCase().includes('security') || t.toLowerCase().includes('credentials')));
  const isMinimize = t.type === 'minimize' || (typeof t === 'string' && (t.toLowerCase().includes('limit') || t.toLowerCase().includes('reject') || t.toLowerCase().includes('minimize')));
  const isIdentify = t.type === 'identify' || (!isProtect && !isMinimize);

  // 2. استخراج نص المهمة (سواء كان object أو string)
  const taskContent = t.text || t;

  // 3. التحقق من الإنجاز لربطه بالـ Grid
  const hasSelectedData = selectedIds.length > 0;
  const hasSecurityApplied = Object.values(decisions).some((d: any) => d.encryption !== 'plain' || d.sensitivity !== 'normal');
  const isDone = (isIdentify && hasSelectedData) || (isProtect && hasSecurityApplied) || (isMinimize && hasSelectedData);
  
  // 4. حالة التوسع عند الضغط
  const isExpanded = activeTaskInfo === i;

  // 5. العناوين الغامقة التي تظهر داخل البوكس عند التوسع
  const taskHeading = isIdentify ? "IDENTIFY DATA" : isProtect ? "PROTECT CREDENTIALS" : "MINIMIZE COLLECTION";

  return (
    <div 
      key={i} 
      onClick={() => setActiveTaskInfo(isExpanded ? null : i)}
      className={cn(
        "relative flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all duration-500 cursor-pointer overflow-hidden",
        isDone ? "bg-emerald-50 border-emerald-100" : "bg-gray-50 border-transparent hover:border-blue-100",
        isExpanded ? "min-h-[110px] border-blue-400 bg-white shadow-md ring-1 ring-blue-50" : "min-h-[75px]"
      )}
    >
      {isExpanded ? (
        /* واجهة الشرح (تظهر عند الضغط) */
        <div className="animate-in fade-in zoom-in duration-300 px-1 text-center">
          <h4 className="text-[12px] font-black text-blue-600 uppercase mb-1">{taskHeading}</h4>
          <p className="text-[12px] font-bold text-gray-900 leading-tight">
            {taskContent}
          </p>
          <div className="mt-2 text-[7px] font-black text-gray-400 uppercase tracking-tighter">Click to close</div>
        </div>
      ) : (
        /* واجهة الأيقونة (الشكل الافتراضي) */
        <div className="flex flex-col items-center animate-in fade-in duration-300">
          <div className={cn("mb-1.5 transition-all", isDone ? "text-emerald-600" : "text-gray-400")}>
            {isIdentify && <Activity size={20} />}
            {isProtect && <Lock size={20} />}
            {isMinimize && <Trash2 size={20} />}
          </div>
          <span className={cn("text-[12px] font-black uppercase tracking-tight text-center leading-none", isDone ? "text-emerald-700" : "text-gray-500")}>
            {isIdentify ? "Identify" : isProtect ? "Protect" : "Minimize"}
          </span>
        </div>
      )}

      {/* علامة الإنجاز الخضراء */}
      {isDone && !isExpanded && (
        <div className="absolute top-1.5 right-1.5 bg-emerald-500 rounded-full p-0.5 animate-in zoom-in shadow-sm">
          <CheckCircle2 className="text-white" size={8} />
        </div>
      )}
    </div>
  );
})}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Inventory Column */}
        <div className="lg:col-span-3 space-y-3">
          <h3 className="text-gray-400 font-black text-[9px] tracking-[0.2em] uppercase px-1">Inventory</h3>
          <div className="grid grid-cols-1 gap-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {currentScenario?.dataItems?.map((item: any) => (
              <div key={item.id} onClick={() => handleAddData(item)}
                className={cn("bg-white border-2 p-3 rounded-xl shadow-sm transition-all flex items-center gap-3 min-h-[64px]",
                selectedIds.includes(item.id) ? "opacity-30 border-transparent grayscale cursor-not-allowed" : "border-white hover:border-blue-500 cursor-pointer shadow-sm")}>
                <div className="text-2xl shrink-0">{item.icon}</div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-800 text-[10px] uppercase italic leading-tight">{item.name}</h4>
                  <p className="text-[8px] text-gray-400 font-black uppercase mt-1">{item.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Decision Grid Column */}
        <div className="lg:col-span-9 bg-white rounded-[2.5rem] border border-gray-200 shadow-xl flex flex-col overflow-hidden min-h-[600px]">
           <div className="bg-gray-900 text-white p-5 flex items-center justify-between">
             <div className="flex items-center gap-3">
               <ShieldCheck className="text-blue-400" size={20}/>
               <h3 className="text-lg font-black italic uppercase tracking-tight">Decision Grid</h3>
             </div>
           </div>
           
           {selectedIds.length === 0 ? (
             <div className="flex-1 flex flex-col items-center justify-center text-gray-300 p-10 text-center">
                <Lock size={48} className="mb-4 opacity-5"/>
                <p className="font-black uppercase tracking-widest text-[9px]">Drag data points to begin architecture</p>
             </div>
           ) : (
             <div className="flex flex-col flex-1 overflow-hidden">
                <div className="grid grid-cols-12 gap-2 px-6 py-4 bg-gray-50 border-b border-gray-100 text-[8px] font-black text-gray-400 uppercase tracking-widest text-center">
                  <div className="col-span-3 text-left">Data Point</div>
                  <div className="col-span-2">Necessity</div>
                  <div className="col-span-2">Sensitivity</div>
                  <div className="col-span-2">Storage</div>
                  <div className="col-span-2">Access</div>
                  <div className="col-span-1">Del</div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar font-sans">
                  {selectedIds.map(id => {
                    const item = currentScenario.dataItems.find((i: any) => i.id === id);
                    return (
                      <div key={id} className="grid grid-cols-12 gap-2 items-center bg-white border border-gray-100 p-3 rounded-2xl shadow-sm animate-in slide-in-from-right">
                         <div className="col-span-3 flex items-center gap-2">
                           <span className="text-xl self-start mt-0.5">{item?.icon}</span>
                           <div className="min-w-0 flex-1">
                             <h4 className="font-black text-gray-900 text-[10px] uppercase italic leading-tight break-words">{item?.name}</h4>
                             <p className="text-[7px] text-gray-400 font-bold mt-1 uppercase">{item?.category}</p>
                           </div>
                         </div>
                         <div className="col-span-2">
                           <button onClick={() => setDecisions({...decisions, [id]: {...decisions[id], necessary: !decisions[id]?.necessary}})}
                             className={cn("w-full py-2 rounded-lg text-[8px] font-black uppercase border transition-all",
                             decisions[id]?.necessary ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100" : "bg-gray-50 border-gray-200 text-gray-400")}>
                             {decisions[id]?.necessary ? "Essential" : "Optional"}
                           </button>
                         </div>
                         <div className="col-span-2 px-1">
                           <select className="w-full bg-white border border-gray-300 p-2 rounded-lg text-[7px] font-black text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 text-center cursor-pointer shadow-sm"
                             value={decisions[id]?.sensitivity} onChange={(e) => setDecisions({...decisions, [id]: {...decisions[id], sensitivity: e.target.value}})}>
                             <option value="normal">NORMAL</option>
                             <option value="important">IMPORTANT</option>
                             <option value="sensitive">SENSITIVE</option>
                           </select>
                         </div>
                         <div className="col-span-2 px-1">
                           <select className="w-full bg-white border border-gray-300 p-2 rounded-lg text-[7px] font-black text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 text-center cursor-pointer shadow-sm"
                             value={decisions[id]?.encryption} onChange={(e) => setDecisions({...decisions, [id]: {...decisions[id], encryption: e.target.value}})}>
                             <option value="plain">PLAIN</option>
                             <option value="encrypted">ENCRYPTED</option>
                             <option value="hashed">HASHED</option>
                           </select>
                         </div>
                         <div className="col-span-2 px-1">
                           <select className="w-full bg-white border border-gray-300 p-2 rounded-lg text-[7px] font-black text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 text-center cursor-pointer shadow-sm"
                             value={decisions[id]?.accessLevel} onChange={(e) => setDecisions({...decisions, [id]: {...decisions[id], accessLevel: e.target.value}})}>
                             <option value="user">JUST USER</option>
                             <option value="admin">ADMIN</option>
                             <option value="public">PUBLIC</option>
                             <option value="private">PRIVATE</option>
                           </select>
                         </div>
                         <div className="col-span-1 text-right">
                           <button onClick={() => setSelectedIds(selectedIds.filter(sid => sid !== id))} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={12}/></button>
                         </div>
                      </div>
                    );
                  })}
                </div>
                <div className="p-6 bg-gray-50 border-t border-gray-100">
                  <button onClick={validateSystem} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black italic text-[11px] hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 uppercase tracking-widest leading-none">
                    Submit Architecture Audit
                  </button>
                </div>
             </div>
           )}
        </div>
      </div>
      
      {/* 5. Result View */}
      {showResult && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[500] flex items-center justify-center p-4">
          <div className="bg-[#f8f9fa] rounded-[2.5rem] max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl border-8 border-white animate-in zoom-in duration-300 overflow-hidden relative">
            <div className="sticky top-0 bg-[#f8f9fa] z-30 px-8 py-5 border-b border-gray-100 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <div className={cn("text-5xl font-black italic", result.score >= 70 ? "text-emerald-500" : "text-red-500")}>
                    {mode === 'weekly' && result.score >= 70 ? "PASSED" : `${result.score}%`}
                </div>
                <h2 className={cn("text-sm font-black uppercase italic leading-tight", getScoreGrade(result.score).color)}>
                    {mode === 'weekly' && result.score >= 70 ? "🛡️ Weekly Challenge Progress +1" : getScoreGrade(result.score).text}
                </h2>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4 custom-scrollbar font-sans">
              {result.details.map((item: any, idx: number) => (
                <div key={idx} className={cn("p-5 rounded-2xl border-l-[6px] bg-white transition-all shadow-sm", item.correct ? "border-emerald-500" : "border-red-500")}>
                  <div className="flex items-start gap-4">
                    {item.correct ? <CheckCircle2 className="text-emerald-600 mt-1" size={24}/> : <AlertCircle className="text-red-600 mt-1" size={24}/>}
                    <div className="flex-1">
                      <h4 className={cn("font-black text-[11px] uppercase mb-1", item.correct ? "text-emerald-700" : "text-red-700")}>
                        {item.correct ? `Safe Entry ✓` : `Risk Detected X`} - {item.title}
                      </h4>
                      <p className="text-xs font-bold text-gray-800 italic leading-snug">{item.msg}</p>
                      {item.tips && (
                        <div className="mt-3 pt-3 border-t border-gray-50 space-y-1">
                          {item.tips.map((tip: string, tIdx: number) => (
                            <div key={tIdx} className="text-[10px] font-bold text-red-600 flex items-center gap-1.5 mt-1">
                              <div className="w-1 h-1 rounded-full bg-red-400" /> {tip}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="sticky bottom-0 bg-[#f8f9fa] z-30 px-8 py-6 border-t border-gray-100">
              <div className="flex gap-4">
                {result.score >= 70 ? (
              <button 
                  onClick={() => {
                      const timeSpent = 300 - timeLeft;  
                      onFinish({ score: result.score, status: 'Win', duration: timeSpent });
                  }} 
  
                    className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase shadow-lg shadow-emerald-200 hover:bg-emerald-700 italic transition-all flex items-center justify-center gap-2"
                            >
                {mode === 'weekly' ? "RECORD PROGRESS" : "FINISH MISSION"} <ShieldCheck size={20}/>          
                  </button>
                ) : (
                  <>
                 <div className="flex gap-4 w-full">
  
  <button 
    onClick={exitGame} 
    className={cn(
      "bg-white border-2 border-red-100 text-red-400 py-3 rounded-2xl font-black uppercase hover:bg-red-50 flex items-center justify-center gap-2 italic leading-none transition-all duration-500",
      retryCount >= 3 ? "flex-1 w-full" : "flex-2" 
    )}
  >
    <LogOut size={16}/> ABORT TO GAMES
  </button>

  {retryCount < 3 && (
    <button 
      onClick={resetGame} 
      className="flex-[2] bg-gray-900 text-white py-4 rounded-2xl font-black uppercase shadow-lg hover:bg-black transition-all flex items-center justify-center gap-2 italic leading-none animate-in slide-in-from-right"
    >
      <RotateCcw size={16}/> RETRY NEW SCENARIO
    </button>
  )}

</div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default PrivacyAwareness;