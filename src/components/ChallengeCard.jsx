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
      // تم تعديل الـ padding ليكون p-5 في الجوال و p-8/p-10 في اللابتوب، وتصغير الحواف المستديرة قليلاً للجوال
      className={`relative overflow-hidden rounded-[2rem] md:rounded-[3rem] bg-[#121620]/80 backdrop-blur-md border p-5 md:p-10 flex flex-col justify-between min-h-[320px] md:min-h-[350px] transition-all duration-500 shadow-2xl 
      ${
        isLockedOut && !isMyChallenge
          ? "opacity-75 grayscale-[0.3] border-gray-800"
          : "hover:scale-[1.02] border-gray-800/50 hover:border-emerald-500/30 group"
      }`}
    >
      {/* --- القسم العلوي للكرت --- */}
      <div className="z-20 relative flex-1">
        <div className="flex justify-between items-start mb-4 md:mb-6">
          {/* تصغير أيقونة اللعبة قليلاً في الجوال لترك مساحة */}
          <div className="p-2.5 md:p-3 bg-white/5 rounded-xl md:rounded-2xl shrink-0">
             {React.cloneElement(icon, { size: 20, className: "md:w-6 md:h-6" })}
          </div>
          
          <div className="flex flex-col items-end gap-1.5 md:gap-2">
            <div className="bg-yellow-500/10 border border-yellow-500/20 px-3 md:px-4 py-1 md:py-1.5 rounded-lg md:rounded-xl">
              <span className="text-[10px] md:text-xs font-black text-yellow-500 tracking-wider italic uppercase">
                {points} XP
              </span>
            </div>

            {status === "Pending" ? (
              <span className="text-[8px] md:text-[10px] text-cyan-400 font-bold flex items-center gap-1 uppercase tracking-tighter italic bg-cyan-500/5 px-2 py-0.5 rounded-lg border border-cyan-500/10">
                <Calendar size={10} className="md:w-3 md:h-3" /> {formatShortDate(scheduledDate)}
              </span>
            ) : (
              <span className="text-[9px] md:text-[10px] text-gray-500 font-bold flex items-center gap-1 uppercase tracking-tighter italic">
                <Clock size={10} className="md:w-3 md:h-3" /> {timeLimit ? `${timeLimit}s` : "5m"}
              </span>
            )}
          </div>
        </div>

        {/* تصغير حجم خط العنوان في الجوال لكي لا يغطي الكرت */}
        <h3 className="text-lg md:text-2xl font-black text-white uppercase italic leading-tight mb-2 md:mb-4 tracking-tighter line-clamp-2">
          {title}
        </h3>

        <p className="text-gray-400 text-xs md:text-sm font-medium leading-relaxed max-w-full md:max-w-[90%] line-clamp-2 md:line-clamp-3">
          {description}
        </p>
      </div>

      {/* --- القسم السفلي للكرت --- */}
      <div className="z-30 relative flex flex-col gap-4 md:gap-6 mt-4 md:mt-6 w-full">
        
        {/* صف الأزرار (اللعب + التعديل والحذف) */}
        <div className="flex items-center justify-between w-full gap-2">
          <div className="flex items-center gap-2 md:gap-3">
            {isMyChallenge ? (
              <div className="px-3 md:px-5 py-2 md:py-2.5 rounded-full font-black text-[8px] md:text-[10px] uppercase tracking-widest flex items-center gap-1.5 bg-gray-800 text-gray-500 border border-gray-700 opacity-60">
                <ShieldCheck size={12} className="md:w-3.5 md:h-3.5" /> <span className="hidden xs:inline">Your Mission</span>
              </div>
            ) : userPlayStatus === "Completed" ? (
              <div className="px-3 md:px-5 py-2 md:py-2.5 rounded-full font-black text-[8px] md:text-[10px] uppercase tracking-widest flex items-center gap-1.5 bg-emerald-500/5 border border-emerald-500/20 text-emerald-500 shadow-[inset_0_0_12px_rgba(16,185,129,0.05)]">
                <ShieldCheck size={12} className="md:w-3.5 md:h-3.5" /> <span className="hidden xs:inline">Secured</span>
              </div>
            ) : userPlayStatus === "Locked" ? (
              <div className="px-3 md:px-5 py-2 md:py-2.5 rounded-full font-black text-[8px] md:text-[10px] uppercase tracking-widest flex items-center gap-1.5 bg-red-500/5 border border-red-500/20 text-red-500 shadow-[inset_0_0_12px_rgba(239,68,68,0.05)]">
                <Lock size={12} className="md:w-3.5 md:h-3.5" /> <span className="hidden xs:inline">Locked</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 md:gap-3">
                <button
                  onClick={onAccept}
                  className="px-4 md:px-6 py-2 md:py-2.5 rounded-full font-black text-[9px] md:text-[10px] uppercase tracking-widest flex items-center gap-1.5 transition-all active:scale-95 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/20"
                >
                  <Play size={10} fill="currentColor" className="md:w-3 md:h-3" /> Accept
                </button>

                {userPlayStatus === "Playing" && (
                  <span className="flex items-center gap-1 text-[8px] md:text-[10px] font-bold text-red-400 uppercase animate-pulse">
                    <Heart size={10} fill="currentColor" className="md:w-3 md:h-3" /> {attemptsLeft}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* الجانب الأيمن: أزرار التعديل والحذف - جعل حجمهم متناسق للجوال */}
          {isMyChallenge && status === "Pending" && (
            <div className="flex gap-1.5 md:gap-2 items-center">
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                className="p-2 md:p-2.5 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded-lg md:rounded-xl hover:bg-blue-600 hover:text-white transition-all"
              >
                <Pen size={12} className="md:w-3.5 md:h-3.5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="p-2 md:p-2.5 bg-red-600/10 border border-red-500/20 text-red-400 rounded-lg md:rounded-xl hover:bg-red-600 hover:text-white transition-all"
              >
                <Trash2 size={12} className="md:w-3.5 md:h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* صف التذييل (الكريتور + التعليقات + حالة النشر) */}
        <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-gray-800/50 w-full">
          {/* الكريتور */}
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-5 h-5 md:w-6 md:h-6 rounded-full overflow-hidden border border-gray-700 shrink-0">
              <img src={avatar || "/Avatar.png"} className="w-full h-full object-cover" alt="creator" />
            </div>
            <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] text-[#8a96a3] italic truncate max-w-[60px] md:max-w-none">
              {creator}
            </span>
          </div>

          {/* التعليقات وحالة النشر */}
          <div className="flex items-center gap-2 md:gap-3">
            {isMyChallenge && (
              <span className={`text-[7px] md:text-[9px] font-black uppercase px-2 py-0.5 md:py-1 rounded-md ${
                  status === "Published" ? "text-emerald-500 bg-emerald-500/5 border border-emerald-500/10" : "text-yellow-500 bg-yellow-500/5 border border-yellow-500/10"
              }`}>
                {status}
              </span>
            )}

            <button onClick={onComment} className="relative p-2 md:p-2.5 bg-white/5 rounded-lg md:rounded-xl text-gray-400 hover:text-white transition-all group/comm">
              <MessageCircle size={12} className="md:w-3.5 md:h-3.5 group-hover/comm:scale-110 transition-transform" />
              {commentsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-500 text-[7px] md:text-[9px] text-black font-black w-3.5 h-3.5 md:w-4 md:h-4 rounded-full flex items-center justify-center border border-[#121620]">
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