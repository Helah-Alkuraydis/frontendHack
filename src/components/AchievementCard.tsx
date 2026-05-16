import React from "react";
import { Lock } from "lucide-react";

interface AchievementCardProps {
  title: string;
  description: string;
  isLocked?: boolean;
  image?: string;
}

const AchievementCard: React.FC<AchievementCardProps> = ({
  title,
  description,
  isLocked = false,
  image,
}) => {
  return (
    <div className="relative h-full">

      {/* ===== الإطار المتدرج ===== */}
      <div className="relative rounded-[1.5rem] lg:rounded-[48px] p-[1.5px] lg:p-[2px] h-full
                      bg-gradient-to-br
                      from-cyan-400
                      via-blue-500
                      to-purple-500">

        {/* ===== الداخل ===== */}
        <div
          className={`
            relative h-full
            rounded-[calc(1.5rem-1.5px)] lg:rounded-[46px]
            min-h-[160px] lg:min-h-[420px]
            flex flex-col justify-center text-center
            px-2 py-4 lg:px-10 lg:py-10
            overflow-hidden
            ${
              isLocked
                ? "bg-[#0b1020]/95 backdrop-blur-3xl"
                : "bg-[#0d111a]/90 backdrop-blur-xl transition-all duration-500 hover:scale-[1.02]"
            }
          `}
        >

          {/* ===== المقفل ===== */}
          {isLocked && (
            <>
              <div className="absolute inset-0 flex items-center justify-center opacity-10">
                <img
                  src="/achievement.png"
                  alt=""
                  className="w-20 h-20 lg:w-56 lg:h-56 object-contain"
                />
              </div>

              <div className="absolute inset-0 opacity-20 pointer-events-none
                              bg-[radial-gradient(white_1px,transparent_1px)]
                              [background-size:15px_15px] lg:[background-size:40px_40px]" />

              <div className="absolute top-3 right-3 lg:top-6 lg:right-6 z-20">
                <Lock className="w-3 h-3 lg:w-5 lg:h-5 text-white/70" />
              </div>
            </>
          )}

          {/* ===== المفتوح ===== */}
          {!isLocked && (
            <div className="flex flex-col items-center">
              <div className="relative mb-2 lg:mb-6">
                <div className="w-14 h-14 lg:w-40 lg:h-40 transition-all duration-700 hover:scale-110">
                  <img
                    src={image || "/achievement.png"} 
                    alt={title}
                    className="w-full h-full object-contain"
                  />
                </div>

                <img
                  src="/lightiningup.png"
                  className="absolute -top-3 -right-3 lg:-top-6 lg:-right-8 w-10 h-10 lg:w-24 lg:h-24 object-contain animate-pulse pointer-events-none"
                  alt="spark"
                />

                <img
                  src="/lightiningdone.png"
                  className="absolute -bottom-3 -left-3 lg:-bottom-6 lg:-left-8 w-10 h-10 lg:w-24 lg:h-24 object-contain animate-pulse pointer-events-none"
                  alt="spark"
                />
              </div>
            </div>
          )}

          {/* النص */}
          <div className="relative z-10 space-y-1.5 lg:space-y-4 px-1 lg:px-0">
            {/* 🔥 التعديل هنا: كبرنا العنوان إلى 14px بالجوال 🔥 */}
            <h3 className="text-[14px] lg:text-2xl font-bold text-white leading-tight">
              {title}
            </h3>

            {/* 🔥 التعديل هنا: كبرنا الوصف إلى 11px ووسعنا المساحة (max-w-[160px]) 🔥 */}
            <p className="text-gray-400 text-[11px] lg:text-sm leading-snug lg:leading-relaxed max-w-[160px] lg:max-w-[240px] mx-auto line-clamp-3 lg:line-clamp-none">
              {description}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AchievementCard;