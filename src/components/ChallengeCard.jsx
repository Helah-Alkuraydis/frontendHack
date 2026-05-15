import React from "react";
import {
  Play,
  Clock,
  ShieldCheck,
  Pen,
  Lock,
  Heart,
  MessageCircle,
  Trash2,
  Calendar,
} from "lucide-react";

const ChallengeCard = ({
  title,
  description,
  updatedAt,
  points,
  creator,
  avatar,
  icon,
  isMyChallenge,
  status,
  timeLimit,
  onEdit,
  onDelete,
  onComment,
  onAccept,
  commentsCount,
  userPlayStatus,
  attemptsLeft,
  scheduledDate,
}) => {
  const isLockedOut = userPlayStatus === "Locked" || userPlayStatus === "Completed";

  const formatShortDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
    });
  };
  return (
    <div
      // 💡 إذا مقفل، نخليه باهت شوي عشان نوضح للاعب إنه ما يقدر يلعبه
      className={`relative overflow-hidden rounded-[3rem] bg-[#121620]/80 backdrop-blur-md border p-10 flex flex-col justify-between min-h-[350px] transition-all duration-500 shadow-2xl 
      ${
        isLockedOut && !isMyChallenge
          ? "opacity-75 grayscale-[0.3] border-gray-800"
          : "hover:scale-[1.02] border-gray-800/50 hover:border-emerald-500/30 group"
      }`}
    >
      {/* --- القسم العلوي للكرت --- */}
      <div className="z-20 relative flex-1">
        <div className="flex justify-between items-start mb-6">
          <div className="p-3 bg-white/5 rounded-2xl">{icon}</div>
          <div className="flex flex-col items-end gap-2">
            <div className="bg-yellow-500/10 border border-yellow-500/20 px-4 py-1.5 rounded-xl">
              <span className="text-xs font-black text-yellow-500 tracking-wider italic uppercase">
                {points} XP
              </span>
            </div>

            {status === "Pending" ? (
              <span className="text-[10px] text-cyan-400 font-bold flex items-center gap-1 uppercase tracking-tighter italic bg-cyan-500/5 px-2 py-1 rounded-lg border border-cyan-500/10">
                <Calendar size={12} /> Releasing: {formatShortDate(scheduledDate)}
              </span>
            ) : (
              <span className="text-[10px] text-gray-500 font-bold flex items-center gap-1 uppercase tracking-tighter italic">
                <Clock size={12} /> {timeLimit ? `${timeLimit}s` : "5m"}
              </span>
            )}

          </div>
        </div>

        <h3 className="text-2xl font-black text-white uppercase italic leading-tight mb-4 tracking-tighter">
          {title}
        </h3>

        <p className="text-gray-400 text-sm font-medium leading-relaxed max-w-[90%] line-clamp-3">
          {description}
        </p>
      </div>

      {/* --- القسم السفلي للكرت --- */}
      <div className="z-30 relative flex flex-col gap-6 mt-6 w-full">
        
        {/* 1️⃣ صف الأزرار (اللعب + التعديل والحذف) */}
        <div className="flex items-center justify-between w-full">
          {/* الجانب الأيسر: زر اللعب أو الحالة */}
          <div className="flex items-center gap-3">
            {isMyChallenge ? (
              <button
                disabled
                className="px-5 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center gap-2 bg-gray-800 text-gray-500 border border-gray-700 opacity-60 cursor-not-allowed"
              >
                <ShieldCheck size={14} /> Your Mission
              </button>
            ) : status === "Completed" ? (
              <div className="px-5 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center gap-2 bg-emerald-500/5 border border-emerald-500/20 text-emerald-500 cursor-not-allowed shadow-[inset_0_0_12px_rgba(16,185,129,0.05)]">
                <ShieldCheck size={14} /> Mission Secured
              </div>
            ) : userPlayStatus === "Locked" ? (
              <div className="px-5 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center gap-2 bg-red-500/5 border border-red-500/20 text-red-500 cursor-not-allowed shadow-[inset_0_0_12px_rgba(239,68,68,0.05)]">
                <Lock size={14} /> System Locked
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={onAccept}
                  className="px-6 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/20"
                >
                  <Play size={12} fill="currentColor" /> Accept
                </button>

                {/* {userPlayStatus === "Playing" && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-red-400 uppercase tracking-widest animate-pulse">
                    <Heart size={12} fill="currentColor" /> {attemptsLeft} Left
                  </span>
                )} */}
              </div>
            )}
          </div>

          {/* الجانب الأيمن: أزرار التعديل والحذف (تظهر للكريتور فقط وفي نفس السطر) */}
          {isMyChallenge && status === "Pending" && (
            <div className="flex gap-2 items-center animate-in fade-in slide-in-from-right-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="p-2.5 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all group"
              >
                <Pen size={14} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-2.5 bg-red-600/10 border border-red-500/20 text-red-400 rounded-xl hover:bg-red-600 hover:text-white transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>

        {/* 2️⃣ صف التذييل (الكريتور + التعليقات + حالة النشر) */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-800/50 w-full">
          {/* الكريتور */}
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full overflow-hidden border border-gray-700">
              <img
                src={avatar || "/Avatar.png"}
                className="w-full h-full object-cover"
                alt="creator"
              />
            </div>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#8a96a3] italic">
              {creator}
            </span>
          </div>

          {/* التعليقات وحالة النشر (مرتبة جنب بعض يمين) */}
          <div className="flex items-center gap-3">
            {isMyChallenge && (
              <span
                className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-md ${
                  status === "Published"
                    ? "text-emerald-500 bg-emerald-500/5 border border-emerald-500/10"
                    : "text-yellow-500 bg-yellow-500/5 border border-yellow-500/10"
                }`}
              >
                {status}
              </span>
            )}

            <button
              onClick={onComment}
              className="relative p-2.5 bg-white/5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all group/comm"
            >
              <MessageCircle
                size={14}
                className="group-hover/comm:scale-110 transition-transform"
              />
              {commentsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-[9px] text-black font-black w-4 h-4 rounded-full flex items-center justify-center border border-[#121620]">
                  {commentsCount}
                </span>
              )}
            </button>
          </div>
        </div>

      </div>

      <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10"></div>
    </div>
  );
};

export default ChallengeCard;