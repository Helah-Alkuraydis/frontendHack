import React, { useMemo, useState } from "react";
import { X, Plus, Trash2, Zap } from "lucide-react";

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
  const selectedGame = games.find((g) => g._id === formData.gameId);
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

  const updateRoom = (roomIdx, field, value) => {
    const currentRooms = [
      ...(formData.scenarioData?.rooms || [
        { puzzle_data: "", answer: "", hint: "", puzzleType: "Encryption" },
        { puzzle_data: "", answer: "", hint: "", puzzleType: "Threats" },
        { puzzle_data: "", answer: "", hint: "", puzzleType: "Logic" },
        { puzzle_data: "", answer: "", hint: "", puzzleType: "Firewall" },
      ]),
    ];

    currentRooms[roomIdx] = { ...currentRooms[roomIdx], [field]: value };
    updateScenario("rooms", currentRooms);
  };

  return (
    <div
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto"
    >
      <div className="bg-[#0f121a] border  border-emerald-500/20 w-full max-w-2xl rounded-[2.5rem] p-10 shadow-2xl relative my-auto">
        <div className="flex justify-end w-full mb-4">
          <button
            onClick={onClose}
            className=" top-6 right-8 text-white/40 hover:text-white transition-colors z-[1100]" // زدنا الـ z-index
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex items-center gap-4 mb-10 mt-4">
          {" "}
          <div
            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= 1 ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-gray-800"}`}
          ></div>
          <div
            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= 2 ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-gray-800"}`}
          ></div>
        </div>

        <h2 className="text-2xl font-black text-emerald-400 italic uppercase mb-8 flex items-center gap-3">
          <Plus className="bg-emerald-500/10 p-1 rounded-lg" />
          {step === 1
            ? "Step 1: Challenge Identity"
            : "Step 2: Rules & Mission"}
        </h2>

        <div className="space-y-6 text-left">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-gray-500 text-[12px] uppercase font-bold tracking-wider ml-2">
                    Game Category
                  </label>
                  <select
                    className="w-full bg-[#121620] border border-gray-800 rounded-xl px-5 py-3 text-white outline-none focus:border-emerald-500"
                    value={formData.gameId}
                    onChange={(e) =>
                      setFormData({ ...formData, gameId: e.target.value })
                    }
                  >
                    <option value="" disabled>
                      -- Choose Game --
                    </option>
                    {allowedGames.length > 0 ? (
                      allowedGames.map((game) => (
                        <option key={game._id} value={game._id}>
                          {game.gameName}
                        </option>
                      ))
                    ) : (
                      <option disabled>
                        {userRole === "Admin"
                          ? "Loading games..."
                          : "No games unlocked yet (Reach Level 3 to unlock)"}
                      </option>
                    )}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-gray-500 text-[12px] uppercase font-bold tracking-wider ml-2">
                    Title
                  </label>
                  <input
                    className="w-full bg-white/5 border border-gray-800 rounded-xl px-5 py-3 text-white focus:border-emerald-500 outline-none"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-gray-500 text-[12px] uppercase font-bold tracking-wider ml-2">
                  Public Description
                </label>
                <textarea
                  className="w-full bg-white/5 border border-gray-800 rounded-xl px-5 py-3 text-white h-24 resize-none focus:border-emerald-500 outline-none"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-gray-500 text-[12px] uppercase font-bold tracking-wider ml-2">
                    Attempts
                  </label>
                  <input
                    type="number"
                    className="w-full bg-white/5 border border-gray-800 p-3 rounded-xl text-white outline-none focus:border-emerald-500"
                    value={formData.maxAttempts}
                    onChange={(e) =>
                      setFormData({ ...formData, maxAttempts: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-500 text-[12px] uppercase font-bold tracking-wider ml-2">
                    Seconds
                  </label>
                  <input
                    type="number"
                    className="w-full bg-white/5 border border-gray-800 p-3 rounded-xl text-white outline-none focus:border-emerald-500"
                    value={formData.timeLimit}
                    onChange={(e) =>
                      setFormData({ ...formData, timeLimit: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-500 text-[12px] uppercase font-bold tracking-wider ml-2">
                    Points
                  </label>
                  <input
                    type="number"
                    className="w-full bg-white/5 border border-gray-800 p-3 rounded-xl text-white outline-none focus:border-emerald-500"
                    value={formData.points_pool}
                    onChange={(e) =>
                      setFormData({ ...formData, points_pool: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              {/* 1. إذا كانت اللعبة Phishing Hunter */}
              {selectedGameName === "Phishing Hunter" && (
                <div className="space-y-4 animate-in fade-in duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-gray-500 text-[12px] uppercase font-bold tracking-wider ml-2">
                        Email Sender
                      </label>
                      <input
                        placeholder="e.g. support@apple.com"
                        className="w-full bg-white/5 border border-gray-800 rounded-xl px-4 py-2 text-white focus:border-emerald-500 outline-none transition-all"
                        value={formData.scenarioData?.sender || ""}
                        onChange={(e) =>
                          updateScenario("sender", e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-gray-500 text-[12px] uppercase font-bold tracking-wider ml-2">
                        Email Subject
                      </label>
                      <input
                        placeholder="Urgent: Security Alert"
                        className="w-full bg-white/5 border border-gray-800 rounded-xl px-4 py-2 text-white focus:border-emerald-500 outline-none transition-all"
                        value={formData.scenarioData?.subject || ""}
                        onChange={(e) =>
                          updateScenario("subject", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-gray-500 text-[12px] uppercase font-bold tracking-wider ml-2">
                      Email Body Content{" "}
                    </label>
                    <textarea
                      placeholder="Dear user, we detected a login attempt..."
                      className="w-full bg-white/5 border border-gray-800 rounded-xl px-4 py-3 text-white h-24 resize-none focus:border-emerald-500 outline-none transition-all"
                      value={formData.scenarioData?.body || ""}
                      onChange={(e) => updateScenario("body", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-gray-500 text-[12px] uppercase font-bold tracking-wider ml-2">
                      Phishing Link
                    </label>
                    <input
                      placeholder="e.g. http://login-secure-bank.com"
                      className="w-full bg-white/5 border border-gray-800 rounded-xl px-4 py-2 text-white focus:border-emerald-500 outline-none transition-all"
                      value={formData.scenarioData?.links?.[0]?.url || ""}
                      onChange={(e) => {
                        // تخزين اللينك في مصفوفة داخل السيناريو
                        updateScenario("links", [
                          {
                            text: "Verify Account",
                            url: e.target.value,
                            isMalicious: true,
                          },
                        ]);
                      }}
                    />
                  </div>

                  <div className="p-4  bg-emerald-500/5 border border-emerald-500/10 rounded-2xl space-y-4 ">
                    <div className="space-y-2 ">
                      <label className="text-gray-500 text-[12px] uppercase font-bold tracking-wider ml-2">
                        Correct Action (The Solution)
                      </label>
                      <input
                        placeholder="e.g. Report Phishing"
                        className="w-full bg-[#121620] border border-emerald-500/30 rounded-xl px-4 py-2 text-white focus:border-emerald-500 outline-none"
                        value={formData.scenarioData?.correctAnswer || ""}
                        onChange={(e) =>
                          updateScenario("correctAnswer", e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-gray-500 text-[12px] uppercase font-bold tracking-wider ml-2">
                        Wrong Options (Distractors)
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {[0, 1, 2].map((i) => (
                          <input
                            key={i}
                            placeholder={`Wrong Option ${i + 1}`}
                            className="w-full bg-black/40 border border-gray-800 rounded-xl px-4 py-2 text-sm text-white focus:border-emerald-500 outline-none transition-all"
                            value={
                              formData.scenarioData?.wrong_actions?.[i] || ""
                            }
                            onChange={(e) => {
                              const newWrongs = [
                                ...(formData.scenarioData.wrong_actions || [
                                  "",
                                  "",
                                  "",
                                ]),
                              ];
                              newWrongs[i] = e.target.value;
                              updateScenario("wrong_actions", newWrongs);
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-gray-500 text-[12px] uppercase font-bold tracking-wider ml-2">
                      Hint
                    </label>
                    <input
                      placeholder="Give the player a clue..."
                      className="w-full bg-white/5 border border-gray-800 rounded-xl px-4 py-2 text-white focus:border-emerald-500 outline-none transition-all"
                      value={formData.scenarioData?.hints || " "}
                      onChange={(e) => {
                        updateScenario("hints", [e.target.value]);
                      }}
                    />
                  </div>
                </div>
              )}

              {/* 2. إذا كانت اللعبة Password Breaker */}
              {selectedGameName === "Password Maker/Breaker" && (
                <div className="space-y-6 animate-in fade-in duration-500">
                  {/* قسم بيانات الضحية (Target Info) */}
                  <div className="p-5 bg-blue-500/5 border border-blue-500/10 rounded-[2rem] space-y-4">
                    <label className="text-blue-400 text-[12px] uppercase font-bold tracking-wider ml-2">
                      Target OSINT Data (Victim Profile)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        placeholder="Target Name (e.g. Elias)"
                        className="w-full bg-black/40 border border-gray-800 rounded-xl px-4 py-2 text-sm text-white focus:border-blue-500 outline-none"
                        value={formData.scenarioData?.name || ""}
                        onChange={(e) => updateUserData("name", e.target.value)}
                      />
                      <input
                        placeholder="Birth Year (e.g. 1992)"
                        type="number"
                        className="w-full bg-black/40 border border-gray-800 rounded-xl px-4 py-2 text-sm text-white focus:border-blue-500 outline-none"
                        value={formData.scenarioData?.birthYear || ""}
                        onChange={(e) =>
                          updateUserData("birthYear", e.target.value)
                        }
                      />
                      <input
                        placeholder="City (e.g. Austin)"
                        className="w-full bg-black/40 border border-gray-800 rounded-xl px-4 py-2 text-sm text-white focus:border-blue-500 outline-none"
                        value={formData.scenarioData?.city || ""}
                        onChange={(e) => updateUserData("city", e.target.value)}
                      />
                      <input
                        placeholder="Pet Name (e.g. Sparky)"
                        className="w-full bg-black/40 border border-gray-800 rounded-xl px-4 py-2 text-sm text-white focus:border-blue-500 outline-none"
                        value={formData.scenarioData?.pet || ""}
                        onChange={(e) => updateUserData("pet", e.target.value)}
                      />
                    </div>
                    <input
                      placeholder="Hobby (e.g. Baking)"
                      className="w-full bg-black/40 border border-gray-800 rounded-xl px-4 py-2 text-sm text-white focus:border-blue-500 outline-none"
                      value={formData.scenarioData?.hobby || ""}
                      onChange={(e) => updateUserData("hobby", e.target.value)}
                    />
                  </div>

                  {/* الحل والتقرير الاستخباراتي */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-gray-500 text-[12px] uppercase font-bold tracking-wider ml-2">
                        Correct Password Sequence
                      </label>
                      <input
                        placeholder="The actual password to be guessed"
                        className="w-full bg-white/5 border border-gray-800 rounded-xl px-4 py-2 text-white focus:border-emerald-500 outline-none transition-all"
                        value={formData.scenarioData?.correctAnswer || ""}
                        onChange={(e) =>
                          updateScenario("correctAnswer", e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-gray-500 text-[12px] uppercase font-bold tracking-wider ml-2">
                        Analysis Report (The logic behind the hack)
                      </label>
                      <textarea
                        placeholder="Explain the vulnerability pattern..."
                        className="w-full bg-white/5 border border-gray-800 rounded-xl px-4 py-2 text-white focus:border-emerald-500 outline-none transition-all"
                        value={formData.scenarioData?.analysis_report || ""}
                        onChange={(e) =>
                          updateScenario("analysis_report", e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-gray-500 text-[12px] uppercase font-bold tracking-wider ml-2">
                        Cracking Hint
                      </label>
                      <input
                        placeholder="Subtle clue for the player..."
                        className="w-full bg-white/5 border border-gray-800 rounded-xl px-4 py-2 text-white focus:border-emerald-500 outline-none transition-all"
                        value={formData.scenarioData?.hint || ""}
                        onChange={(e) => updateScenario("hint", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 3. إذا كانت اللعبة Secure Coding */}
              {selectedGameName === "Secure Coding Challenge" && (
                <div className="space-y-6 animate-in fade-in duration-500 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                  {/* العناوين الأساسية */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-gray-500 text-[12px] uppercase font-bold tracking-wider ml-2">
                        Vulnerability Type
                      </label>
                      <input
                        placeholder="e.g. SQL Injection"
                        className="w-full bg-white/5 border border-gray-800 rounded-xl px-5 py-3 text-white text-xs focus:border-emerald-500 outline-none  appearance-none cursor-pointer transition-all hover:bg-white/[0.08]"
                        value={formData.scenarioData?.vulnerability_type || ""}
                        onChange={(e) =>
                          updateScenario("vulnerability_type", e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-gray-500 text-[12px] uppercase font-bold tracking-wider ml-2">
                        Fix
                      </label>
                      <input
                        placeholder="e.g. Use proper secure syntax / Parameterized Queries"
                        className="w-full bg-white/5 border border-gray-800 rounded-xl px-5 py-3 text-white text-xs focus:border-emerald-500 outline-none  appearance-none cursor-pointer transition-all hover:bg-white/[0.08]"
                        value={formData.scenarioData?.fix || ""}
                        onChange={(e) => updateScenario("fix", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-gray-500 text-[12px] uppercase font-bold tracking-wider ml-2">
                        Language
                      </label>
                      <div className="relative group">
                        <select
                          // هنا نربط القيمة مباشرة بالـ state، وإذا مو موجودة تكون خالية
                          value={formData.scenarioData?.language || ""}
                          onChange={(e) =>
                            updateScenario("language", e.target.value)
                          }
                          className="w-full bg-white/5 border border-gray-800 rounded-xl px-5 py-3 text-white text-xs outline-none focus:border-emerald-500 appearance-none cursor-pointer transition-all hover:bg-white/[0.08]"
                        >
                          <option value="" disabled className="bg-[#0f121a]">
                            -- Select Language --
                          </option>
                          <option value="php" className="bg-[#0f121a]">
                            PHP
                          </option>
                          <option value="python" className="bg-[#0f121a]">
                            Python
                          </option>
                          <option value="javascript" className="bg-[#0f121a]">
                            JavaScript
                          </option>
                          <option value="sql" className="bg-[#0f121a]">
                            SQL
                          </option>
                          <option value="java" className="bg-[#0f121a]">
                            Java
                          </option>
                          <option value="cpp" className="bg-[#0f121a]">
                            C++
                          </option>
                        </select>

                        {/* سهم أيقوني أنيق جهة اليمين */}
                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-emerald-500 transition-colors">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* منطقة الكود المصاب */}
                  <div className="space-y-2">
                    <label className="text-gray-500 text-[12px] uppercase font-bold tracking-wider ml-2">
                      Vulnerable Code Snippet
                    </label>
                    <textarea
                      placeholder="Paste the vulnerable code here..."
                      className="w-full bg-[#050505] border border-red-900/20 rounded-xl px-4 py-3 text-red-400 font-mono text-[13px] h-32 resize-none focus:border-red-500 outline-none shadow-inner"
                      value={formData.scenarioData?.vulnerable_code || ""}
                      onChange={(e) =>
                        updateScenario("vulnerable_code", e.target.value)
                      }
                    />
                  </div>

                  {/* السطر المستهدف */}
                  <div className="space-y-2">
                    <label className="text-gray-500 text-[12px] uppercase font-bold tracking-wider ml-2">
                      Target Vulnerable Line
                    </label>
                    <textarea
                      placeholder="Copy the exact line that needs fixing..."
                      className="w-full bg-white/5 border border-gray-800 rounded-xl px-5 py-3 text-white text-xs focus:border-emerald-500 outline-none  appearance-none cursor-pointer transition-all hover:bg-white/[0.08]"
                      value={
                        formData.scenarioData?.target_vulnerable_line || ""
                      }
                      onChange={(e) =>
                        updateScenario("target_vulnerable_line", e.target.value)
                      }
                    />
                  </div>

                  {/* منطقة الكود الآمن (المثال الصحيح) */}
                  <div className="space-y-2">
                    <label className="text-gray-500 text-[12px] uppercase font-bold tracking-wider ml-2">
                      Secure Code (The Solution)
                    </label>
                    <input
                      placeholder="How should the code look after the fix?"
                      className="w-full bg-[#050505] border border-emerald-900/20 rounded-xl px-4 py-3 text-emerald-400 font-mono text-[11px] h-32 resize-none focus:border-emerald-500 outline-none shadow-inner"
                      value={formData.scenarioData?.correctAnswer || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        // 1. تحديث السيناريو (عشان البيانات الفرعية)
                        updateScenario("correctAnswer", e.target.value);
                        setFormData((prev) => ({
                          ...prev,
                          correctAnswer: val,
                        }));
                      }}
                    />
                  </div>

                  {/* الكلمات المفتاحية المطلوبة */}
                  <div className="space-y-2">
                    <label className="text-gray-500 text-[12px] uppercase font-bold tracking-wider ml-2">
                      Expected Fix Keywords (Comma Separated)
                    </label>
                    <input
                      placeholder="e.g. json, loads, prepare"
                      className="w-full bg-white/5 border border-gray-800 rounded-xl px-5 py-3 text-white text-xs focus:border-emerald-500 outline-none  appearance-none cursor-pointer transition-all hover:bg-white/[0.08]"
                      value={
                        formData.scenarioData?.expected_fix_keywords?.join(
                          ", ",
                        ) || ""
                      }
                      onChange={(e) => {
                        const keywords = e.target.value
                          .split(",")
                          .map((k) => k.trim());
                        updateScenario("expected_fix_keywords", keywords);
                      }}
                    />
                  </div>

                  {/* شرح الثغرة */}
                  <div className="space-y-2">
                    <label className="text-gray-500 text-[12px] uppercase font-bold tracking-wider ml-2">
                      Educational Explanation
                    </label>
                    <textarea
                      placeholder="Explain why the original code was insecure..."
                      className="w-full bg-white/5 border border-gray-800 rounded-xl px-5 py-4 text-white text-xs focus:border-emerald-500 outline-none  appearance-none cursor-pointer transition-all hover:bg-white/[0.08]"
                      value={formData.scenarioData?.explanation || ""}
                      onChange={(e) =>
                        updateScenario("explanation", e.target.value)
                      }
                    />
                  </div>
                </div>
              )}

              {/* 4. إذا كانت اللعبة Privacy Awareness */}
              {selectedGameName === "Privacy Awareness" && (
                <div className="space-y-6 animate-in fade-in duration-500 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar text-left">
                  {/* 1. القصة والسياق */}
                  <div className="p-5 bg-blue-500/5 border border-blue-500/10 rounded-[2rem] space-y-4">
                    <label className="text-blue-400 text-[10px] font-black uppercase tracking-widest ml-2">
                      Mission Intelligence
                    </label>
                    <input
                      placeholder="Mission Context (e.g. Smart Hospital System)"
                      className="w-full bg-black/40 border border-gray-800 rounded-xl px-4 py-2 text-sm text-white focus:border-blue-500 outline-none"
                      value={formData.scenarioData?.context || ""}
                      onChange={(e) =>
                        updateScenario("context", e.target.value)
                      }
                    />
                    <textarea
                      placeholder="Describe the system goals and what it does..."
                      className="w-full bg-black/40 border border-gray-800 rounded-xl px-4 py-3 text-[11px] text-white h-20 resize-none focus:border-blue-500 outline-none"
                      value={formData.scenarioData?.explanation || ""}
                      onChange={(e) =>
                        updateScenario("explanation", e.target.value)
                      }
                    />
                  </div>

                  {/* 1.1 إضافة المهام (Mission Tasks) */}
                  <div className="p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-[2rem] space-y-2 mt-4">
                    <label className="text-emerald-400 text-[10px] font-black uppercase tracking-widest ml-2">
                      Mission Objectives (Tasks)
                    </label>
                    <textarea
                      placeholder="Enter mission tasks (one per line)..."
                      className="w-full bg-black/40 border border-gray-800 rounded-xl px-4 py-3 text-[11px] text-white h-24 focus:border-emerald-500 outline-none"
                      value={
                        Array.isArray(formData.scenarioData?.task)
                          ? formData.scenarioData.task.join("\n")
                          : formData.scenarioData?.task || ""
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        const tasksArray = val.split("\n");
                        updateScenario("task", tasksArray);
                      }}
                    />
                    <p className="text-[9px] text-gray-500 px-2 italic">
                      * Each line will appear as a bullet point for the player.
                    </p>
                  </div>

                  {/* 2. إضافة بيانات النظام (Data Items) */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center px-2">
                      <label className="text-gray-500 text-[10px] font-black uppercase tracking-widest">
                        System Data Points
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const currentScenario = formData.scenarioData || {};
                          const currentItems = currentScenario.dataItems || [];
                          const currentAnswers =
                            currentScenario.correctAnswers || [];
                          const newItem = {
                            id: Date.now().toString(),
                            name: "",
                            icon: "📄",
                            category: "personal",
                          };
                          const newAnswer = {
                            dataId: newItem.id,
                            necessary: true,
                            sensitivity: "normal",
                            encryption: "plain",
                            accessLevel: "admin",
                          };

                          setFormData((prev) => ({
                            ...prev,
                            scenarioData: {
                              ...(prev.scenarioData || {}),
                              dataItems: [...currentItems, newItem],
                              correctAnswers: [...currentAnswers, newAnswer],
                            },
                          }));
                        }}
                        className="text-[10px] bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all font-bold"
                      >
                        + Add Data Point
                      </button>
                    </div>

                    {/* قائمة الكروت المضافة */}
                    <div className="space-y-3">
                      {(formData.scenarioData?.dataItems || []).map(
                        (item, idx) => (
                          <div
                            key={item.id}
                            className="p-4 bg-white/5 border border-gray-800 rounded-2xl space-y-4 relative group transition-all hover:border-gray-700"
                          >
                            {/* السطر الأول: الاسم والتصنيف وزر الحذف */}
                            <div className="flex gap-3 items-start">
                              <div className="flex-1 grid grid-cols-2 gap-3">
                                <input
                                  placeholder="Data Name (e.g. GPS)"
                                  className="bg-black/20 border border-gray-700 rounded-lg px-3 py-2 text-[11px] text-white outline-none focus:border-blue-500"
                                  value={item.name || ""}
                                  onChange={(e) => {
                                    const newItems = [
                                      ...formData.scenarioData.dataItems,
                                    ];
                                    newItems[idx] = {
                                      ...newItems[idx],
                                      name: e.target.value,
                                    };
                                    updateScenario("dataItems", newItems);
                                  }}
                                />
                                <select
                                  className="bg-black/20 border border-gray-700 rounded-lg px-3 py-2 text-[11px] text-gray-400 outline-none"
                                  value={item.category || "personal"}
                                  onChange={(e) => {
                                    const newItems = [
                                      ...formData.scenarioData.dataItems,
                                    ];
                                    newItems[idx] = {
                                      ...newItems[idx],
                                      category: e.target.value,
                                    };
                                    updateScenario("dataItems", newItems);
                                  }}
                                >
                                  <option value="personal">Personal</option>
                                  <option value="biometric">Biometric</option>
                                  <option value="location">Location</option>
                                  <option value="behavioral">Behavioral</option>
                                </select>
                              </div>

                              {/* زر الحذف مرتب في الزاوية */}
                              <button
                                type="button"
                                className="p-2 text-gray-500 hover:text-red-500 transition-colors bg-red-500/5 rounded-lg border border-red-500/10"
                                onClick={() => {
                                  const filteredItems =
                                    formData.scenarioData.dataItems.filter(
                                      (i) => i.id !== item.id,
                                    );
                                  const filteredAnswers =
                                    formData.scenarioData.correctAnswers.filter(
                                      (a) => a.dataId !== item.id,
                                    );
                                  updateScenario("dataItems", filteredItems);
                                  updateScenario(
                                    "correctAnswers",
                                    filteredAnswers,
                                  );
                                }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>

                            {/* إعدادات الخصوصية (أربعة أعمدة متناسقة) */}
                            <div className="grid grid-cols-4 gap-2 pt-3 border-t border-white/5">
                              {/* 1. Necessity */}
                              <div className="flex flex-col gap-1">
                                <span className="text-[7px] text-gray-500 uppercase font-black tracking-tighter">
                                  Necessity
                                </span>
                                <button
                                  type="button"
                                  className={`py-1.5 rounded-md text-[9px] font-bold uppercase transition-all ${
                                    formData.scenarioData?.correctAnswers?.[idx]
                                      ?.necessary
                                      ? "bg-blue-600 text-white"
                                      : "bg-gray-800 text-gray-500"
                                  }`}
                                  onClick={() => {
                                    const newAns = [
                                      ...formData.scenarioData.correctAnswers,
                                    ];
                                    if (newAns[idx]) {
                                      newAns[idx] = {
                                        ...newAns[idx],
                                        necessary: !newAns[idx].necessary,
                                      };
                                      updateScenario("correctAnswers", newAns);
                                    }
                                  }}
                                >
                                  {formData.scenarioData?.correctAnswers?.[idx]
                                    ?.necessary
                                    ? "Essential"
                                    : "Optional"}
                                </button>
                              </div>

                              {/* 2. Sensitivity (المضافة حديثاً) */}
                              <div className="flex flex-col gap-1">
                                <span className="text-[7px] text-gray-500 uppercase font-black tracking-tighter">
                                  Sensitivity
                                </span>
                                <select
                                  className="bg-black/40 border border-gray-700 rounded-md py-1 px-1 text-[9px] text-white outline-none"
                                  value={
                                    formData.scenarioData?.correctAnswers?.[idx]
                                      ?.sensitivity || "normal"
                                  }
                                  onChange={(e) => {
                                    const newAns = [
                                      ...formData.scenarioData.correctAnswers,
                                    ];
                                    if (newAns[idx]) {
                                      newAns[idx] = {
                                        ...newAns[idx],
                                        sensitivity: e.target.value,
                                      };
                                      updateScenario("correctAnswers", newAns);
                                    }
                                  }}
                                >
                                  <option value="normal">NORMAL</option>
                                  <option value="important">IMPORTANT</option>
                                  <option value="sensitive">SENSITIVE</option>
                                </select>
                              </div>

                              {/* 3. Encryption */}
                              <div className="flex flex-col gap-1">
                                <span className="text-[7px] text-gray-500 uppercase font-black tracking-tighter">
                                  Storage
                                </span>
                                <select
                                  className="bg-black/40 border border-gray-700 rounded-md py-1 px-1 text-[9px] text-white outline-none"
                                  value={
                                    formData.scenarioData?.correctAnswers?.[idx]
                                      ?.encryption || "plain"
                                  }
                                  onChange={(e) => {
                                    const newAns = [
                                      ...formData.scenarioData.correctAnswers,
                                    ];
                                    if (newAns[idx]) {
                                      newAns[idx] = {
                                        ...newAns[idx],
                                        encryption: e.target.value,
                                      };
                                      updateScenario("correctAnswers", newAns);
                                    }
                                  }}
                                >
                                  <option value="plain">PLAIN</option>
                                  <option value="encrypted">ENCRYPTED</option>
                                  <option value="hashed">HASHED</option>
                                </select>
                              </div>

                              {/* 4. Access */}
                              <div className="flex flex-col gap-1">
                                <span className="text-[7px] text-gray-500 uppercase font-black tracking-tighter">
                                  Access
                                </span>
                                <select
                                  className="bg-black/40 border border-gray-700 rounded-md py-1 px-1 text-[9px] text-white outline-none"
                                  value={
                                    formData.scenarioData?.correctAnswers?.[idx]
                                      ?.accessLevel || "Admin"
                                  }
                                  onChange={(e) => {
                                    const newAns = [
                                      ...formData.scenarioData.correctAnswers,
                                    ];
                                    if (newAns[idx]) {
                                      newAns[idx] = {
                                        ...newAns[idx],
                                        accessLevel: e.target.value,
                                      };
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
                        ),
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 5. إذا كانت اللعبة Hack Race */}
              {selectedGameName === "Hack Race" && (
                <div className="space-y-6 animate-in fade-in duration-500 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar text-left">
                  {/* مقدمة السباق */}
                  <div className="p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-[2rem] space-y-2">
                    <label className="text-emerald-400 text-[10px] font-black uppercase tracking-widest ml-2 flex items-center gap-2">
                      <Zap size={14} /> Race Mission Briefing
                    </label>
                    <textarea
                      placeholder="Explain the overall theme of this race (e.g., General Cyber Awareness)..."
                      className="w-full bg-black/40 border border-gray-800 rounded-xl px-4 py-3 text-xs text-white h-20 resize-none focus:border-emerald-500 outline-none"
                      value={formData.scenarioData?.context || ""}
                      onChange={(e) =>
                        updateScenario("context", e.target.value)
                      }
                    />
                  </div>

                  {/* مدير الأسئلة (Question Manager) */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center px-2">
                      <label className="text-gray-500 text-[10px] font-black uppercase tracking-widest">
                        Race Questions (Limit: 5)
                      </label>
                      <button
                        type="button"
                        disabled={
                          (formData.scenarioData?.questions || []).length >= 5
                        }
                        onClick={() => {
                          const currentQs =
                            formData.scenarioData?.questions || [];
                          const newQ = {
                            id: Date.now(),
                            question: "",
                            options: ["", "", "", ""],
                            correctAnswer: "",
                            explanation: "",
                          };
                          updateScenario("questions", [...currentQs, newQ]);
                        }}
                        className="text-[10px] bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full border border-blue-500/20 hover:bg-blue-50 disabled:opacity-30 transition-all font-bold"
                      >
                        + Add Question
                      </button>
                    </div>

                    <div className="space-y-4">
                      {(formData.scenarioData?.questions || []).map(
                        (q, qIdx) => (
                          <div
                            key={q.id}
                            className="p-6 bg-white/5 border border-gray-800 rounded-[2rem] space-y-4 relative group hover:border-emerald-500/30 transition-all"
                          >
                            {/* رقم السؤال وزر الحذف */}
                            <div className="flex justify-between items-center border-b border-white/5 pb-3">
                              <span className="text-emerald-500 font-black italic text-sm uppercase">
                                # Question {qIdx + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const filtered =
                                    formData.scenarioData.questions.filter(
                                      (_, i) => i !== qIdx,
                                    );
                                  updateScenario("questions", filtered);
                                }}
                                className="p-1.5 text-gray-600 hover:text-red-500 bg-red-500/5 rounded-lg transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>

                            {/* نص السؤال */}
                            <input
                              placeholder="Enter the question text..."
                              className="w-full bg-black/20 border border-gray-700 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-emerald-500"
                              value={q.question}
                              onChange={(e) => {
                                const newQs = [
                                  ...formData.scenarioData.questions,
                                ];
                                newQs[qIdx].question = e.target.value;
                                updateScenario("questions", newQs);
                              }}
                            />

                            {/* الخيارات الـ 4 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {q.options.map((opt, optIdx) => (
                                <div
                                  key={optIdx}
                                  className="flex items-center gap-2 bg-black/40 rounded-xl px-3 border border-gray-800 focus-within:border-emerald-500/50 transition-all"
                                >
                                  <input
                                    type="radio"
                                    name={`correct-${q.id}`}
                                    checked={
                                      q.correctAnswer === opt && opt !== ""
                                    }
                                    onChange={() => {
                                      const newQs = [
                                        ...formData.scenarioData.questions,
                                      ];
                                      newQs[qIdx].correctAnswer = opt;
                                      updateScenario("questions", newQs);
                                    }}
                                    className="w-3 h-3 accent-emerald-500 cursor-pointer"
                                  />
                                  <input
                                    placeholder={`Option ${optIdx + 1}`}
                                    className="w-full bg-transparent py-2 text-[11px] text-gray-300 outline-none"
                                    value={opt}
                                    onChange={(e) => {
                                      const newQs = [
                                        ...formData.scenarioData.questions,
                                      ];
                                      newQs[qIdx].options[optIdx] =
                                        e.target.value;
                                      // تحديث الإجابة الصحيحة إذا تم تغيير نص الخيار المحدد
                                      if (q.correctAnswer === opt)
                                        newQs[qIdx].correctAnswer =
                                          e.target.value;
                                      updateScenario("questions", newQs);
                                    }}
                                  />
                                </div>
                              ))}
                            </div>

                            {/* شرح الإجابة (Explanation) */}
                            <div className="space-y-2 pt-2">
                              <label className="text-gray-600 text-[9px] uppercase font-black tracking-widest ml-2">
                                Educational Explanation (if they fail)
                              </label>
                              <textarea
                                placeholder="Why is the correct option right?"
                                className="w-full bg-black/20 border border-gray-800 rounded-xl px-4 py-2 text-[11px] text-gray-400 h-16 resize-none focus:border-blue-500 outline-none"
                                value={q.explanation}
                                onChange={(e) => {
                                  const newQs = [
                                    ...formData.scenarioData.questions,
                                  ];
                                  newQs[qIdx].explanation = e.target.value;
                                  updateScenario("questions", newQs);
                                }}
                              />
                            </div>
                          </div>
                        ),
                      )}

                      {/* تنبيه إذا لم يتم إضافة أسئلة */}
                      {(formData.scenarioData?.questions || []).length ===
                        0 && (
                        <div className="text-center py-10 border-2 border-dashed border-gray-800 rounded-[2rem] text-gray-600 italic text-xs">
                          No questions added. Click "+ Add Question" to start
                          building the race.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 6. إذا كانت اللعبة Cyber Escape Room */}
              {selectedGameName === "Cyber Escape Room" && (
                <div className="space-y-6 animate-in fade-in duration-500 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar text-left">
                  <div className="p-5 bg-blue-500/5 border border-blue-500/10 rounded-[2rem] space-y-2">
                    <label className="text-blue-400 text-[10px] font-black uppercase tracking-widest ml-2 flex items-center gap-2">
                      <Zap size={14} className="fill-blue-400" /> Escape Mission
                      Architecture
                    </label>
                    <p className="text-gray-500 text-[11px] px-2 italic font-medium">
                      Design 4 security layers. Click the blue pulse to expand
                      or collapse each layer.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {[0, 1, 2, 3].map((roomIdx) => {
                      const isExpanded = activeRoomIdx === roomIdx;

                      return (
                        <div
                          key={roomIdx}
                          className={`transition-all duration-500 rounded-[2.5rem] border ${
                            isExpanded
                              ? "bg-white/5 border-blue-500/30 p-6"
                              : "bg-black/40 border-gray-800 p-4 hover:border-blue-500/20"
                          } relative overflow-hidden`}
                        >
                          <div
                            className="flex justify-between items-center cursor-pointer"
                            onClick={() =>
                              setActiveRoomIdx(isExpanded ? null : roomIdx)
                            }
                          >
                            <div className="flex items-center gap-4">
                              <span
                                className={`font-black italic text-sm uppercase transition-colors ${isExpanded ? "text-blue-400" : "text-gray-600"}`}
                              >
                                # Security Layer 0{roomIdx + 1}
                              </span>
                              {!isExpanded && (
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest opacity-60">
                                  —{" "}
                                  {formData.scenarioData?.rooms?.[roomIdx]
                                    ?.puzzleType || "Not Configured"}
                                </span>
                              )}
                            </div>

                            <button
                              type="button"
                              className="relative group p-2"
                            >
                              <div
                                className={`w-3 h-3 rounded-full transition-all duration-500 ${
                                  isExpanded
                                    ? "bg-blue-500 shadow-[0_0_15px_#3b82f6]"
                                    : "bg-gray-700 group-hover:bg-blue-900"
                                }`}
                              />
                              {isExpanded && (
                                <div className="absolute inset-0 w-7 h-7 -left-[2px] -top-[2px] rounded-full border border-blue-500/50 animate-ping opacity-20" />
                              )}
                            </button>
                          </div>

                          <div
                            className={`transition-all duration-500 ease-in-out overflow-hidden ${
                              isExpanded
                                ? "max-h-[500px] mt-6 opacity-100"
                                : "max-h-0 opacity-0"
                            }`}
                          >
                            <div className="space-y-5">
                              {/* اختيار نوع اللغز */}
                              {/* <div className="space-y-2">
                                <label className="text-gray-500 text-[9px] font-black uppercase tracking-[0.2em] ml-2">
                                  Layer Protocol Type
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                  {[
                                    "Encryption",
                                    "Threats",
                                    "Logic",
                                    "Firewall",
                                  ].map((type) => (
                                    <button
                                      key={type}
                                      type="button"
                                      onClick={() =>
                                        updateRoom(roomIdx, "puzzleType", type)
                                      }
                                      className={`py-2 rounded-xl text-[9px] font-black uppercase transition-all border ${
                                        formData.scenarioData?.rooms?.[roomIdx]
                                          ?.puzzleType === type
                                          ? "bg-blue-600 border-blue-400 text-white"
                                          : "bg-black/20 border-gray-800 text-gray-500 hover:text-blue-400"
                                      }`}
                                    >
                                      {type}
                                    </button>
                                  ))}
                                </div>
                              </div> */}

                              <div className="space-y-2">
                                <label className="text-gray-500 text-[10px] uppercase font-bold tracking-wider ml-2">
                                  Puzzle Content
                                </label>
                                <textarea
                                  placeholder="Enter the security challenge..."
                                  className="w-full bg-black/40 border border-gray-800 rounded-2xl px-4 py-3 text-xs text-white h-24 resize-none focus:border-blue-500 outline-none"
                                  value={
                                    formData.scenarioData?.rooms?.[roomIdx]
                                      ?.puzzle_data || ""
                                  }
                                  onChange={(e) =>
                                    updateRoom(
                                      roomIdx,
                                      "puzzle_data",
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <label className="text-gray-500 text-[10px] uppercase font-bold tracking-wider ml-2">
                                    Breach Key
                                  </label>
                                  <input
                                    placeholder="Required key..."
                                    className="w-full bg-black/20 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                                    value={
                                      formData.scenarioData?.rooms?.[roomIdx]
                                        ?.answer || ""
                                    }
                                    onChange={(e) =>
                                      updateRoom(
                                        roomIdx,
                                        "answer",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-gray-500 text-[10px] uppercase font-bold tracking-wider ml-2">
                                    Intel Hint
                                  </label>
                                  <input
                                    placeholder="Support data..."
                                    className="w-full bg-black/20 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                                    value={
                                      formData.scenarioData?.rooms?.[roomIdx]
                                        ?.hint || ""
                                    }
                                    onChange={(e) =>
                                      updateRoom(
                                        roomIdx,
                                        "hint",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* الأزرار السفلية */}
          <div className="flex gap-4 pt-6 border-t border-gray-800/50">
            {step === 1 ? (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 text-gray-500 font-bold uppercase text-[10px]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-[2] bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 py-4 rounded-2xl font-black uppercase text-[10px]"
                >
                  Next Step
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-4 text-gray-400 font-bold uppercase text-[10px]"
                >
                  Go Back
                </button>
                <button
                  type="button"
                  onClick={onSubmit}
                  className="flex-[2] bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase text-[10px]"
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
