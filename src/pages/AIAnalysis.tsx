import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft, Trophy, Zap, AlertTriangle, Lightbulb, Loader2, BrainCircuit, ChevronDown, ChevronUp
} from 'lucide-react';
import MainLayout from '../components/MainLayout';
import { BASE_URL } from '../api/auth.js';

const AIAnalysis = () => {
  const navigate = useNavigate();

  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [isLocked, setIsLocked] = useState(false);
  const [neededMatches, setNeededMatches] = useState(0);

  useEffect(() => {
    const fetchAIAnalysis = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const userRes = await axios.get(`${BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const res = await axios.get(
          `${BASE_URL}/dashboard/ai-analysis/${userRes.data._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("AI RESPONSE:", res.data);

        if (res.data.isLocked) {
          setIsLocked(true);
          setNeededMatches(res.data.neededMatches);
          setAnalysis({}); 
          return;
        }

        setAnalysis(res.data);

      } catch (err) {
        console.error("AI Analysis Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAIAnalysis();
  }, []);

  if (loading) return (
    <MainLayout activePage="dashboard">
      <div className="flex justify-center items-center h-[600px]">
        <Loader2 className="animate-spin text-purple-500" size={50} />
      </div>
    </MainLayout>
  );

  const completed = 15 - neededMatches;

  return (
    <MainLayout activePage="dashboard">

      <div className="w-full max-w-[1400px] mx-auto flex flex-col flex-1 pb-10 px-4 md:px-6 lg:px-4">

        {/* HEADER */}
        <div className="flex items-center gap-4 md:gap-6 mb-6 md:mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 md:p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-gray-400 hover:text-white transition-all group"
          >
            <ArrowLeft size={20} className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-1 transition-transform" />
          </button>

          <div className="flex items-center gap-2 md:gap-3">
            <BrainCircuit className="text-purple-400 w-6 h-6 md:w-8 md:h-8" />
            <h1 className="text-lg md:text-3xl font-black tracking-widest text-white uppercase italic mt-1 md:mt-0">
              AI Performance
            </h1>
          </div>
        </div>

        {/* CONTENT */}
        <div className="relative">

          {/* الخلفية (الكروت) */}
          <div className={`transition-all duration-500 ${isLocked ? "opacity-30 blur-[2px] md:blur-[4px] pointer-events-none" : "opacity-100"}`}>
            {/* تقليل المسافات بين الكروت في الجوال */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 items-start">

              <Card title="Achievements" icon={<Trophy className="text-yellow-500 w-6 h-6 md:w-8 md:h-8" />}>
                {analysis?.achievements?.length > 0 ? (
                  analysis.achievements.map((item: string, i: number) => (
                    <ExpandableItem key={i} text={item} />
                  ))
                ) : <li className="text-gray-400 text-sm">No data yet</li>}
              </Card>

              <Card title="Strengths" icon={<Zap className="text-cyan-400 w-6 h-6 md:w-8 md:h-8" />}>
                {analysis?.strengths?.length > 0 ? (
                  analysis.strengths.map((item: string, i: number) => (
                    <ExpandableItem key={i} text={item} />
                  ))
                ) : <li className="text-gray-400 text-sm">No data yet</li>}
              </Card>

              <Card title="Weaknesses" icon={<AlertTriangle className="text-orange-500 w-6 h-6 md:w-8 md:h-8" />}>
                {analysis?.weaknesses?.length > 0 ? (
                  analysis.weaknesses.map((item: string, i: number) => (
                    <ExpandableItem key={i} text={item} />
                  ))
                ) : <li className="text-gray-400 text-sm">No data yet</li>}
              </Card>

              <Card title="Recommendations" icon={<Lightbulb className="text-purple-400 w-6 h-6 md:w-8 md:h-8" />}>
                {/* 1. التوصيات العادية */}
                {analysis?.recommendations?.length > 0 ? (
                  analysis.recommendations.map((item: string, i: number) => (
                    <ExpandableItem key={`rec-${i}`} text={item} />
                  ))
                ) : <div className="text-gray-400 text-sm">No data yet</div>}

                {/* 2. مسارات التعلم المقترحة */}
                {analysis?.suggestedLearning?.length > 0 && (
                  <div className="mt-4 pt-4 md:mt-5 md:pt-5 border-t border-white/10">
                    <h3 className="text-[10px] md:text-xs font-bold text-purple-300 uppercase tracking-widest mb-3 md:mb-4 flex items-center gap-2">
                      <Zap size={14} className="w-3 h-3 md:w-4 md:h-4" /> Suggested Learning Paths
                    </h3>
                    <div className="space-y-2 md:space-y-3 flex flex-col">
                      {analysis.suggestedLearning.map((item: string, i: number) => (
                        <ExpandableItem key={`learn-${i}`} text={item} />
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>

          {/* 🔒 LOCK BOX بالنص */}
          {isLocked && (
            <div className="absolute inset-0 flex items-center justify-center z-20 px-4 mt-10 md:mt-0 items-start md:items-center">

              {/* 🔥 السحر هنا: حولنا w-[650px] إلى w-full max-w-[650px] عشان ما يكسر الشاشة 🔥 */}
              <div className="w-full max-w-[650px] rounded-3xl md:rounded-[2.5rem] bg-[#121620]/95 md:bg-[#121620]/80 backdrop-blur-xl border border-purple-500/20 shadow-[0_20px_80px_rgba(0,0,0,0.8)] p-6 md:p-10 text-center animate-in fade-in zoom-in duration-500">

                {/* Progress dots */}
                <div className="flex justify-center gap-1.5 md:gap-2 mb-4 md:mb-6">
                  {[1, 2, 3, 4, 5].map((_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${i < Math.ceil(completed / 3) ? 'bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.8)]' : 'bg-white/10'
                        }`}
                    />
                  ))}
                </div>

                {/* Icon */}
                <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 md:mb-6 rounded-full border border-purple-500/30 bg-purple-500/10 flex items-center justify-center">
                  <BrainCircuit className="text-purple-400 w-6 h-6 md:w-8 md:h-8" />
                </div>

                {/* Title */}
                <h2 className="text-xl md:text-2xl font-black text-white italic tracking-tight mb-3 md:mb-4">
                  AI SYSTEM LOCKED
                </h2>

                {/* Text */}
                <p className="text-gray-300 text-xs md:text-sm leading-relaxed mb-6">
                  To unlock your AI performance analysis, you must complete at least <span className="text-purple-400 font-bold">15 matches</span>.<br className="hidden md:block"/>
                  Our system needs enough gameplay data to understand your playstyle.
                </p>

                {/* Progress bar */}
                <div className="w-full bg-white/10 rounded-full h-1.5 md:h-2 mb-2 md:mb-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-700"
                    style={{ width: `${(completed / 15) * 100}%` }}
                  />
                </div>

                <p className="text-[10px] md:text-xs text-gray-400 mb-6 md:mb-8 font-mono">
                  {completed} / 15 MATCHES COMPLETED
                </p>

                {/* Buttons: بالطول في الجوال، وبالعرض في اللابتوب */}
                <div className="flex flex-col-reverse sm:flex-row justify-center gap-3 md:gap-4">
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="w-full sm:w-auto px-6 py-3 md:py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition font-bold text-sm"
                  >
                    RETURN
                  </button>

                  <button
                    onClick={() => navigate('/games')}
                    className="w-full sm:w-auto px-6 py-3 md:py-2 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 transition shadow-[0_0_15px_rgba(147,51,234,0.4)] text-sm"
                  >
                    START PLAYING
                  </button>
                </div>

              </div>
            </div>
          )}
        </div>
        
        {!isLocked && analysis && (
          <div className="mt-8 md:mt-10 flex flex-col gap-4 md:gap-6 animate-in fade-in zoom-in duration-700">

            {/* 1. النص الاستخباراتي الشامل (Overall Insight) */}
            {analysis.overallInsight && (
              <div className="p-5 md:p-8 bg-purple-500/10 border border-purple-500/20 rounded-3xl md:rounded-[2rem] backdrop-blur-md relative overflow-hidden group">
                <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4 relative z-10">
                  <BrainCircuit className="text-purple-400 w-5 h-5 md:w-6 md:h-6" />
                  <h3 className="font-black italic text-purple-400 uppercase tracking-[0.1em] md:tracking-[0.2em] text-sm md:text-base">AI Mentor Insight</h3>
                </div>
                <p className="text-gray-200 leading-relaxed text-sm md:text-lg relative z-10 italic">
                  "{analysis.overallInsight}"
                </p>
                <div className="mt-4 md:mt-6 flex flex-wrap gap-2 md:gap-3 relative z-10">
                  <span className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-white/5 px-3 py-1.5 md:py-1 rounded-full border border-white/10">
                    Profile: {analysis.playerType}
                  </span>
                  <span className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-white/5 px-3 py-1.5 md:py-1 rounded-full border border-white/10">
                    Status: {analysis.riskProfile}
                  </span>
                </div>
              </div>
            )}

            {/* 2. شريط تحديث الذكاء الاصطناعي (Next Analysis In) */}
            {analysis.nextAnalysisIn !== undefined && (
              <div className="p-5 md:p-6 bg-[#121620]/80 border border-blue-500/20 rounded-3xl md:rounded-[2rem] flex flex-col items-center justify-center text-center">
                <p className="text-blue-400 font-bold italic uppercase tracking-widest text-xs md:text-sm mb-3">
                  Next Intelligence Update In: <span className="text-white text-lg md:text-xl mx-1">{analysis.nextAnalysisIn}</span> Encounters
                </p>
                <div className="w-full max-w-md h-1.5 md:h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-1000"
                    style={{ width: `${((5 - analysis.nextAnalysisIn) / 5) * 100}%` }}
                  />
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </MainLayout>
  );
};

// 🎯 Expandable Item Component
const ExpandableItem = ({ text }: { text: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  const [rawTitle, ...descParts] = text.split(':');
  const rawDescription = descParts.join(':').trim();

  const title = rawTitle ? rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1).toLowerCase() : "";
  const description = rawDescription ? rawDescription.charAt(0).toUpperCase() + rawDescription.slice(1).toLowerCase() : "";

  return (
    <div
      className="bg-white/5 rounded-xl p-3 md:p-4 cursor-pointer hover:bg-white/10 transition-all border border-white/10"
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className="flex justify-between items-center gap-2">
        <span className="font-semibold text-white text-[13px] md:text-sm leading-tight pr-2">{title}</span>
        {description && (
          isOpen ? <ChevronUp className="text-purple-400 shrink-0 w-4 h-4 md:w-5 md:h-5" /> : <ChevronDown className="text-purple-400 shrink-0 w-4 h-4 md:w-5 md:h-5" />
        )}
      </div>

      {isOpen && description && (
        <div className="mt-3 text-gray-300 text-[12px] md:text-sm leading-relaxed border-t border-white/10 pt-3 normal-case">
          {description}
        </div>
      )}
    </div>
  );
};

// 🎯 Card Component 
const Card = ({ title, icon, children }: any) => {
  return (
    <div className="relative rounded-3xl md:rounded-[2rem] p-[1.5px] bg-gradient-to-br from-white/10 to-white/5 shadow-lg h-full">
      <div className="bg-[#0a0f1c] rounded-[calc(1.5rem-1.5px)] md:rounded-[calc(2rem-1.5px)] p-5 md:p-8 h-full">
        <div className="flex justify-between items-start mb-5 md:mb-6">
          <h2 className="text-lg md:text-2xl font-black italic text-white uppercase pr-2">{title}</h2>
          {icon}
        </div>
        <div className="space-y-2 md:space-y-3 flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AIAnalysis;