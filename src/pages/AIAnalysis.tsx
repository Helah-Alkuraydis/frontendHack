import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft, Trophy, Zap, AlertTriangle, Lightbulb, Loader2, BrainCircuit, ChevronDown, ChevronUp
} from 'lucide-react';
import MainLayout from '../components/MainLayout';

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

        const userRes = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const res = await axios.get(
          `http://localhost:5000/api/dashboard/ai-analysis/${userRes.data._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("AI RESPONSE:", res.data);

        if (res.data.isLocked) {
          setIsLocked(true);
          setNeededMatches(res.data.neededMatches);
          setAnalysis({}); // عشان الكروت تظهر
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

      <div className="w-full max-w-[1400px] mx-auto flex flex-col flex-1 pb-10 px-4">

        {/* HEADER */}
        <div className="flex items-center gap-6 mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-gray-400 hover:text-white"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="flex items-center gap-3">
            <BrainCircuit className="text-purple-400" size={32} />
            <h1 className="text-3xl font-black tracking-widest text-white uppercase italic">
              AI Performance Analysis
            </h1>
          </div>
        </div>

        {/* CONTENT */}
        <div className="relative">

          {/* الخلفية (الكروت) */}
          <div className={`transition-all duration-500 ${isLocked ? "opacity-30 blur-[2px]" : "opacity-100"}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

              <Card title="Achievements" icon={<Trophy className="text-yellow-500" size={32} />}>
                {analysis?.achievements?.length > 0 ? (
                  analysis.achievements.map((item: string, i: number) => (
                    <ExpandableItem key={i} text={item} />
                  ))
                ) : <li className="text-gray-400">No data yet</li>}
              </Card>

              <Card title="Strengths" icon={<Zap className="text-cyan-400" size={32} />}>
                {analysis?.strengths?.length > 0 ? (
                  analysis.strengths.map((item: string, i: number) => (
                    <ExpandableItem key={i} text={item} />
                  ))
                ) : <li className="text-gray-400">No data yet</li>}
              </Card>

              <Card title="Weaknesses" icon={<AlertTriangle className="text-orange-500" size={32} />}>
                {analysis?.weaknesses?.length > 0 ? (
                  analysis.weaknesses.map((item: string, i: number) => (
                    <ExpandableItem key={i} text={item} />
                  ))
                ) : <li className="text-gray-400">No data yet</li>}
              </Card>

              <Card title="Recommendations & Learning" icon={<Lightbulb className="text-purple-400" size={32} />}>
                {/* 1. التوصيات العادية */}
                {analysis?.recommendations?.length > 0 ? (
                  analysis.recommendations.map((item: string, i: number) => (
                    <ExpandableItem key={`rec-${i}`} text={item} />
                  ))
                ) : <div className="text-gray-400">No data yet</div>}

                {/* 2. مسارات التعلم المقترحة */}
                {analysis?.suggestedLearning?.length > 0 && (
                  <div className="mt-5 pt-5 border-t border-white/10">
                    <h3 className="text-xs font-bold text-purple-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Zap size={14} /> Suggested Learning Paths
                    </h3>
                    <div className="space-y-3 flex flex-col">
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
            <div className="absolute inset-0 flex items-center justify-center z-20">

              <div className="w-[650px] rounded-[2.5rem] bg-[#121620]/80 backdrop-blur-xl border border-purple-500/20 shadow-[0_20px_80px_rgba(0,0,0,0.6)] p-10 text-center animate-in fade-in zoom-in duration-500">

                {/* Progress dots */}
                <div className="flex justify-center gap-2 mb-6">
                  {[1, 2, 3, 4, 5].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${i < Math.ceil(completed / 3) ? 'bg-purple-400' : 'bg-white/10'
                        }`}
                    />
                  ))}
                </div>

                {/* Icon */}
                <div className="w-16 h-16 mx-auto mb-6 rounded-full border border-purple-500/30 bg-purple-500/10 flex items-center justify-center">
                  <BrainCircuit className="text-purple-400" size={32} />
                </div>

                {/* Title */}
                <h2 className="text-2xl font-black text-white italic tracking-tight mb-4">
                  AI SYSTEM LOCKED
                </h2>

                {/* 🔥 النص */}
                <p className="text-gray-300 text-sm leading-relaxed mb-6">
                  To unlock your AI performance analysis, you must complete at least <span className="text-purple-400 font-bold">15 matches</span>.<br />
                  Our system needs enough gameplay data to understand your strengths, weaknesses, and playstyle.
                </p>

                {/* Progress bar */}
                <div className="w-full bg-white/10 rounded-full h-2 mb-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-700"
                    style={{ width: `${(completed / 15) * 100}%` }}
                  />
                </div>

                <p className="text-xs text-gray-400 mb-6">
                  {completed} / 15 Matches Completed
                </p>

                {/* Buttons */}
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="px-6 py-2 rounded-xl bg-white/10 text-gray-300 hover:bg-white/20 transition"
                  >
                    Back
                  </button>

                  <button
                    onClick={() => navigate('/games')}
                    className="px-6 py-2 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 transition"
                  >
                    Start Playing
                  </button>
                </div>

              </div>
            </div>
          )}
        </div>
        {!isLocked && analysis && (
          <div className="mt-10 flex flex-col gap-6 animate-in fade-in zoom-in duration-700">

            {/* 1. النص الاستخباراتي الشامل (Overall Insight) */}
            {analysis.overallInsight && (
              <div className="p-8 bg-purple-500/10 border border-purple-500/20 rounded-[2rem] backdrop-blur-md relative overflow-hidden group">
                <div className="flex items-center gap-4 mb-4 relative z-10">
                  <BrainCircuit className="text-purple-400" size={24} />
                  <h3 className="font-black italic text-purple-400 uppercase tracking-[0.2em]">AI Mentor Insight</h3>
                </div>
                <p className="text-gray-200 leading-relaxed text-lg relative z-10">
                  "{analysis.overallInsight}"
                </p>
                <div className="mt-4 flex gap-3 relative z-10">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/10">
                    Profile: {analysis.playerType}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/10">
                    Status: {analysis.riskProfile}
                  </span>
                </div>
              </div>
            )}

            {/* 2. شريط تحديث الذكاء الاصطناعي (Next Analysis In) */}
            {analysis.nextAnalysisIn !== undefined && (
              <div className="p-6 bg-[#121620]/80 border border-blue-500/20 rounded-[2rem] flex flex-col items-center justify-center">
                <p className="text-blue-400 font-bold italic uppercase tracking-widest text-sm mb-3">
                  Next Intelligence Update In: <span className="text-white text-xl mx-1">{analysis.nextAnalysisIn}</span> Encounters
                </p>
                <div className="w-full max-w-md h-2 bg-white/10 rounded-full overflow-hidden">
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

  // فصل النص لعنوان وتفاصيل بناءً على النقطتين الرأسيتين
  const [rawTitle, ...descParts] = text.split(':');
  const rawDescription = descParts.join(':').trim();

  // تنسيق الأحرف عشان ما تكون صراخ
  const title = rawTitle ? rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1).toLowerCase() : "";
  const description = rawDescription ? rawDescription.charAt(0).toUpperCase() + rawDescription.slice(1).toLowerCase() : "";

  return (
    <div
      className="bg-white/5 rounded-xl p-4 cursor-pointer hover:bg-white/10 transition-all border border-white/10"
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className="flex justify-between items-center gap-2">
        <span className="font-semibold text-white">{title}</span>
        {description && (
          isOpen ? <ChevronUp size={18} className="text-purple-400 shrink-0" /> : <ChevronDown size={18} className="text-purple-400 shrink-0" />
        )}
      </div>

      {isOpen && description && (
        <div className="mt-3 text-gray-300 text-sm leading-relaxed border-t border-white/10 pt-3 normal-case">
          {description}
        </div>
      )}
    </div>
  );
};

// 🎯 Card Component 
const Card = ({ title, icon, children }: any) => {
  return (
    <div className="relative rounded-[2rem] p-[1.5px] bg-gradient-to-br from-white/10 to-white/5 shadow-lg">
      <div className="bg-[#0a0f1c] rounded-[calc(2rem-1.5px)] p-8 h-full">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-black italic text-white uppercase">{title}</h2>
          {icon}
        </div>
        <div className="space-y-3 flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AIAnalysis;