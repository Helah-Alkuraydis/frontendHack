import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { MessageSquareCode, X, ArrowLeft } from 'lucide-react';
import { socket } from '../../../socket';
import TacticalChat from './TacticalChat';
import Room01Cipher from './rooms/Room01Cipher';
import Room02Defender from './rooms/Room02Defender';
import Room03Logic from './rooms/Room03Logic';
import Room04Final from './rooms/Room04Final';
import Swal from 'sweetalert2';

const MultiplayerEscapeRoom = ({ sessionId, userData, myRole }) => {
  const [roomIdx, setRoomIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(600);
  const [roomData, setRoomData] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false); 
  const [unreadCount, setUnreadCount] = useState(0); 
  const [messages, setMessages] = useState([]);
  const [currentRole, setCurrentRole] = useState(myRole);
  const navigate = useNavigate(); 
  const location = useLocation();
  const historyId = location.state?.historyId;

  useEffect(() => {
      setCurrentRole(myRole);
  }, [myRole]);

  useEffect(() => {
      if (sessionId && userData?._id && historyId) {
            socket.emit("join_room", sessionId);
      
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      if (userData?._id === storedUser._id) { 
        const playerIds = [userData._id];
          socket.emit("init_escape_mission", sessionId,playerIds , historyId);
      }
    }
    socket.on("role_reassigned", (data) => {
      console.log("⚠️ Role Assignment Update:", data);

      if (data.newSuccessor === userData?._id) {
          setCurrentRole(data.newRole); 
          
          Swal.fire({
              title: '[ SECURITY PROTOCOL UPDATED ]',
              html: `
                  <div class="text-center space-y-3 font-mono">
                      <p class="text-cyan-400 font-black animate-pulse uppercase">Partner Disconnected</p>
                      <p class="text-white text-xs">You have inherited all security clearances. New Role: <span class="text-yellow-400">${data.newRole}</span></p>
                  </div>
              `,
              icon: 'info',
              toast: true,
              position: 'top-end',
              timer: 6000,
              background: '#050810',
              color: '#fff',
              showConfirmButton: false,
              customClass: {
                  popup: 'border-2 border-cyan-500/30 rounded-2xl shadow-lg'
              }
          });
      } else {
          Swal.fire({
              text: data.msg,
              icon: 'warning',
              toast: true,
              position: 'top-end',
              timer: 4000
          });
      }
    });
  }, [sessionId, userData?._id , historyId]);

  useEffect(() => {
    const sidebar = document.querySelector('aside') || document.querySelector('.sidebar');
    
    if (sidebar) {
      sidebar.style.pointerEvents = 'none';
      sidebar.style.opacity = '0.5';
      sidebar.style.transition = 'all 0.5s ease';
    }

    const handleBackButton = (e) => {
      window.history.pushState(null, null, window.location.pathname);
      
      Swal.fire({
        title: '[ WARNING: AREA SECURED ]',
        text: "Agent, you cannot retreat now. Use the 'Abort Mission' button if you must evacuate.",
        icon: 'warning',
        background: '#050810',
        color: '#fff',
        confirmButtonColor: '#00ff96',
        confirmButtonText: 'STAY IN MISSION'
      });
    };

    window.history.pushState(null, null, window.location.pathname);
    window.addEventListener('popstate', handleBackButton);

    return () => {
      if (sidebar) {
        sidebar.style.pointerEvents = 'auto';
        sidebar.style.filter = 'none';
        sidebar.style.opacity = '1';
      }
      window.removeEventListener('popstate', handleBackButton);
    };
  }, []);

  const handleBackClick = () => {
    Swal.fire({
      title: '[ ABORT MISSION? ]',
      html: `
        <div class="text-center space-y-3 font-mono">
          <p class="text-red-500 font-black animate-pulse uppercase tracking-tighter">Warning: Connection Termination Detected</p>
          <p class="text-gray-400 text-xs italic">Leaving now will forfeit your rewards and disconnect your partner. Confirm evacuation?</p>
        </div>
      `,
      icon: 'warning',
      background: '#050810',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#374151',
      confirmButtonText: 'YES, EVACUATE',
      cancelButtonText: 'NO, STAY',
      customClass: {
        popup: 'border-2 border-red-500/30 rounded-[2rem] shadow-[0_0_40px_rgba(239,68,68,0.1)]',
        confirmButton: 'font-black rounded-xl px-6',
        cancelButton: 'font-black rounded-xl px-6'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        socket.emit("player_left_room", { 
          sessionId: sessionId, 
          userId: userData?._id, 
          isHost: location.state?.isHost 
        });      
        navigate('/games');
      }
    });
  };

  useEffect(() => {
    socket.on("sync_escape_state", (state) => {
      setRoomIdx(state.currentRoom);
      setTimeLeft(state.timeLeft);
      setRoomData(state.roomData);
    });

    socket.on("timer_update", (time) => setTimeLeft(time));

    const handleGlobalMsg = (msg) => {
      setMessages((prev) => [...prev, msg]);
      if (!isChatOpen && msg.username !== userData?.username) {
        setUnreadCount((prev) => prev + 1);
      }
    };
    socket.on("receive_tactical_msg", handleGlobalMsg);

    socket.on("room_cleared", (data) => {
      console.log("🔓 Room UNLOCK", data.msg);

      Swal.fire({
          title: 'WORK SUCCESSFUL',
          html: `
            <div class="flex flex-col items-center gap-4">
              <div class="lock-animation text-6xl">🔓</div>
              <div class="text-[#00ff96] font-black tracking-widest uppercase animate-pulse">
                ${data.msg}
              </div>
            </div>
          `,
          background: '#0a1020',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          padding: '3rem',
          customClass: {
              popup: 'border-2 border-[#00ff96]/50 rounded-[2.5rem] font-mono shadow-[0_0_50px_rgba(0,255,150,0.2)]',
              title: 'text-[#00ff96] font-black tracking-tighter italic'
          }
      });

      setTimeout(() => {
          setRoomIdx(data.nextRoom);
          setRoomData(data.roomData); 
      }, 3000);
    });

    socket.on("solve_error", (data) => {
        console.log("⚠️ Penalty Applied:", data.msg);

        Swal.fire({
            title: 'PROTOCOL ERROR',
            text: `${data.msg} (-${data.penalty} s)`,
            icon: 'error',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            background: '#0a1020', 
            color: '#ff4444',     
            iconColor: '#ff4444',
            customClass: {
              popup: 'mt-30 border-2 border-red-500/50 rounded-2xl font-mono uppercase italic shadow-[0_0_20px_rgba(239,68,68,0.3)]',
              title: 'text-xs font-black tracking-widest',
              htmlContainer: 'text-[10px] font-bold'
            }
        });

        document.body.classList.add('shake-anim');
        setTimeout(() => document.body.classList.remove('shake-anim'), 500);
    });

    socket.on("mission_accomplished", (data) => {
      Swal.fire({
          title: 'MISSION ACCOMPLISHED!',
          html: `
            <div class="flex flex-col items-center gap-6">
              <div class="text-7xl animate-bounce">🏆</div>
              <div class="space-y-2">
                  <p class="text-[#00ff96] text-xl font-black uppercase tracking-[0.2em]">${data.msg}</p>
                  <div class="bg-white/5 border border-[#00ff96]/30 p-4 rounded-2xl">
                      <p class="text-white text-sm font-bold">REWARD: <span class="text-[#00ff96] text-2xl">+${data.reward}</span> PTS</p>
                  </div>
              </div>
            </div>
          `,
          background: '#050810',
          confirmButtonText: 'FINISH THE GAME',
          confirmButtonColor: '#00ff96',
          allowOutsideClick: false, 
          customClass: {
              popup: 'border-2 border-[#00ff96] rounded-[3rem] font-mono shadow-[0_0_80px_rgba(0,255,150,0.2)]',
              confirmButton: 'text-black font-black px-10 py-3 rounded-xl'
          }
      }).then((result) => {
          if (result.isConfirmed) {
              window.location.href = "/games"; 
          }
      });
    });

    socket.on("escape_game_over", (data) => {
      Swal.fire({
          title: 'MISSION TERMINATED',
          html: `
              <div class="text-center space-y-4">
                  <div class="text-5xl mb-4">💀</div>
                  <p class="text-red-500 font-black uppercase tracking-widest">${data.msg}</p>
                  <p className="text-gray-400 text-[10px] italic">Security protocols have locked the system permanently.</p>
              </div>
          `,
          background: '#050810',
          confirmButtonText: 'RETURN TO BASE',
          confirmButtonColor: '#ff4444',
          allowOutsideClick: false,
          customClass: {
              popup: 'border-2 border-red-500/50 rounded-[2.5rem] shadow-[0_0_50px_rgba(255,68,68,0.2)]',
              confirmButton: 'font-black px-10'
          }
      }).then((result) => {
          if (result.isConfirmed) {
              navigate('/games');
          }
      });
    });

    return () => {
      socket.off("sync_escape_state");
      socket.off("timer_update");
      socket.off("receive_tactical_msg", handleGlobalMsg);
      socket.off("room_cleared");
      socket.off("solve_error");
      socket.off("mission_accomplished");
      socket.off("escape_game_over");
    };
  }, [isChatOpen, userData?.username]);

  return (
    <div className="h-screen bg-[#050810] flex relative overflow-hidden font-mono text-white w-full">
      <div className="flex-1 flex flex-col relative overflow-hidden w-full">
        
        {/* الهيدر العلوي المتجاوب عمودياً في الجوال */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-8 py-3 sm:py-4 bg-[#080c16] border-b border-[#00ff9610] gap-3 flex-shrink-0 w-full">
          <div className="flex items-center gap-3 sm:gap-6 w-full sm:w-auto">
            <button 
              onClick={handleBackClick}
              className="p-2 bg-white/5 hover:bg-red-500/20 border border-white/10 rounded-full transition-all text-gray-500 hover:text-red-500 group flex-shrink-0"
              title="Abort Mission"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <div className="flex flex-col text-left truncate">
              <span className="text-[9px] text-[#00ff96] font-black tracking-[0.2em] sm:tracking-[0.3em] uppercase">⬡ Mission_Active</span>
              <h2 className="text-sm sm:text-lg font-black italic uppercase truncate">Room_0{roomIdx + 1}: {roomData?.title || "Initializing..."}</h2>
            </div>
          </div>
          
          <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-5 w-full sm:w-auto border-t border-white/5 sm:border-0 pt-2 sm:pt-0">
            <div className="text-left">
              <p className="text-[8px] text-gray-500 uppercase font-black">Agent_Specialty</p>
              <p className="text-cyan-400 text-xs sm:text-sm font-black italic truncate max-w-[120px] sm:max-w-none">{currentRole}</p>
            </div>
            <div className="bg-[#0d1a0d] border border-[#00ff9630] px-3 py-1 sm:px-5 rounded-sm flex-shrink-0">
              <span className="font-mono text-lg sm:text-2xl font-bold text-[#00ff96]">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </span>
            </div>
          </div>
        </header>

        {/* المساحة الرئيسية المخصصة للغرف الأربعة */}
        <main className="flex-1 p-4 sm:p-6 md:p-10 overflow-y-auto flex flex-col items-center custom-scrollbar w-full pt-16 sm:pt-10">
          <div className="w-full max-w-4xl mt-2 sm:mt-7"> 
            {roomIdx === 0 && <Room01Cipher sessionId={sessionId} myRole={currentRole} data={roomData} />}
            {roomIdx === 1 && <Room02Defender sessionId={sessionId} myRole={currentRole} data={roomData} />}
            {roomIdx === 2 && <Room03Logic sessionId={sessionId} myRole={currentRole} data={roomData} />}
            {roomIdx === 3 && <Room04Final sessionId={sessionId} myRole={currentRole} data={roomData} />}
          </div>
        </main>
      </div>

      {/* 🟢 [تثبيت الـ Z-Index]: تم رفع زر الـ Chat العائم لطبقة z-[99999] الإعجازية غصب عن أي كود لتضمنين بقاءه طائراً فوق كافة عناصر اللعبة بجمال */}
      {!isChatOpen && (
        <button 
          onClick={() => { setIsChatOpen(true); setUnreadCount(0); }}
          className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-[99999] p-4 sm:p-5 bg-[#00ff96] text-black rounded-2xl shadow-[0_0_30px_rgba(0,255,150,0.4)] hover:scale-110 transition-all border border-white/20 flex items-center justify-center"
        >
          <div className="relative">
            <MessageSquareCode size={24} sm:size={28} />
            {unreadCount > 0 && (
              <span className="absolute -top-5 -right-5 sm:-top-6 sm:-right-6 bg-red-600 text-white text-[9px] sm:text-[10px] font-black w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full animate-bounce border-2 border-[#050810]">
                {unreadCount}
              </span>
            )}
          </div>
        </button>
      )}

      {/* 🟢 [إصلاح الشات الطويل]: الحاوية الجانبية للشات الحين في الجوال تنفتح كصفحة (Drawer) كاملة العرض w-full لتمنع حشر ونقص الكلمات ومريحة بالقراءة والسوالف */}
      <div className={`fixed top-0 right-0 h-full z-[100000] w-full sm:w-80 transition-transform duration-500 ease-in-out transform ${isChatOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <button onClick={() => setIsChatOpen(false)} className="absolute top-4 right-4 z-[100010] p-2 text-gray-400 hover:text-white bg-black/40 rounded-full sm:bg-transparent transition-colors">
          <X size={20} />
        </button>
        
        <TacticalChat 
          sessionId={sessionId} 
          userData={userData} 
          messages={messages} 
        />
      </div>
    </div>
  );
};

export default MultiplayerEscapeRoom;