import React, { useMemo, useState } from "react";
import { X, Plus, Trash2, Zap } from "lucide-react";
import EscapeRoomBuilder from '../components/EscapeRoomBuilder';

const ChallengeModal = ({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSubmit,
  step,
  setStep,
  games,
  userLevels = [],
  editingId,
}) => {
  const selectedGame = games.find((g) => g._id === formData.gameId );
  const selectedGameName = selectedGame ? selectedGame.gameName : "";
  const [activeRoomIdx, setActiveRoomIdx] = useState(0);

  const userRole = localStorage.getItem("role");
  const allowedGames = useMemo(() => {
    if (!games || games.length === 0) return [];

    if (userLevels.length === 0)
      return games.filter((g) => g.gameName !== "Firewall Defender");

    return games.filter((game) => {
      if (game.gameName === "Firewall Defender") return false;

      if (editingId && game._id === formData.gameId) return true;
      if (userLevels.length === 0) return true;

      const userGameInfo = userLevels.find((ul) => {
        const ulGameId = ul.gameId?._id
          ? ul.gameId._id.toString()
          : ul.gameId?.toString();
        const currentGameId = game._id?.toString();
        return ulGameId === currentGameId;
      });
      const userLevel = userGameInfo ? userGameInfo.level : 1;
      return userLevel >= 3;
      
    });
  }, [games, userLevels, editingId, formData.gameId]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const updateScenario = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      scenarioData: {
        ...(prev.scenarioData || {}),
        [field]: value,
      },
    }));
  };

  const updateUserData = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      scenarioData: {
        ...prev.scenarioData,
        userData: {
          ...(prev.scenarioData?.userData || {}),
          [field]: value,
        },
      },
    }));
  };

  return (
    <div
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[5000] flex items-center justify-center bg-black/90 backdrop-blur-md overflow-y-auto"
    >
      {/* Container */}
      <div className="bg-[#0f121a] border border-emerald-500/20 w-full max-w-2xl min-h-screen md:min-h-0 md:rounded-[2.5rem] p-5 md:p-10 shadow-2xl relative flex flex-col">
        
        {/* زر الإغلاق */}
        <div className="flex justify-end w-full mb-2">
          <button onClick={onClose} className="p-2 text-white/40 hover:text-white transition-colors">
            <X size={28} />
          </button>
        </div>

        {/* شريط التقدم */}
        <div className="flex items-center gap-4 mb-8 mt-2 px-2">
          <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= 1 ? "bg-emerald-500 shadow-[0_0_10px_#10b981]" : "bg-gray-800"}`}></div>
          <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= 2 ? "bg-emerald-500 shadow-[0_0_10px_#10b981]" : "bg-gray-800"}`}></div>
        </div>

        <h2 className="text-xl md:text-2xl font-black text-emerald-400 italic uppercase mb-6 flex items-center gap-3 px-2">
          <Plus className="bg-emerald-500/10 p-1 rounded-lg" size={24} />
          {step === 1 ? "Step 1: Identity" : "Step 2: Rules"}
        </h2>

        {/* محتوى الخطوات */}
        <div className="flex-1 space-y-6 overflow-y-auto px-2 custom-scrollbar pb-24 md:pb-0">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-gray-500 text-[10px] md:text-[12px] uppercase font-bold tracking-wider ml-1">Game Category</label>
                  <select
                    className="w-full bg-[#121620] border border-gray-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-500"
                    value={formData.gameId}
                    onChange={(e) => setFormData({ ...formData, gameId: e.target.value })}
                  >
                    <option value="" disabled>-- Choose Game --</option>
                    {allowedGames.map((game) => (<option key={game._id} value={game._id}>{game.gameName}</option>))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-gray-500 text-[10px] md:text-[12px] uppercase font-bold tracking-wider ml-1">Title</label>
                  <input
                    className="w-full bg-white/5 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-gray-500 text-[10px] md:text-[12px] uppercase font-bold tracking-wider ml-1">Description</label>
                <textarea
                  className="w-full bg-white/5 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white h-24 resize-none focus:border-emerald-500 outline-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* 🟢 تم إصلاح وعزل كلاسات الـ Grid هنا لتظهر متناسقة وموزونة في الجوال واللابتوب */}
              <div className="grid grid-cols-3 gap-2 md:gap-4">
                <div className="space-y-1">
                  <label className="text-gray-500 text-[8px] md:text-[12px] uppercase font-bold tracking-tight md:tracking-wider ml-1">
                    Attempts
                  </label>
                  <input
                    type="number"
                    className="w-full bg-white/5 border border-gray-800 p-3 rounded-xl text-center md:text-left text-sm text-white outline-none focus:border-emerald-500"
                    value={formData.maxAttempts}
                    onChange={(e) => setFormData({ ...formData, maxAttempts: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-500 text-[8px] md:text-[12px] uppercase font-bold tracking-tight md:tracking-wider ml-1">
                    Seconds
                  </label>
                  <input
                    type="number"
                    className="w-full bg-white/5 border border-gray-800 p-3 rounded-xl text-center md:text-left text-sm text-white outline-none focus:border-emerald-500"
                    value={formData.timeLimit}
                    onChange={(e) => setFormData({ ...formData, timeLimit: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-500 text-[8px] md:text-[12px] uppercase font-bold tracking-tight md:tracking-wider ml-1">
                    Points
                  </label>
                  <input
                    type="number"
                    className="w-full bg-white/5 border border-gray-800 p-3 rounded-xl text-center md:text-left text-sm text-white outline-none focus:border-emerald-500"
                    value={formData.points_pool}
                    onChange={(e) => setFormData({ ...formData, points_pool: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-10">

              {/* 1. إذا كانت اللعبة Phishing Hunter */}
              {selectedGameName === "Phishing Hunter" && (
                <div className="space-y-4 animate-in fade-in duration-500 max-h-[60vh] md:max-h-none overflow-y-auto pr-2 custom-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-gray-500 text-[10px] md:text-[12px] uppercase font-bold tracking-wider ml-1">Email Sender</label>
                      <input
                        placeholder="e.g. support@apple.com"
                        className="w-full bg-white/5 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none transition-all"
                        value={formData.scenarioData?.sender || ""}
                        onChange={(e) => updateScenario("sender", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-gray-500 text-[10px] md:text-[12px] uppercase font-bold tracking-wider ml-1">Email Subject</label>
                      <input
                        placeholder="Urgent: Security Alert"
                        className="w-full bg-white/5 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none transition-all"
                        value={formData.scenarioData?.subject || ""}
                        onChange={(e) => updateScenario("subject", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-gray-500 text-[10px] md:text-[12px] uppercase font-bold tracking-wider ml-1">Email Body Content</label>
                    <textarea
                      placeholder="Dear user, we detected a login attempt..."
                      className="w-full bg-white/5 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white h-24 resize-none focus:border-emerald-500 outline-none transition-all"
                      value={formData.scenarioData?.body || ""}
                      onChange={(e) => updateScenario("body", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-gray-500 text-[10px] md:text-[12px] uppercase font-bold tracking-wider ml-1">Phishing Link</label>
                    <input
                      placeholder="e.g. http://login-secure-bank.com"
                      className="w-full bg-white/5 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none transition-all"
                      value={formData.scenarioData?.links?.[0]?.url || ""}
                      onChange={(e) => {
                        updateScenario("links", [
                          { text: "Verify Account", url: e.target.value, isMalicious: true },
                        ]);
                      }}
                    />
                  </div>

                  <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl space-y-4">
                    <div className="space-y-2">
                      <label className="text-emerald-500/70 text-[10px] md:text-[12px] uppercase font-bold tracking-wider ml-1">Correct Action (The Solution)</label>
                      <input
                        placeholder="e.g. Report Phishing"
                        className="w-full bg-[#121620] border border-emerald-500/30 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none"
                        value={formData.scenarioData?.correctAnswer || ""}
                        onChange={(e) => updateScenario("correctAnswer", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-gray-500 text-[10px] md:text-[12px] uppercase font-bold tracking-wider ml-1">Wrong Options (Distractors)</label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {[0, 1, 2].map((i) => (
                          <input
                            key={i}
                            placeholder={`Wrong Option ${i + 1}`}
                            className="w-full bg-black/40 border border-gray-800 rounded-xl px-4 py-3 text-xs md:text-sm text-white focus:border-emerald-500 outline-none transition-all"
                            value={formData.scenarioData?.wrong_actions?.[i] || ""}
                            onChange={(e) => {
                              const newWrongs = [...(formData.scenarioData.wrong_actions || ["", "", ""])];
                              newWrongs[i] = e.target.value;
                              updateScenario("wrong_actions", newWrongs);
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pb-6">
                    <label className="text-gray-500 text-[10px] md:text-[12px] uppercase font-bold tracking-wider ml-1">Hint</label>
                    <input
                      placeholder="Give the player a clue..."
                      className="w-full bg-white/5 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none transition-all"
                      value={formData.scenarioData?.hints || ""}
                      onChange={(e) => updateScenario("hints", [e.target.value])}
                    />
                  </div>
                </div>
              )}

              {/* 2. إذا كانت اللعبة Password Breaker */}
              {selectedGameName === "Password Maker/Breaker" && (
                <div className="space-y-6 animate-in fade-in duration-500 max-h-[60vh] md:max-h-none overflow-y-auto pr-2 custom-scrollbar">
                  <div className="p-4 md:p-5 bg-blue-500/5 border border-blue-500/10 rounded-[1.5rem] md:rounded-[2rem] space-y-4">
                    <label className="text-blue-400 text-[10px] md:text-[12px] uppercase font-bold tracking-wider ml-1">Target OSINT Data (Victim Profile)</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        placeholder="Target Name (e.g. Elias)"
                        className="w-full bg-black/40 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none transition-all"
                        value={formData.scenarioData?.userData?.name || ""}
                        onChange={(e) => updateUserData("name", e.target.value)}
                      />
                      <input
                        placeholder="Birth Year (e.g. 1992)"
                        type="number"
                        className="w-full bg-black/40 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none transition-all"
                        value={formData.scenarioData?.userData?.birthYear || ""}
                        onChange={(e) => updateUserData("birthYear", e.target.value)}
                      />
                      <input
                        placeholder="City (e.g. Austin)"
                        className="w-full bg-black/40 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none transition-all"
                        value={formData.scenarioData?.userData?.city || ""}
                        onChange={(e) => updateUserData("city", e.target.value)}
                      />
                      <input
                        placeholder="Pet Name (e.g. Sparky)"
                        className="w-full bg-black/40 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none transition-all"
                        value={formData.scenarioData?.userData?.pet || ""}
                        onChange={(e) => updateUserData("pet", e.target.value)}
                      />
                    </div>
                    <input
                      placeholder="Hobby (e.g. Baking)"
                      className="w-full bg-black/40 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none transition-all"
                      value={formData.scenarioData?.userData?.hobby || ""}
                      onChange={(e) => updateUserData("hobby", e.target.value)}
                    />
                  </div>

                  <div className="space-y-5 px-1">
                    <div className="space-y-2">
                      <label className="text-gray-500 text-[10px] md:text-[12px] uppercase font-bold tracking-wider ml-1">Correct Password Sequence</label>
                      <input
                        placeholder="The actual password to be guessed"
                        className="w-full bg-white/5 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none transition-all"
                        value={formData.scenarioData?.correctAnswer || ""}
                        onChange={(e) => updateScenario("correctAnswer", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-gray-500 text-[10px] md:text-[12px] uppercase font-bold tracking-wider ml-1">Analysis Report</label>
                      <textarea
                        placeholder="Explain the vulnerability pattern..."
                        className="w-full bg-white/5 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white h-24 resize-none focus:border-emerald-500 outline-none transition-all"
                        value={formData.scenarioData?.analysis_report || ""}
                        onChange={(e) => updateScenario("analysis_report", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2 pb-6">
                      <label className="text-gray-500 text-[10px] md:text-[12px] uppercase font-bold tracking-wider ml-1">Cracking Hint</label>
                      <input
                        placeholder="Subtle clue for the player..."
                        className="w-full bg-white/5 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none transition-all"
                        value={formData.scenarioData?.hint || ""}
                        onChange={(e) => updateScenario("hint", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 3. إذا كانت اللعبة Secure Coding */}
              {selectedGameName === "Secure Coding Challenge" && (
                <div className="space-y-6 animate-in fade-in duration-500 max-h-[65vh] md:max-h-none overflow-y-auto pr-2 custom-scrollbar pb-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-gray-500 text-[10px] md:text-[12px] uppercase font-bold tracking-wider ml-1">Vulnerability Type</label>
                      <input
                        placeholder="e.g. SQL Injection"
                        className="w-full bg-white/5 border border-gray-800 rounded-xl px-4 py-3 text-white text-xs focus:border-emerald-500 outline-none transition-all"
                        value={formData.scenarioData?.vulnerability_type || ""}
                        onChange={(e) => updateScenario("vulnerability_type", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-gray-500 text-[10px] md:text-[12px] uppercase font-bold tracking-wider ml-1">Fix</label>
                      <input
                        placeholder="e.g. Parameterized Queries"
                        className="w-full bg-white/5 border border-gray-800 rounded-xl px-4 py-3 text-white text-xs focus:border-emerald-500 outline-none transition-all"
                        value={formData.scenarioData?.fix || ""}
                        onChange={(e) => updateScenario("fix", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-gray-500 text-[10px] md:text-[12px] uppercase font-bold tracking-wider ml-1">Language</label>
                      <div className="relative group">
                        <select
                          value={formData.scenarioData?.language || ""}
                          onChange={(e) => updateScenario("language", e.target.value)}
                          className="w-full bg-[#121620] border border-gray-800 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-emerald-500 appearance-none cursor-pointer"
                        >
                          <option value="" disabled>-- Select Language --</option>
                          <option value="php">PHP</option>
                          <option value="python">Python</option>
                          <option value="javascript">JavaScript</option>
                          <option value="sql">SQL</option>
                          <option value="java">Java</option>
                          <option value="cpp">C++</option>
                        </select>
                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-500">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-red-400/80 text-[10px] md:text-[12px] uppercase font-bold tracking-wider ml-1">Vulnerable Code Snippet</label>
                    <textarea
                      placeholder="Paste the vulnerable code here..."
                      className="w-full bg-[#050505] border border-red-900/20 rounded-xl px-4 py-3 text-red-400 font-mono text-[12px] h-32 resize-none focus:border-red-500 outline-none shadow-inner"
                      value={formData.scenarioData?.vulnerable_code || ""}
                      onChange={(e) => updateScenario("vulnerable_code", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-gray-500 text-[10px] md:text-[12px] uppercase font-bold tracking-wider ml-1">Target Vulnerable Line</label>
                    <textarea
                      placeholder="Copy the exact line that needs fixing..."
                      className="w-full bg-white/5 border border-gray-800 rounded-xl px-4 py-3 text-white text-xs focus:border-emerald-500 outline-none h-16 md:h-auto resize-none transition-all"
                      value={formData.scenarioData?.target_vulnerable_line || ""}
                      onChange={(e) => updateScenario("target_vulnerable_line", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-emerald-400/80 text-[10px] md:text-[12px] uppercase font-bold tracking-wider ml-1">Secure Code (The Solution)</label>
                    <textarea
                      placeholder="How should the code look after the fix?"
                      className="w-full bg-[#050505] border border-emerald-900/20 rounded-xl px-4 py-3 text-emerald-400 font-mono text-[12px] h-32 resize-none focus:border-emerald-500 outline-none shadow-inner"
                      value={formData.scenarioData?.correctAnswer || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateScenario("correctAnswer", val);
                        setFormData((prev) => ({ ...prev, correctAnswer: val }));
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-gray-500 text-[10px] md:text-[12px] uppercase font-bold tracking-wider ml-1">Expected Fix Keywords</label>
                    <input
                      placeholder="e.g. json, loads, prepare"
                      className="w-full bg-white/5 border border-gray-800 rounded-xl px-4 py-3 text-white text-xs focus:border-emerald-500 outline-none transition-all"
                      value={formData.scenarioData?.expected_fix_keywords?.join(", ") || ""}
                      onChange={(e) => {
                        const keywords = e.target.value.split(",").map((k) => k.trim());
                        updateScenario("expected_fix_keywords", keywords);
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-gray-500 text-[10px] md:text-[12px] uppercase font-bold tracking-wider ml-1">Educational Explanation</label>
                    <textarea
                      placeholder="Explain why the original code was insecure..."
                      className="w-full bg-white/5 border border-gray-800 rounded-xl px-4 py-3 text-white text-xs focus:border-emerald-500 outline-none h-24 resize-none transition-all"
                      value={formData.scenarioData?.explanation || ""}
                      onChange={(e) => updateScenario("explanation", e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* 4. إذا كانت اللعبة Privacy Awareness */}
              {selectedGameName === "Privacy Awareness" && (
                <div className="space-y-6 animate-in fade-in duration-500 max-h-[65vh] md:max-h-none overflow-y-auto pr-2 custom-scrollbar text-left pb-10">
                  <div className="p-4 md:p-5 bg-blue-500/5 border border-blue-500/10 rounded-[1.5rem] md:rounded-[2rem] space-y-4">
                    <label className="text-blue-400 text-[10px] font-black uppercase tracking-widest ml-1 flex items-center gap-2">Challenge Intelligence</label>
                    <input
                      placeholder="Challenge Context (e.g. Smart Hospital System)"
                      className="w-full bg-black/40 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none transition-all"
                      value={formData.scenarioData?.context || ""}
                      onChange={(e) => updateScenario("context", e.target.value)}
                    />
                    <textarea
                      placeholder="Describe the system goals and what it does..."
                      className="w-full bg-black/40 border border-gray-800 rounded-xl px-4 py-3 text-[11px] text-white h-20 resize-none focus:border-blue-500 outline-none transition-all"
                      value={formData.scenarioData?.explanation || ""}
                      onChange={(e) => updateScenario("explanation", e.target.value)}
                    />
                  </div>

                  <div className="p-4 md:p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-[1.5rem] md:rounded-[2rem] space-y-2">
                    <label className="text-emerald-400 text-[10px] font-black uppercase tracking-widest ml-1">Challenge Objectives (Tasks)</label>
                    <textarea
                      placeholder="Enter challenge tasks (one per line)..."
                      className="w-full bg-black/40 border border-gray-800 rounded-xl px-4 py-3 text-[11px] text-white h-24 focus:border-emerald-500 outline-none transition-all"
                      value={Array.isArray(formData.scenarioData?.task) ? formData.scenarioData.task.join("\n") : formData.scenarioData?.task || ""}
                      onChange={(e) => updateScenario("task", e.target.value.split("\n"))}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-gray-500 text-[10px] font-black uppercase tracking-widest">System Data Points</label>
                      <button
                        type="button"
                        onClick={() => {
                          const currentItems = formData.scenarioData?.dataItems || [];
                          const currentAnswers = formData.scenarioData?.correctAnswers || [];
                          const newItem = { id: Date.now().toString(), name: "", icon: "📄", category: "personal" };
                          const newAnswer = { dataId: newItem.id, necessary: true, sensitivity: "normal", encryption: "plain", accessLevel: "admin" };
                          setFormData(prev => ({
                            ...prev,
                            scenarioData: { ...prev.scenarioData, dataItems: [...currentItems, newItem], correctAnswers: [...currentAnswers, newAnswer] }
                          }));
                        }}
                        className="text-[9px] md:text-[10px] bg-emerald-500/10 text-emerald-500 px-3 py-1.5 rounded-full border border-emerald-500/20 font-bold hover:bg-emerald-500 hover:text-white transition-all"
                      >
                        + Add Data Point
                      </button>
                    </div>

                    <div className="space-y-4">
                      {(formData.scenarioData?.dataItems || []).map((item, idx) => (
                        <div key={item.id} className="p-4 bg-white/5 border border-gray-800 rounded-2xl space-y-4 transition-all hover:border-gray-700">
                          <div className="flex gap-2 items-start">
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                              <input
                                placeholder="Data Name (e.g. GPS)"
                                className="bg-black/20 border border-gray-700 rounded-lg px-3 py-2 text-[11px] text-white outline-none focus:border-blue-500"
                                value={item.name || ""}
                                onChange={(e) => {
                                  const newItems = [...formData.scenarioData.dataItems];
                                  newItems[idx] = { ...newItems[idx], name: e.target.value };
                                  updateScenario("dataItems", newItems);
                                }}
                              />
                              <select
                                className="bg-black/20 border border-gray-700 rounded-lg px-3 py-2 text-[11px] text-gray-400 outline-none"
                                value={item.category || "personal"}
                                onChange={(e) => {
                                  const newItems = [...formData.scenarioData.dataItems];
                                  newItems[idx] = { ...newItems[idx], category: e.target.value };
                                  updateScenario("dataItems", newItems);
                                }}
                              >
                                <option value="personal">Personal</option>
                                <option value="biometric">Biometric</option>
                                <option value="location">Location</option>
                                <option value="behavioral">Behavioral</option>
                              </select>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const filteredItems = formData.scenarioData.dataItems.filter(i => i.id !== item.id);
                                const filteredAnswers = formData.scenarioData.correctAnswers.filter(a => a.dataId !== item.id);
                                updateScenario("dataItems", filteredItems);
                                updateScenario("correctAnswers", filteredAnswers);
                              }}
                              className="p-2 text-gray-500 hover:text-red-500 bg-red-500/5 rounded-lg border border-red-500/10"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-white/5">
                            <div className="flex flex-col gap-1">
                              <span className="text-[7px] text-gray-500 uppercase font-black tracking-tighter">Necessity</span>
                              <button
                                type="button"
                                className={`py-2 rounded-md text-[9px] font-bold uppercase transition-all ${formData.scenarioData?.correctAnswers?.[idx]?.necessary ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-500"}`}
                                onClick={() => {
                                  const newAns = [...formData.scenarioData.correctAnswers];
                                  if (newAns[idx]) {
                                    newAns[idx] = { ...newAns[idx], necessary: !newAns[idx].necessary };
                                    updateScenario("correctAnswers", newAns);
                                  }
                                }}
                              >
                                {formData.scenarioData?.correctAnswers?.[idx]?.necessary ? "Essential" : "Optional"}
                              </button>
                            </div>

                            <div className="flex flex-col gap-1">
                              <span className="text-[7px] text-gray-500 uppercase font-black tracking-tighter">Sensitivity</span>
                              <select
                                className="bg-black/40 border border-gray-700 rounded-md py-2 px-1 text-[9px] text-white outline-none"
                                value={formData.scenarioData?.correctAnswers?.[idx]?.sensitivity || "normal"}
                                onChange={(e) => {
                                  const newAns = [...formData.scenarioData.correctAnswers];
                                  if (newAns[idx]) {
                                    newAns[idx] = { ...newAns[idx], sensitivity: e.target.value };
                                    updateScenario("correctAnswers", newAns);
                                  }
                                }}
                              >
                                <option value="normal">NORMAL</option>
                                <option value="important">IMPORTANT</option>
                                <option value="sensitive">SENSITIVE</option>
                              </select>
                            </div>

                            <div className="flex flex-col gap-1">
                              <span className="text-[7px] text-gray-500 uppercase font-black tracking-tighter">Storage</span>
                              <select
                                className="bg-black/40 border border-gray-700 rounded-md py-2 px-1 text-[9px] text-white outline-none"
                                value={formData.scenarioData?.correctAnswers?.[idx]?.encryption || "plain"}
                                onChange={(e) => {
                                  const newAns = [...formData.scenarioData.correctAnswers];
                                  if (newAns[idx]) {
                                    newAns[idx] = { ...newAns[idx], encryption: e.target.value };
                                    updateScenario("correctAnswers", newAns);
                                  }
                                }}
                              >
                                <option value="plain">PLAIN</option>
                                <option value="encrypted">ENCRYPTED</option>
                                <option value="hashed">HASHED</option>
                              </select>
                            </div>

                            <div className="flex flex-col gap-1">
                              <span className="text-[7px] text-gray-500 uppercase font-black tracking-tighter">Access</span>
                              <select
                                className="bg-black/40 border border-gray-700 rounded-md py-2 px-1 text-[9px] text-white outline-none"
                                value={formData.scenarioData?.correctAnswers?.[idx]?.accessLevel || "admin"}
                                onChange={(e) => {
                                  const newAns = [...formData.scenarioData.correctAnswers];
                                  if (newAns[idx]) {
                                    newAns[idx] = { ...newAns[idx], accessLevel: e.target.value };
                                    updateScenario("correctAnswers", newAns);
                                  }
                                }}
                              >
                                <option value="user">USER</option>
                                <option value="admin">ADMIN</option>
                                <option value="public">PUBLIC</option>
                                <option value="private">PRIVATE</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 5. إذا كانت اللعبة Hack Race */}
              {selectedGameName === "Hack Race" && (
                <div className="space-y-6 animate-in fade-in duration-500 max-h-[65vh] md:max-h-none overflow-y-auto pr-2 custom-scrollbar text-left pb-10">
                  <div className="p-4 md:p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-[1.5rem] md:rounded-[2rem] space-y-2">
                    <label className="text-emerald-400 text-[10px] font-black uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Zap size={14} /> Race Challenge Briefing
                    </label>
                    <textarea
                      placeholder="Explain the overall theme of this race..."
                      className="w-full bg-black/40 border border-gray-800 rounded-xl px-4 py-3 text-xs text-white h-20 resize-none focus:border-emerald-500 outline-none transition-all"
                      value={formData.scenarioData?.context || ""}
                      onChange={(e) => updateScenario("context", e.target.value)}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Race Questions (Limit: 5)</label>
                      <button
                        type="button"
                        disabled={(formData.scenarioData?.questions || []).length >= 5}
                        onClick={() => {
                          const currentQs = formData.scenarioData?.questions || [];
                          const newQ = { id: Date.now(), question: "", options: ["", "", "", ""], correctAnswer: "", explanation: "" };
                          updateScenario("questions", [...currentQs, newQ]);
                        }}
                        className="text-[9px] md:text-[10px] bg-blue-500/10 text-blue-500 px-3 py-1.5 rounded-full border border-blue-500/20 hover:bg-blue-50 transition-all font-bold disabled:opacity-30"
                      >
                        + Add Question
                      </button>
                    </div>

                    <div className="space-y-5">
                      {(formData.scenarioData?.questions || []).map((q, qIdx) => (
                        <div key={q.id} className="p-5 md:p-6 bg-white/5 border border-gray-800 rounded-[1.5rem] md:rounded-[2rem] space-y-4 relative transition-all hover:border-emerald-500/30">
                          <div className="flex justify-between items-center border-b border-white/5 pb-3">
                            <span className="text-emerald-500 font-black italic text-xs md:text-sm uppercase"># Question {qIdx + 1}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const filtered = formData.scenarioData.questions.filter((_, i) => i !== qIdx);
                                updateScenario("questions", filtered);
                              }}
                              className="p-1.5 text-gray-600 hover:text-red-500 bg-red-500/5 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          <div className="space-y-2">
                            <input
                              placeholder="Enter the question text..."
                              className="w-full bg-black/20 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-500 transition-all"
                              value={q.question}
                              onChange={(e) => {
                                const newQs = [...formData.scenarioData.questions];
                                newQs[qIdx].question = e.target.value;
                                updateScenario("questions", newQs);
                              }}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {q.options.map((opt, optIdx) => (
                              <div key={optIdx} className="flex items-center gap-3 bg-black/40 rounded-xl px-3 border border-gray-800 focus-within:border-emerald-500/50 transition-all">
                                <input
                                  type="radio"
                                  name={`correct-${q.id}`}
                                  checked={q.correctAnswer === opt && opt !== ""}
                                  onChange={() => {
                                    const newQs = [...formData.scenarioData.questions];
                                    newQs[qIdx].correctAnswer = opt;
                                    updateScenario("questions", newQs);
                                  }}
                                  className="w-4 h-4 accent-emerald-500 cursor-pointer"
                                />
                                <input
                                  placeholder={`Option ${optIdx + 1}`}
                                  className="w-full bg-transparent py-3 text-xs md:text-[11px] text-gray-300 outline-none"
                                  value={opt}
                                  onChange={(e) => {
                                    const newQs = [...formData.scenarioData.questions];
                                    newQs[qIdx].options[optIdx] = e.target.value;
                                    if (q.correctAnswer === opt) newQs[qIdx].correctAnswer = e.target.value;
                                    updateScenario("questions", newQs);
                                  }}
                                />
                              </div>
                            ))}
                          </div>

                          <div className="space-y-2 pt-2 border-t border-white/5">
                            <label className="text-gray-600 text-[8px] md:text-[9px] uppercase font-black tracking-widest ml-1">Educational Explanation</label>
                            <textarea
                              placeholder="Why is this answer correct?"
                              className="w-full bg-black/20 border border-gray-800 rounded-xl px-4 py-2 text-[11px] text-gray-400 h-16 resize-none focus:border-blue-500 outline-none transition-all"
                              value={q.explanation}
                              onChange={(e) => {
                                const newQs = [...formData.scenarioData.questions];
                                newQs[qIdx].explanation = e.target.value;
                                updateScenario("questions", newQs);
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* 6. إذا كانت اللعبة Cyber Escape Room */}
              {/* 🟢 تم إصلاح وعزل استدعاء المكون الأساسي لـ EscapeRoomBuilder وحمايته للعمل بكفاءة على الجوال واللابتوب */}
              {selectedGameName === "Cyber Escape Room" && (
                <EscapeRoomBuilder
                  formData={formData}
                  setFormData={setFormData}
                  onSubmit={onSubmit}
                  onBack={() => setStep(1)} 
                />
              )}
            </div>
          )}

          {/* الأزرار السفلية */}
          <div className="flex flex-row gap-3 pt-6 border-t border-gray-800/50 bg-[#0f121a] mt-auto">
            {step === 1 ? (
              <>
                <button type="button" onClick={onClose} className="flex-1 py-4 text-gray-500 font-bold uppercase text-[9px] md:text-[10px]">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-[2] bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 py-4 rounded-2xl font-black uppercase text-[9px] md:text-[10px] transition-all active:scale-95"
                >
                  Next Step
                </button>
              </>
            ) : (
              <>
                <button type="button" onClick={() => setStep(1)} className="flex-1 py-4 text-gray-400 font-bold uppercase text-[9px] md:text-[10px]">
                  Go Back
                </button>
                <button
                  type="button"
                  onClick={onSubmit}
                  className="flex-[2] bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase text-[9px] md:text-[10px] shadow-lg shadow-emerald-900/20 transition-all active:scale-95"
                >
                  {editingId ? "Update Challenge" : "Deploy Challenge"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengeModal;