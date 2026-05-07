import React from 'react';
import {
    AlertCircle, CheckCircle2, Trash2, ShieldCheck,
    Lock, Info, Clock, Target, RotateCcw, LogOut
} from 'lucide-react';

// دالة مساعدة لتنسيق الكلاسات (Tailwind Merge)
const cn = (...inputs: any[]) => inputs.filter(Boolean).join(' ');

interface PrivacyLayoutProps {
    title : string;
    scenario: any;
    points_pool : number;
    selectedIds: string[];
    decisions: Record<string, any>;
    timeLeft: number;
    initialLevel: number;
    showResult: boolean;
    result: any;
    retryCount: number;
    onAddData: (item: any) => void;
    onRemoveData: (id: string) => void;
    onUpdateDecision: (id: string, field: string, value: any) => void;
    onSubmit: () => void;
    onReset: () => void;
    onQuit: () => void;
    onFinish: (data: any) => void;
}

const PrivacyAwarenessLayout: React.FC<PrivacyLayoutProps> = ({
    title ,
    scenario, selectedIds, decisions, timeLeft, initialLevel,
    showResult, result, retryCount, points_pool,onAddData, onRemoveData,
    onUpdateDecision, onSubmit, onReset, onQuit, onFinish
}) => {

    const getScoreGrade = (score: number) => {
        if (score >= 95) return { text: "🛡️ Flawless Data Protection", color: "text-emerald-500" };
        if (score >= 85) return { text: "🚀 Highly Secure Blueprint", color: "text-blue-500" };
        if (score >= 70) return { text: "⚠️ Good, but can be improved", color: "text-amber-500" };
        return { text: "🚨 Mission Failed: Breach Detected", color: "text-red-500" };
    };

    return (
        <div className="flex flex-col h-full w-full bg-[#f4f7fa] p-4 md:p-6 font-sans overflow-y-auto text-left">

            {/* 1. Header القسم العلوي */}
            <div className="bg-white p-5 rounded-[2rem] border border-gray-200 shadow-sm mb-6 flex justify-between items-center animate-in slide-in-from-top duration-500">
                <div className="flex items-center gap-4">
                    <div className="bg-gray-900 text-white p-3 rounded-2xl shadow-lg">
                        <ShieldCheck className="text-blue-400" size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-gray-900 italic uppercase tracking-tighter leading-none">
                            {title}
                        </h1>
                        <p className="text-blue-600 text-[10px] font-black uppercase tracking-widest mt-1">Points: {points_pool} XP</p>
                    </div>
                </div>

                <div className={cn(
                    "flex flex-col items-center px-8 py-2 rounded-2xl border-2 transition-all",
                    timeLeft <= 10 ? "border-red-500 bg-red-50 animate-pulse scale-110" : "border-gray-100 bg-gray-50"
                )}>
                    <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Time Remaining</div>
                    <div className={cn("text-xl font-black italic flex items-center gap-2", timeLeft <= 10 ? "text-red-600" : "text-gray-900")}>
                        <Clock size={18} />
                        {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </div>
                </div>
            </div>

            {/* 2. Context Box - صندوق المعلومات */}
            <div className="bg-white border-2 border-dashed border-blue-100 rounded-[2.5rem] p-6 mb-8 flex flex-col md:flex-row gap-8 items-center animate-in fade-in duration-700 shadow-sm">
                <div className="flex-1 px-2">
                    <div className="flex items-center gap-2 mb-3">
                        <Info className="text-blue-500" size={18} />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Mission Briefing</span>
                    </div>
                    <p className="text-gray-700 text-sm font-bold leading-relaxed">{scenario?.context}</p>
                </div>
                <div className="w-full md:w-80 bg-gray-50 rounded-3xl p-5 border border-gray-100 shadow-inner">
                    <div className="flex items-center gap-2 mb-3">
                        <Target className="text-emerald-500" size={16} />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Your Tasks</span>
                    </div>
                    <ul className="space-y-2">
                        {scenario?.task?.map((t: string, i: number) => (
                            <li key={i} className="text-[9px] font-black text-gray-600 flex items-start gap-2 uppercase tracking-tight">
                                <div className="w-1 h-1 rounded-full bg-blue-400 mt-1.5 shrink-0" /> {t}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* 3. Inventory Column - قائمة البيانات المتاحة */}
                <div className="lg:col-span-3 space-y-3">
                    <h3 className="text-gray-400 font-black text-[9px] tracking-[0.2em] uppercase px-1">Inventory</h3>
                    <div className="grid grid-cols-1 gap-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {scenario?.dataItems?.map((item: any) => (
                            <div key={item.id} onClick={() => onAddData(item)}
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

                {/* 4. Decision Grid Column - منطقة اتخاذ القرارات */}
                <div className="lg:col-span-9 bg-white rounded-[2.5rem] border border-gray-200 shadow-xl flex flex-col overflow-hidden min-h-[600px]">
                    <div className="bg-gray-900 text-white p-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="text-blue-400" size={20} />
                            <h3 className="text-lg font-black italic uppercase tracking-tight">Decision Grid</h3>
                        </div>
                    </div>

                    {selectedIds.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-300 p-10 text-center">
                            <Lock size={48} className="mb-4 opacity-5" />
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
                                    const item = scenario.dataItems.find((i: any) => i.id === id);
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
                                                <button onClick={() => onUpdateDecision(id, 'necessary', !decisions[id]?.necessary)}
                                                    className={cn("w-full py-2 rounded-lg text-[8px] font-black uppercase border transition-all",
                                                        decisions[id]?.necessary ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100" : "bg-gray-50 border-gray-200 text-gray-400")}>
                                                    {decisions[id]?.necessary ? "Essential" : "Optional"}
                                                </button>
                                            </div>
                                            <div className="col-span-2 px-1">
                                                <select className="w-full bg-white border border-gray-300 p-2 rounded-lg text-[7px] font-black text-gray-900 outline-none"
                                                    value={decisions[id]?.sensitivity} onChange={(e) => onUpdateDecision(id, 'sensitivity', e.target.value)}>
                                                    <option value="normal">NORMAL</option>
                                                    <option value="important">IMPORTANT</option>
                                                    <option value="sensitive">SENSITIVE</option>
                                                </select>
                                            </div>
                                            <div className="col-span-2 px-1">
                                                <select className="w-full bg-white border border-gray-300 p-2 rounded-lg text-[7px] font-black text-gray-900 outline-none"
                                                    value={decisions[id]?.encryption} onChange={(e) => onUpdateDecision(id, 'encryption', e.target.value)}>
                                                    <option value="plain">PLAIN</option>
                                                    <option value="encrypted">ENCRYPTED</option>
                                                    <option value="hashed">HASHED</option>
                                                </select>
                                            </div>
                                            <div className="col-span-2 px-1">
                                                <select className="w-full bg-white border border-gray-300 p-2 rounded-lg text-[7px] font-black text-gray-900 outline-none"
                                                    value={decisions[id]?.accessLevel} onChange={(e) => onUpdateDecision(id, 'accessLevel', e.target.value)}>
                                                    <option value="user">JUST USER</option>
                                                    <option value="admin">ADMIN</option>
                                                    <option value="public">PUBLIC</option>
                                                    <option value="private">PRIVATE</option>
                                                </select>
                                            </div>
                                            <div className="col-span-1 text-right">
                                                <button onClick={() => onRemoveData(id)} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={12} /></button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="p-6 bg-gray-50 border-t border-gray-100">
                                <button onClick={onSubmit} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black italic text-[11px] hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 uppercase tracking-widest leading-none">
                                    Submit Architecture Audit
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 5. Result View - شاشة النتائج */}
            {showResult && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[500] flex items-center justify-center p-4">
                    <div className="bg-[#f8f9fa] rounded-[2.5rem] max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl border-8 border-white animate-in zoom-in duration-300 overflow-hidden relative">
                        <div className="sticky top-0 bg-[#f8f9fa] z-30 px-8 py-5 border-b border-gray-100 flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className={cn("text-5xl font-black italic", result.score >= 70 ? "text-emerald-500" : "text-red-500")}>
                                    {result.score}%
                                </div>
                                <h2 className={cn("text-sm font-black uppercase italic leading-tight", getScoreGrade(result.score).color)}>
                                    {getScoreGrade(result.score).text}
                                </h2>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4 custom-scrollbar font-sans">
                            {result?.details?.map((item: any, idx: number) => (
                                <div key={idx} className={cn("p-5 rounded-2xl border-l-[6px] bg-white transition-all shadow-sm", item.correct ? "border-emerald-500" : "border-red-500")}>
                                    <div className="flex items-start gap-4">
                                        {item.correct ? <CheckCircle2 className="text-emerald-600 mt-1" size={24} /> : <AlertCircle className="text-red-600 mt-1" size={24} />}
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
                            {(!result?.details || result.details.length === 0) && (
                                <div className="text-center py-10 text-gray-400 italic">
                                    Analyzing security architecture...
                                </div>
                            )}
                        </div>

                        <div className="sticky bottom-0 bg-[#f8f9fa] z-30 px-8 py-6 border-t border-gray-100 flex gap-4">
                            {result.score >= 70 ? (
                                <button onClick={() => onFinish({ score: result.score, status: 'Win' })}
                                    className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase shadow-lg shadow-emerald-200 hover:bg-emerald-700 italic transition-all flex items-center justify-center gap-2">
                                    FINISH MISSION <ShieldCheck size={20} />
                                </button>
                            ) : (
                                <div className="flex gap-4 w-full">
                                    <button onClick={onQuit} className="flex-1 bg-white border-2 border-red-100 text-red-400 py-3 rounded-2xl font-black uppercase hover:bg-red-50 flex items-center justify-center gap-2 italic transition-all leading-none">
                                        <LogOut size={16} /> ABORT MISSION
                                    </button>
                                    {retryCount < 3 && (
                                        <button onClick={onReset} className="flex-[2] bg-gray-900 text-white py-4 rounded-2xl font-black uppercase shadow-lg hover:bg-black transition-all flex items-center justify-center gap-2 italic animate-in slide-in-from-right">
                                            <RotateCcw size={16} /> RETRY NEW SCENARIO
                                        </button>
                                    )}
                                </div>
                            )}
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

export default PrivacyAwarenessLayout;