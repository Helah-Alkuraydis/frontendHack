import React, { useState, useEffect } from "react";
import axios from "axios";
import MainLayout from "../components/MainLayout";
import AchievementCard from "../components/AchievementCard";
import { BASE_URL } from "../api/auth.js";

interface Achievement {
  _id: string;
  name: string;
  description: string;
  badgeImageUrl: string;
  isLocked: boolean;
}

const Achievements = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isTechnical, setIsTechnical] = useState<boolean>(false);

  const [showModal, setShowModal] = useState<boolean>(false);
  const [newAchievements, setNewAchievements] = useState<any[]>([]);
  const [hideGlowNow, setHideGlowNow] = useState<boolean>(false);
  
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const userRes = await axios.get(`${BASE_URL}/auth/me`, { headers });
        setIsTechnical(userRes.data.isTechnical ?? false);

        const unseenRes = await axios.get(`${BASE_URL}/achievements/unseen`, { headers });
        if (unseenRes.data.success && unseenRes.data.data.length > 0) {
          setNewAchievements(unseenRes.data.data);
          setShowModal(true); 
        }

        const response = await axios.get(`${BASE_URL}/achievements`, { headers });
        if (response.data.success) {
          setAchievements(response.data.data);
        }

      } catch (err: any) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const handleOkClick = async () => {
    try {
      setShowModal(false); 
      setHideGlowNow(true); 

      const token = localStorage.getItem("token");
      await axios.put(`${BASE_URL}/achievements/mark-seen`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error("Failed to mark as seen", err);
    }
  };

  const filteredAchievements = achievements.filter((item) => {
    const technicalOnly = ["The Expert Patcher", "Ghost Mode"];
    if (!isTechnical) return !technicalOnly.includes(item.name);
    return true;
  });

  return (
    <MainLayout activePage="achievements" forceHideGlow={hideGlowNow}>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="relative bg-[#0d1424] border border-cyan-400/60 p-6 md:p-8 rounded-2xl shadow-[0_0_60px_-10px_rgba(6,182,212,0.6)] max-w-sm w-full text-center transform transition-all animate-in fade-in zoom-in duration-300">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-cyan-500/5 via-transparent to-cyan-500/10 pointer-events-none"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 md:mb-6 bg-gradient-to-b from-cyan-500/20 to-transparent border border-cyan-500/40 rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.5)]">
                <span className="text-3xl md:text-4xl drop-shadow-2xl">🏆</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-300 mb-2 drop-shadow-md">
                New Achievement!
              </h3>
              <p className="text-gray-300 mb-6 md:mb-8 text-xs md:text-sm">
                You have unlocked: <br />
                {newAchievements.map((ach, index) => (
                  <span key={index} className="text-cyan-400 font-black text-xl md:text-2xl block mt-2 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">
                    {ach.achievementId.name}
                  </span>
                ))}
              </p>
              <button
                onClick={handleOkClick}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-[#050810] font-black text-base md:text-lg py-3 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:shadow-[0_0_30px_rgba(6,182,212,0.9)] transform hover:-translate-y-1"
              >
                Ok
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-[1400px] mx-auto space-y-8 lg:space-y-16 pb-20 px-4 lg:px-6">
        <div className="flex items-center gap-4 pt-6">
          <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-white uppercase italic">
            Achievements
          </h2>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-cyan-500/40 to-transparent"></div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
          </div>
        ) : (
          /* 🔥 رجعناها 3 أعمدة للابتوب كحد أقصى عشان ترجع مستطيلة وفخمة 🔥 */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10">
            {filteredAchievements.map((item) => (
              <AchievementCard
                key={item._id}
                title={item.name}
                description={item.description}
                isLocked={item.isLocked}
                image={item.badgeImageUrl}
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Achievements;