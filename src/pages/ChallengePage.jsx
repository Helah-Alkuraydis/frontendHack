import React, { useState, useEffect, useMemo } from "react";
import ChallengeCard from "../components/ChallengeCard";
import MainLayout from "../components/MainLayout";
import ChallengeModal from "../components/ChallengeModal";
import EscapeChallengeModal from "../components/EscapeChallengeModal"; // ملفك الجديد
import {
  Plus,
  Zap,
  LayoutGrid,
  UserCircle,
  ShieldCheck,
  DoorOpen,
  Timer,
  Fingerprint,
  Key,
  FileCode,
  Send,
  X,
  ChevronLeft,
  ShieldAlert,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { BASE_URL } from "../api/auth.js";

const ChallengePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("public");
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [games, setGames] = useState([]);
  const [userLevels, setUserLevels] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [challenges, setChallenges] = useState({ public: [], my: [] });
  const [selectedFilter, setSelectedFilter] = useState("All");

  // --- حالات التعليقات ---
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [selectedChallengeForComments, setSelectedChallengeForComments] =
    useState(null);
  const [newComment, setNewComment] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [usersList, setUsersList] = useState([]);

  // --- جلب بيانات المستخدم المسجل حالياً ---
  const [currentUser, setCurrentUser] = useState({ username: "", avatar: "" });

  const getStoredUser = () => JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserName =
    currentUser.username || getStoredUser().username || "Guest";

  const [formData, setFormData] = useState({
    gameId: "",
    title: "",
    description: "",
    scenarioData: {},
    points_pool: 10,
    maxAttempts: 3,
    timeLimit: 60,
    visibility: "public",
  });

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${BASE_URL}/challenges/public/${selectedChallengeForComments._id}/comments`,
        { text: newComment },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (res.data.success) {
        const updatedChallenge = {
          ...selectedChallengeForComments,
          comments: [
            res.data.comment,
            ...(selectedChallengeForComments.comments || []),
          ],
        };

        setSelectedChallengeForComments(updatedChallenge);
        setNewComment("");

        setChallenges((prev) => ({
          ...prev,
          [activeTab]: prev[activeTab].map((ch) =>
            ch._id === selectedChallengeForComments._id ? updatedChallenge : ch,
          ),
        }));
      }
    } catch (error) {
      alert("Failed to post comment.");
    }
  };

  const getUserAvatar = (user) => {
    const avatarPath = user?.avatar || user?.characterStyle || "saudi-man.png";
    return avatarPath.startsWith("/") ? avatarPath : `/${avatarPath}`;
  };

  const handleEditClick = (challenge) => {
    setFormData({
      gameId: challenge.gameId?._id || challenge.gameId,
      title: challenge.title,
      description: challenge.description,
      points_pool: challenge.points_pool,
      maxAttempts: challenge.maxAttempts,
      timeLimit: challenge.timeLimit,
      visibility: challenge.visibility,
      scenarioData: { ...challenge.scenarioData },
    });
    setEditingId(challenge._id);
    setStep(1);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      gameId: "",
      title: "",
      description: "",
      content: "",
      answerFormat: "text",
      wrongOptions: ["", "", ""],
      points_pool: 10,
      hints: ["", "", ""],
      maxAttempts: 3,
      timeLimit: 60,
      visibility: "public",
    });
    setEditingId(null);
    setStep(1);
  };

  const filteredChallenges = useMemo(() => {
    const currentTabChallenges = challenges[activeTab] || [];
    if (selectedFilter === "All") return currentTabChallenges;

    return currentTabChallenges.filter((ch) => {
      const gameName = ch.gameId?.gameName || ch.type;
      return gameName === selectedFilter;
    });
  }, [challenges, activeTab, selectedFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const pubRes = await axios.get(
        `${BASE_URL}/challenges/public`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const myRes = await axios.get(
        `${BASE_URL}/challenges/my-challenges`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setChallenges((prev) => ({
        ...prev,
        public: pubRes.data.challenges || [],

        my: [...(myRes.data.challenges || [])],
      }));
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatRelativeTime = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays}d ago`;

    return new Date(date).toLocaleDateString();
  };

  const handleTextareaChange = async (e) => {
    const value = e.target.value;
    setNewComment(value);

    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPosition);

    const words = textBeforeCursor.split(/\s/);
    const lastWord = words[words.length - 1];

    if (lastWord.startsWith("@") && lastWord.length > 1) {
      const query = lastWord.slice(1);

      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${BASE_URL}/auth/users?search=${query}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (res.data && res.data.length > 0) {
          const formatted = res.data.map((u) => ({
            id: u._id,
            display: u.username,
            avatar: u.avatar || u.characterStyle,
          }));

          setFilteredUsers(formatted);
          setShowSuggestions(formatted.length > 0);
        } else {
          setShowSuggestions(false);
        }
      } catch (err) {
        console.error("Error searching users for mention:", err);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const handleCreate = async (e) => {
    try {
      const token = localStorage.getItem("token");
      let res;

      if (!formData.gameId)
        return alert("Please select a game category first!");
      if (!formData.title?.trim()) return alert("Challenge title is required!");
      if (!formData.description?.trim())
        return alert("Please provide a description.");

      const selectedGame = games.find((g) => g._id === formData.gameId);
      const gameName = selectedGame?.gameName;
      const scenario = formData.scenarioData;

      // 1. فحص لعبة Hack Race
      if (gameName === "Hack Race") {
        if (!scenario.questions || scenario.questions.length < 1) {
          return alert("The race must have at least 1 question.");
        }
        for (let i = 0; i < scenario.questions.length; i++) {
          const q = scenario.questions[i];
          if (!q.question.trim()) return alert(`Question #${i + 1} is empty.`);
          if (q.options.some((opt) => !opt.trim()))
            return alert(`Question #${i + 1} has empty options.`);
          if (!q.correctAnswer)
            return alert(
              `Please select the correct answer for Question #${i + 1}.`,
            );
          if (!q.options.includes(q.correctAnswer))
            return alert(
              `Question #${i + 1} correct answer must match one of the options.`,
            );
        }
      }

      // 2. فحص لعبة Cyber Escape Room (شغلك الجديد) 👈 أضفناه هنا
      if (gameName === "Cyber Escape Room") {
        const rooms = scenario.rooms;
        if (!rooms || rooms.length < 4) {
          return alert("Critical Error: 4 defined rooms are required!");
        }

        let missingFields = [];
        let errorRoom = -1;

        if (!rooms[0].puzzle_data) missingFields.push("Cipher Text (The code)");
        if (!rooms[0].answer) missingFields.push("Clean Answer (Decrypted text)");
        if (!rooms[0].hint) missingFields.push("Cipher Hint (Shift value)");
        
        if (missingFields.length > 0) errorRoom = 1;

        if (errorRoom === -1) {
          if (!rooms[1].logs?.length) missingFields.push("Network Logs (At least 1)");
          if (rooms[1].options?.length !== 5) missingFields.push(`Exactly 5 Devices (Current: ${rooms[1].options?.length || 0})`);
          if (!rooms[1].answer) missingFields.push("Infected Target (Click a device)");
          if (missingFields.length > 0) errorRoom = 2;
        }

        if (errorRoom === -1) {
          if (!rooms[2].puzzle_data) missingFields.push("Boolean Equation");
          if (!rooms[2].answer) missingFields.push("Logic Result (TRUE/FALSE)");
          if (missingFields.length > 0) errorRoom = 3;
        }

        if (errorRoom === -1) {
          const r4 = rooms[3].room4 || {};
          if (!r4.layer1) missingFields.push("Base64 Layer Data");
          if (!r4.vKey) missingFields.push("Vigenère Secret Key");
          if (!r4.masterKey) missingFields.push("Final Master Answer");
          if (missingFields.length > 0) errorRoom = 4;
        }

        if (missingFields.length > 0) {
          console.log("🛑 Protocol Blocked. Missing:", missingFields);
          Swal.fire({
            title: "PROTOCOL_INCOMPLETE",
            html: `
              <div style="text-align: left; font-family: monospace; font-size: 13px;">
                <p style="color: #666; margin-bottom: 10px;">Security parameters missing in ROOM_0${errorRoom}:</p>
                <ul style="color: #ff3b6b; list-style-type: square; padding-left: 20px;">
                  ${missingFields.map((f) => `<li style="margin-bottom: 5px;">${f}</li>`).join("")}
                </ul>
              </div>
            `,
            icon: "warning",
            background: "#080c14",
            color: "#fff",
            confirmButtonColor: "#10b981",
            confirmButtonText: "RE-EVALUATE",
            didOpen: () => {
              const container = Swal.getContainer();
              if (container) container.style.zIndex = "3000";
            },
          });
          return; // ⛔️ نوقف الـ Deploy هنا عشان ما يرسل للداتابيز بيانات ناقصة
        }
        


      }

      // 3. إرسال البيانات للسيرفر (للجميع)
      if (editingId) {
        res = await axios.put(
          `${BASE_URL}/challenges/public/${editingId}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } },
        );
      } else {
        res = await axios.post(
          `${BASE_URL}/challenges/public`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } },
        );
      }

      setShowModal(false);
      fetchData();
      if (editingId) {
        // حالة التعديل: رسالة بسيطة لأن التاريخ محدد مسبقاً
        Swal.fire({
          title: "Configuration Updated! 🛠️",
          text: "The challenge details have been modified successfully.",
          icon: "success",
          background: "#0a0f1d",
          color: "#fff",
          confirmButtonColor: "#3b82f6"
        });
      } else {
        const { expectedDate, message } = res.data;
        const formattedDate = new Date(expectedDate).toLocaleDateString('en-GB', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });

        Swal.fire({
          title: message || "Deployed Successfully! 🚀",
          html: `
            <div style="text-align: center; font-family: sans-serif;">
              <p style="color: #a0aec0; margin-bottom: 20px;">Your mission has been added to the queue.</p>
              <div style="background: rgba(6, 182, 212, 0.05); border: 2px dashed rgba(6, 182, 212, 0.3); padding: 20px; border-radius: 20px;">
                <span style="color: #64748b; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 8px;">Scheduled Release Date</span>
                <b style="color: #22d3ee; font-size: 1.2rem; display: block;">${formattedDate}</b>
              </div>
              <p style="color: #64748b; font-size: 11px; margin-top: 15px; font-style: italic;">"Prepare for deployment, Agent."</p>
            </div>
          `,
          icon: "success",
          background: "#0a0f1d",
          color: "#fff",
          confirmButtonColor: "#06b6d4",
          customClass: {
            popup: 'rounded-[2.5rem] border border-white/5'
          }
        });
      }
      resetForm();
    } catch (error) {
      console.error("Creation Error:", error);
      alert(error.response?.data?.message || "Internal server error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this challenge?"))
      return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.delete(
        `${BASE_URL}/challenges/public/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.status === 200) {
        alert("Challenge Deleted Successfully! 🗑️"); // عرض رسالة النجاح القادمة من السيرفر

        // تحديث القائمة فوراً في الواجهة
        setChallenges((prev) => ({
          ...prev,
          [activeTab]: prev[activeTab].filter((ch) => ch._id !== id),
        }));

        fetchData();
      }
    } catch (error) {
      console.error("Delete Error:", error);
      const errorMsg =
        error.response?.data?.message || "Failed to delete mission.";
      alert(errorMsg);
    }
  };

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await axios.get(`${BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrentUser({
          username: res.data.username,
          avatar: res.data.avatar || res.data.characterStyle || "/Avatar.png",
          _id: res.data._id,
        });
      } catch (error) {
        const stored = getStoredUser();
        if (stored.username)
          setCurrentUser({
            username: stored.username,
            avatar: stored.avatar || "/Avatar.png",
          });
      }
    };

    fetchCurrentUser();
    fetchData();

    const fetchGames = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/games`);
        setGames(res.data.data || res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchGames();

    const fetchUserLevels = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${BASE_URL}/games/user-levels`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        console.log("📡 API Response for levels:", res.data); // تأكدي من ظهورها هنا

        if (res.data.success) {
          // 🟢 التعديل المهم: استخراج المصفوفة من حقل levels
          setUserLevels(res.data.levels || []);
        }
      } catch (err) {
        console.error("Error fetching user levels:", err);
      }
    };

    fetchUserLevels();
  }, []);

const getGameIcon = (gameName) => {
    const icons = {
      "Phishing Hunter": <ShieldAlert style={{ stroke: "#34d399" }} size={24} />,
      "Firewall Defender": <ShieldCheck style={{ stroke: "#60a5fa" }} size={24} />,
      "Cyber Escape Room": <DoorOpen style={{ stroke: "#c084fc" }} size={24} />,
      "Hack Race": <Timer style={{ stroke: "#f87171" }} size={24} />,
      "Privacy Awareness": <Fingerprint style={{ stroke: "#22d3ee" }} size={24} />,
      "Password Maker/Breaker": <Key style={{ stroke: "#facc15" }} size={24} />,
      "Secure Coding Challenge": <FileCode style={{ stroke: "#fb923c" }} size={24} />,
    };

    return (
      icons[gameName] || (
        <Zap size={14} style={{ stroke: "#60a5fa", fill: "#60a5fa" }} />
      )
    );
  };

  const renderCommentWithMentions = (text) => {
    if (!text) return "";

    // نقسم النص بناءً على الكلمات التي تبدأ بـ @ وتتبعها حروف أو أرقام
    const parts = text.split(/(@\w+)/g);

    return parts.map((part, index) => {
      if (part.startsWith("@")) {
        return (
          <span
            key={index}
            className="text-blue-400 font-bold cursor-pointer transition-colors "
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <MainLayout activePage="challenge">
      <div className="text-3xl font-black tracking-tight text-white uppercase italic mb-5">
        Challenges
      </div>

{/* --- البارت 1: البانر العلوي - نسخة محسنة للجوال واللابتوب --- */}
      <div className="w-full relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#1c2438]/60 to-[#0a0f1d]/20 backdrop-blur-md border border-cyan-500/10 mb-8 md:mb-12 min-h-[350px] md:h-[340px] animate-in fade-in duration-500">
        <div className="relative z-10 w-full h-full flex flex-col md:flex-row items-center justify-center md:justify-between px-6 md:px-12 py-10 md:py-0">
          
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-3 tracking-tighter italic uppercase leading-tight drop-shadow-sm">
              Challenge <span className="text-cyan-400">Yourself</span>
            </h2>
            <p className="text-cyan-100/60 text-sm md:text-lg font-medium mb-1 italic leading-relaxed max-w-xs md:max-w-none">
              Face the challenge, shine like a cyber hero.
            </p>

            {/* قائمة الفلاتر: في الجوال تظهر مرتبة وبدون تداخل */}
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-8 bg-black/20 p-3 rounded-2xl border border-white/5 backdrop-blur-sm w-full md:w-auto">
              {[
                "All",
                "Phishing Hunter",
                "Password Maker/Breaker",
                "Escape Room",
                "Privacy Awareness",
                "Hack Race",
                "Secure Coding Challenge",
              ].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-3 py-1.5 rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all duration-300 border ${
                    selectedFilter === filter
                      ? "bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                      : "bg-white/5 border-transparent text-gray-400 hover:text-white"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* صورة الهدف: تظهر فقط في اللابتوب md:flex وتختفي في الجوال hidden لتقليل الإزعاج البصري */}
          <div className="hidden md:flex w-1/3 h-full relative items-center justify-end">
            <img
              src="/Target Icon.png"
              alt="Hero Target"
              className="w-[90%] max-w-none drop-shadow-[0_0_40px_rgba(6,182,212,0.3)] animate-[float_5s_ease-in-out_infinite]"
            />
          </div>
        </div>

        {/* تأثيرات الإضاءة الخلفية */}
        <div className="absolute top-[-20%] left-[-10%] w-72 h-72 bg-cyan-600/10 blur-[120px] rounded-full opacity-60"></div>
      </div>
<div className="w-full border border-white/5 bg-[#0a0f1d]/40 rounded-[2.5rem] p-4 md:p-12 min-h-[85vh] relative text-left">
        
        {/* التابز: جعلناها متجاوبة بحيث تصبح بجانب بعضها في الجوال بشكل أنيق */}
        <div className="w-full mb-8 md:mb-10">
          <div className="flex flex-row w-full bg-[#121620]/40 p-1.5 rounded-2xl border gap-2 md:gap-4 border-gray-800/30 backdrop-blur-sm">
            <button
              onClick={() => setActiveTab("public")}
              className={`flex-1 flex items-center justify-center gap-2 md:gap-3 px-2 md:px-6 py-3 md:py-4 rounded-xl font-black italic uppercase text-[9px] md:text-xs tracking-widest transition-all duration-300 ${
                activeTab === "public"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/40"
                  : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
              }`}
            >
              <LayoutGrid size={16} className="hidden sm:block" /> Public
            </button>
            <button
              onClick={() => setActiveTab("my")}
              className={`flex-1 flex items-center justify-center gap-2 md:gap-3 px-2 md:px-6 py-3 md:py-4 rounded-xl font-black italic uppercase text-[9px] md:text-xs tracking-widest transition-all duration-300 ${
                activeTab === "my"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/40"
                  : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
              }`}
            >
              <UserCircle size={16} className="hidden sm:block" /> My Challenges
            </button>
          </div>
        </div>

        {/* 3. شبكة التحديات (Cards Grid) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10 px-0 md:px-4 pb-10">
            {activeTab === "public" &&
            (filteredChallenges.length > 0 ? (
              filteredChallenges.map((ch) => (
                <ChallengeCard
                  key={ch._id || ch.id}
                  title={ch.title}
                  description={ch.desc || ch.description}
                  points={ch.points_pool || 10}
                  creator={ch.userId?.username || ch.creator || "Hero"}
                  avatar={getUserAvatar(ch.userId || ch)}
                  icon={getGameIcon(ch.gameId?.gameName || ch.type)}
                  userPlayStatus={ch.userPlayStatus} 
                  attemptsLeft={ch.attemptsLeft}
                  scheduledDate={ch.scheduledDate}
                  updatedAt={ch.updatedAt}
                  isMyChallenge={ch.userId?._id === currentUser._id}
                  status={ch.status}
                  timeLimit={ch.timeLimit}
                  commentsCount={ch.comments?.length || 0}
                  onEdit={() => handleEditClick(ch)}
                  onDelete={() => handleDelete(ch._id)}
                  onComment={() => {
                    setSelectedChallengeForComments(ch);
                    setShowCommentsModal(true);
                  }}
                  onAccept={() =>
                    navigate(`/challenges/solve/${ch._id || ch.id}`)
                  }
                />
              ))
            ) : (
              /* واجهة "لا توجد تحديات" */
              <div className="col-span-1 lg:col-span-2 flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in duration-700">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full"></div>
                  <Zap
                    size={64}
                    className="text-gray-700 relative z-10 animate-pulse"
                  />
                </div>
                <h3 className="text-2xl font-black text-gray-400 uppercase italic tracking-widest mb-2">
                  No Challenges Found
                </h3>
                <p className="text-gray-600 font-medium italic text-center max-w-md px-6">
                  {activeTab === "public"
                    ? "The arena is quiet... No public missions are active right now."
                    : "You haven't deployed any missions yet. Create your first challenge and lead the way!"}
                </p>
              </div>
            ))}

          {activeTab === "my" && (
            <>
              <div
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="border-2 border-dashed border-gray-800 rounded-[2.5rem] flex flex-col items-center justify-center p-10 cursor-pointer hover:border-blue-500/50 hover:bg-white/5 transition-all group min-h-[300px]"
              >
                <Plus
                  size={48}
                  className="text-gray-700 group-hover:text-blue-400 mb-4"
                />
                <span className="font-black text-gray-600 group-hover:text-blue-400">
                  Create New Challenge
                </span>
              </div>

              {challenges.my.map((ch) => (
                <ChallengeCard
                  key={ch._id || ch.id}
                  title={ch.title}
                  description={ch.desc || ch.description}
                  points={ch.points_pool || 10}
                  creator={currentUserName}
                  avatar={currentUser.avatar}
                  scheduledDate={ch.scheduledDate}
                  userPlayStatus={ch.userPlayStatus || "Available"}
                  attemptsLeft={ch.attemptsLeft || 3}
                  icon={getGameIcon(ch.gameId?.gameName || ch.type)}
                  isMyChallenge={true}
                  status={ch.status}
                  timeLimit={ch.timeLimit}
                  commentsCount={ch.comments?.length || 0}
                  onEdit={() => handleEditClick(ch)}
                  onDelete={() => handleDelete(ch._id)}
                  onComment={() => {
                    setSelectedChallengeForComments(ch);
                    setShowCommentsModal(true);
                  }}
                  onAccept={() =>
                    navigate(`/challenges/solve/${ch._id || ch.id}`)
                  }
                />
              ))}
            </>
          )}
        </div>
      </div>

      {/* --- مودال التعليقات --- */}
      {showCommentsModal && (
        <div
          onClick={() => setShowCommentsModal(false)}
          className="fixed inset-0 z-[5000] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl bg-[#1e293b] rounded-t-[2rem] md:rounded-[2.5rem] border-t md:border border-white/10 p-6 md:p-8 shadow-2xl max-h-[90vh] flex flex-col"
          >
            <button
              onClick={() => setShowCommentsModal(false)}
              className="absolute top-6 right-8 text-white/40 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            <div className="mb-8 text-left">
              <h3 className="text-xl font-bold text-emerald-400">
                {selectedChallengeForComments?.title}
              </h3>
              <div className="flex justify-between items-center border-b border-gray-700/50 pb-4 mt-6"></div>
            </div>

            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2  mb-8 text-left">
              {selectedChallengeForComments?.comments?.length > 0 ? (
                selectedChallengeForComments.comments.map((comment, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 group hover:bg-white/10 transition-all"
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-700 shrink-0">
                      <img
                        src={comment.avatar || "/Avatar.png"}
                        className="w-full h-full object-cover"
                        alt="user"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-bold text-white">
                          {comment.username || comment.userId?.username}
                        </span>
                        <span className="text-[9px] text-gray-100">
                          {formatRelativeTime(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-[13px] text-gray-300 leading-relaxed font-medium">
                        {renderCommentWithMentions(
                          comment.text || comment.content,
                        )}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-600 py-10 italic">
                  No comments yet. Be the first hero to comment!
                </p>
              )}
            </div>

            <div className="relative pt-4 border-t border-gray-700/50">
              {/* <input
                type="text"
                className="w-full bg-black/40 border border-gray-700 rounded-xl px-5 py-3 text-sm text-white placeholder:text-gray-600 focus:border-blue-500 outline-none"
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
              /> */}

              {showSuggestions && (
                <div className="absolute bottom-full left-0 w-full bg-[#1e293b] border border-white/10 rounded-xl shadow-2xl z-[3000]  overflow-hidden animate-in slide-in-from-bottom-2 duration-200">
                  <div className="max-h-48 overflow-y-auto custom-scrollbar">
                    {filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => {
                          const words = newComment.split(/\s/);
                          words.pop(); // حذف الكلمة التي بدأت بـ @
                          setNewComment(
                            [...words, `@${user.display} `].join(" "),
                          );
                          setShowSuggestions(false);
                        }}
                        className="px-4 py-2 hover:bg-blue-600 hover:text-white cursor-pointer text-xs font-bold text-gray-400 transition-colors"
                      >
                        @{user.display}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="relative flex-1 group ">
                <input
                  className="w-full bg-black/40 border border-gray-700 rounded-xl p px-5 py-3 text-sm text-white placeholder:text-gray-600 focus:border-blue-500 outline-none resize-none"
                  placeholder="Write a comment... use @ to mention"
                  rows="2"
                  value={newComment}
                  onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
                  onChange={handleTextareaChange}
                />

                <button
                  onClick={handleAddComment}
                  className="absolute right-2 top-1/2 -translate-y-1/2  bg-blue-600 hover:bg-blue-500 p-2 rounded-lg transition-all active:scale-95 shadow-lg shadow-cyan-900/20"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowCommentsModal(false)}
              className="mt-8 flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-lg border border-gray-800"
            >
              <ChevronLeft size={16} /> Back
            </button>
          </div>
        </div>
      )}

      {/* --- مودال إنشاء التحدي --- */} 
        <ChallengeModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            resetForm();
          }}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleCreate}
          step={step}
          setStep={setStep}
          games={games}
          userLevels={userLevels}
          editingId={editingId}
        />
      
    </MainLayout>
  );
};

export default ChallengePage;
