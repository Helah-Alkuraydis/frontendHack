import React, { useState, useEffect } from "react";
import axios from "axios";
import MainLayout from "../components/MainLayout";
import AchievementCard from "../components/AchievementCard";

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

  // 👈 حالات خاصة بالنافذة المنبثقة (Modal)
  const [showModal, setShowModal] = useState<boolean>(false);
  const [newAchievements, setNewAchievements] = useState<any[]>([]);
  const [hideGlowNow, setHideGlowNow] = useState<boolean>(false);
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // 1. جلب بيانات المستخدم
        const userRes = await axios.get("http://localhost:5000/api/auth/me", { headers });
        setIsTechnical(userRes.data.isTechnical ?? false);

        // 2. التحقق من وجود إنجازات جديدة (لعرض النافذة المنبثقة)
        const unseenRes = await axios.get("http://localhost:5000/api/achievements/unseen", { headers });
        if (unseenRes.data.success && unseenRes.data.data.length > 0) {
          setNewAchievements(unseenRes.data.data);
          setShowModal(true); // إظهار النافذة
        }

        // 3. جلب كافة الإنجازات لعرضها في الصفحة
        const response = await axios.get("http://localhost:5000/api/achievements", { headers });
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
      setShowModal(false); // إخفاء النافذة المنبثقة
      setHideGlowNow(true); // 👈 إطفاء النور فوراً عن طريق تغيير الـ State

      const token = localStorage.getItem("token");
      await axios.put("http://localhost:5000/api/achievements/mark-seen", {}, {
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">

          {/* المربع مع الإضاءة والتوهج الخارجي */}
          <div className="relative bg-[#0d1424] border border-cyan-400/60 p-8 rounded-2xl shadow-[0_0_60px_-10px_rgba(6,182,212,0.6)] max-w-sm w-full text-center transform transition-all animate-in fade-in zoom-in duration-300">

            {/* تأثير إضاءة ناعمة داخل المربع (Inner Glow) */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-cyan-500/5 via-transparent to-cyan-500/10 pointer-events-none"></div>

            <div className="relative z-10">
              {/* أيقونة الكأس مع هالة نور */}
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-b from-cyan-500/20 to-transparent border border-cyan-500/40 rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.5)]">
                <span className="text-4xl drop-shadow-2xl">🏆</span>
              </div>

              {/* عنوان لامع */}
              <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-300 mb-2 drop-shadow-md">
                New Achievement!
              </h3>

              <p className="text-gray-300 mb-8 text-sm">
                You have unlocked: <br />
                {newAchievements.map((ach, index) => (
                  <span
                    key={index}
                    className="text-cyan-400 font-black text-2xl block mt-2 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]"
                  >
                    {ach.achievementId.name}
                  </span>
                ))}
              </p>

              {/* زر ساطع */}
              <button
                onClick={handleOkClick}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-[#050810] font-black text-lg py-3 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:shadow-[0_0_30px_rgba(6,182,212,0.9)] transform hover:-translate-y-1"
              >
                Ok
              </button>
            </div>
          </div>
        </div>
      )}

      {/* محتوى الصفحة العادي */}
      <div className="max-w-6xl mx-auto space-y-16 pb-20 px-6">
        <div className="flex items-center gap-4 pt-6">
          <h2 className="text-3xl font-black tracking-tight text-white uppercase italic">
            Achievements
          </h2>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-cyan-500/40 to-transparent"></div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
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