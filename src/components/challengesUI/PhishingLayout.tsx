import React from 'react';
import {
    Trash2, ShieldCheck, Mail, Archive, CornerUpLeft,
    MoreVertical, Star, ChevronDown, Lock, OctagonAlert,
    Zap, Timer, Heart, Lightbulb
} from "lucide-react";
import Swal from 'sweetalert2';

interface PhishingLayoutProps {
    scenario: any;
    userData: any;
    isAnswered: boolean;
    selectedAction: string | null;
    onAction: (actionName: string) => void;
    onLinkCheck: () => void;
    timeLeft: number;
    lives: number;
    initialLevel: number;
    points_pool: number;
}

const PhishingLayout: React.FC<PhishingLayoutProps> = ({
    scenario,
    userData,
    isAnswered,
    selectedAction,
    onAction,
    onLinkCheck,
    timeLeft,
    lives,
    initialLevel,
    points_pool
}) => {

    const getActionIcon = (name: string) => {
        const n = name.toLowerCase();
        if (n.includes('report') || n.includes('phishing')) return <OctagonAlert size={14} />;
        if (n.includes('delete') || n.includes('trash')) return <Trash2 size={14} />;
        if (n.includes('safe') || n.includes('legitimate')) return <ShieldCheck size={14} />;
        return <Zap size={14} />;
    };

    return (
        <div className="flex flex-1 flex-col h-full p-6 z-10">
            {/* <div className="flex justify-center mb-6">
                <div className="flex items-center gap-8 bg-[#1c2438]/60 px-6 py-2 rounded-full border border-white/5 backdrop-blur-xl shadow-xl mx-auto">
                    <div className="flex items-center gap-2 text-yellow-500 font-bold border-r border-white/10 pr-5 text-sm"><Zap size={14} fill="currentColor" /> <span>Points: {points_pool} XP</span></div>
                    <div className="flex items-center gap-3"><Timer size={16} className="text-blue-400" /><span className="text-lg font-mono font-black text-white">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span></div>
                    <div className="flex items-center gap-6 border-l border-white/10 pl-6">
                        <div
                            onClick={() => {
                                const hintText = scenario?.hints?.[0] || "No hints available for this challenge.";

                                Swal.fire({
                                    title: 'STRATEGIC INTEL',
                                    text: hintText,
                                    icon: 'info',
                                    background: '#0a0f1d',
                                    color: '#fff',
                                    confirmButtonColor: '#3b82f6',
                                    customClass: {
                                        popup: 'rounded-[2rem] border border-white/10'
                                    }
                                });
                            }}
                            className="p-2 bg-yellow-400/10 text-yellow-500 rounded-lg cursor-pointer animate-pulse hover:bg-yellow-400/20 transition-all"
                        >
                            <Lightbulb size={16} />
                        </div>               <div className="flex gap-1.5">{[...Array(3)].map((_, i) => <Heart key={i} size={18} fill={i < lives ? "#ef4444" : "none"} color="#ef4444" className={i < lives ? "animate-pulse" : "opacity-10"} />)}</div>
                    </div>
                </div>
            </div> */}

            <div className="w-full max-w-5xl mx-auto bg-white rounded-[1.25rem] overflow-hidden shadow-2xl flex flex-col h-full border border-gray-200 animate-in slide-in-from-bottom-12 duration-700 font-sans text-gray-900">
                <div className="bg-[#f2f6fc] px-8 py-3 border-b border-gray-200 flex justify-between items-center text-gray-400">
                    <div className="flex gap-10"><Archive size={18} /><OctagonAlert size={18} /><Trash2 size={18} /><Mail size={18} /></div>
                    <MoreVertical size={18} className="cursor-pointer" />
                </div>

                <div className="flex flex-1 overflow-hidden">
                    <div className="w-16 bg-[#f8fafc] border-r border-gray-100 flex flex-col items-center py-8 gap-8">
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm"><Mail size={18} /></div>
                        <Star size={16} className="text-gray-300" /><CornerUpLeft size={16} className="text-gray-300" />
                    </div>

                    <div className="flex-1 bg-white p-10 overflow-y-auto flex flex-col">
                        <h2 className="text-[22px] font-normal text-[#202124] mb-6 leading-tight tracking-tight">{scenario.subject}</h2>

                        <div className="flex justify-between items-start mb-8">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-[#1a73e8] flex items-center justify-center text-white font-bold text-lg uppercase shadow-md">
                                    {scenario.sender?.charAt(0)}
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-gray-900 text-[14px]">{scenario.sender}</span>
                                    <div className="text-[11px] text-[#5f6368] mt-1">to {userData?.email || "target@hackhero.com"} <ChevronDown size={11} className="inline-block ml-1" /></div>
                                </div>
                            </div>
                            <span className="text-[10px] text-[#5f6368] font-bold uppercase mt-2">JUST NOW</span>
                        </div>

                        <div className="text-[14px] text-[#202124] leading-[1.6] mb-10 flex-1 whitespace-pre-line">
                            {scenario.body}
                            <div onClick={(e) => { e.stopPropagation(); onLinkCheck(); }} className="mt-8 p-4 bg-[#f8f9fa] border border-[#dadce0] rounded-xl flex items-center gap-4 group cursor-pointer hover:bg-red-50 transition-all shadow-sm max-w-sm">
                                <div className="p-2 bg-white rounded-lg shadow-sm border border-[#dadce0] text-[#1a73e8] group-hover:scale-110 group-hover:text-red-600 transition-all"><Lock size={18} /></div>
                                <div className="flex flex-col gap-0.5 overflow-hidden"><span className="text-[12px] font-medium text-[#202124]">Verify Link</span><span className="text-[10px] text-[#0b57d0] font-mono truncate underline group-hover:text-red-700">{scenario.links?.[0]?.url}</span></div>
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-3 mt-auto pt-4 border-t border-gray-100 w-full overflow-visible pb-3">
                            <div className="flex items-center gap-2 px-4 py-1 bg-blue-50/50 rounded-full border border-blue-100 shadow-sm">
                                <OctagonAlert size={16} className="text-blue-600" />
                                <span className="text-[15px] font-black text-blue-700 uppercase tracking-widest leading-none">Action Required: Choose your response</span>
                                <OctagonAlert size={16} className="text-blue-600" />
                            </div>

                            <div className="flex flex-row flex-wrap items-center gap-2 justify-center w-full overflow-visible px-4">
                                {scenario.actions?.map((act: any, idx: number) => {
                                    let buttonClass = "border-[#dadce0] text-gray-700 hover:border-[#1a73e8] hover:text-[#1a73e8] hover:bg-blue-50 bg-white";


                                    // if (isAnswered) {
                                    //     const isThisCorrect = act === scenario.correctAnswer;
                                    //     const isThisSelected = act === selectedAction;

                                    //     if (isThisCorrect) {
                                    //         buttonClass = "border-green-500 text-green-700 bg-green-50 font-black border-2 scale-105";
                                    //     } else if (isThisSelected) {
                                    //         buttonClass = "border-red-500 text-red-700 bg-red-50 border-2";
                                    //     } else {
                                    //         buttonClass = "border-gray-200 text-gray-400 opacity-50 bg-gray-50";
                                    //     }
                                    // }

                                    if (isAnswered) {
                                        const isThisSelected = act === selectedAction;
                                        const isSelectedCorrect = selectedAction === scenario.correctAnswer;

                                        if (isThisSelected) {
                                            if (isSelectedCorrect) {
                                                buttonClass = "border-green-500 text-green-700 bg-green-50 font-black border-2 scale-105";
                                            } else {
                                                buttonClass = "border-red-500 text-red-700 bg-red-50 border-2";
                                            }
                                        } else {
                                            buttonClass = "border-gray-200 text-gray-400 opacity-50 bg-gray-50";
                                        }
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => onAction(act)}
                                            disabled={isAnswered}
                                            className={`flex items-center justify-center gap-3 px-6 py-4 rounded-4xl border-2 transition-all duration-300 shadow-sm uppercase tracking-tighter active:scale-95 text-[12px] w-[calc(50%-1rem)] min-w-[200px] h-auto leading-tight ${buttonClass}`}
                                        >
                                            <span className="scale-220">{getActionIcon(act)}</span>
                                            <span className="flex-1 text-center">{act}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes glitch { 0% { transform: translate(0,0); } 20% { transform: translate(-5px, 2px); } 40% { transform: translate(5px, -2px); } 60% { transform: translate(-5px, -2px); } 80% { transform: translate(5px, 2px); } 100% { transform: translate(0,0); } }
        .glitch-effect { animation: glitch 0.15s linear infinite; }
      `}</style>
        </div>
    );
};

export default PhishingLayout;