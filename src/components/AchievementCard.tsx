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
    <div className="relative">

      {/* ===== الإطار المتدرج ===== */}
      <div className="relative rounded-[48px] p-[2px]
                      bg-gradient-to-br
                      from-cyan-400
                      via-blue-500
                      to-purple-500">

        {/* ===== الداخل ===== */}
        <div
          className={`
            relative
            rounded-[46px]
            min-h-[420px]
            flex flex-col justify-center text-center
            px-10 py-10
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
                  className="w-56 h-56 object-contain"
                />
              </div>

              <div className="absolute inset-0 opacity-20 pointer-events-none
                              bg-[radial-gradient(white_1px,transparent_1px)]
                              [background-size:40px_40px]" />

              <div className="absolute top-6 right-6 z-20">
                <Lock size={20} className="text-white/70" />
              </div>
            </>
          )}

          {/* ===== المفتوح ===== */}
          {!isLocked && (
            <div className="flex flex-col items-center">
              <div className="relative mb-6">
                <div className="w-40 h-40 transition-all duration-700 hover:scale-110">
                  <img
            src={image || "/achievement.png"} 
              alt={title}
              className="w-full h-full object-contain"
                  />
                </div>

                <img
                  src="/lightiningup.png"
                  className="absolute -top-6 -right-8 w-24 h-24 object-contain animate-pulse pointer-events-none"
                />

                <img
                  src="/lightiningdone.png"
                  className="absolute -bottom-6 -left-8 w-24 h-24 object-contain animate-pulse pointer-events-none"
                />
              </div>
            </div>
          )}

          {/* النص */}
          <div className="relative z-10 space-y-4">
            <h3 className="text-2xl font-bold text-white">
              {title}
            </h3>

            <p className="text-gray-400 text-sm leading-relaxed max-w-[240px] mx-auto">
              {description}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AchievementCard;