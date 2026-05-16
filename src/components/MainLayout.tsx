// src/components/MainLayout.tsx
import { useState, useEffect, ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Home, Gamepad2, Users, LayoutDashboard, Trophy, Swords,
  User, PanelLeftClose, PanelLeftOpen, Bell, Zap,
  LogOut
} from 'lucide-react';
import NotificationsModal from './NotificationsModal';
import { socket } from '../socket';
import Swal from "sweetalert2";
import { BASE_URL } from '../api/auth.js';


interface MainLayoutProps {
  children: ReactNode;
  activePage: string;
  headerActions?: ReactNode;
  highlightedId?: string;
  forceHideGlow?: boolean;
}

const MainLayout = ({ children, activePage, headerActions, highlightedId ,forceHideGlow}: MainLayoutProps) => {
  const [user, setUser] = useState<any>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const navigate = useNavigate();
  const [hasUnseenAchievements, setHasUnseenAchievements] = useState(false);
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await axios.get("https://hackhero-api.onrender.com/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const checkNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get(`${BASE_URL}/social/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHasUnread(res.data.some((n: any) => !n.isRead));
    } catch (err) {
      console.error("Error checking notifications", err);
    }
  };
  const checkUnseenAchievements = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get(`${BASE_URL}/achievements/unseen`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success && res.data.data.length > 0) {
        setHasUnseenAchievements(true);
      }else {
      setHasUnseenAchievements(false); // 👈 ضروري عشان يطفيه إذا مافي شيء
    }
    } catch (err) {
      console.error("Error checking achievements", err);
    }
  };
  useEffect(() => {
    fetchUserData();
    checkNotifications();
    checkUnseenAchievements();
    const interval = setInterval(checkNotifications, 30000);
    const handleSeenEvent = () => setHasUnseenAchievements(false);
    window.addEventListener("achievementsSeen", handleSeenEvent);
    return () => {
      clearInterval(interval);
      // 👈 تنظيف الـ Event Listener عند الخروج
      window.removeEventListener("achievementsSeen", handleSeenEvent);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };


useEffect(() => {
  if (user?._id) {
    socket.connect();
    socket.emit("register_user", user._id);

    socket.on("receive_game_invite", (data) => {
      setHasUnread(true);
      checkNotifications();
      console.log("New invite received from:", data.senderName);

      Swal.fire({
        title: "🎮 MISSION INVITATION!",
        text: `Agent [ ${data.senderName} ] has invited you to join: ${data.gameName}`,
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "ACCEPT MISSION 🛡️",
        cancelButtonText: "DECLINE",
        confirmButtonColor: "#ff3b6b", 
        cancelButtonColor: "#1e293b",
        background: "#0f172a",
        color: "#fff",
        customClass: {
          popup: 'rounded-[2rem] border border-white/10 shadow-2xl font-sans'
        }
      }).then((result) => {
        if (result.isConfirmed) {
          navigate(`/waiting-room/${data.sessionId}`);
        }
      });
    });
  }

  return () => {
    socket.off("receive_game_invite");
    socket.disconnect();
  };
}, [user, navigate]);

  return (
    <div className="flex min-h-screen bg-[#050810] text-white font-sans overflow-x-hidden relative w-full">

      <aside
        className={`py-8 flex flex-col h-screen border-r border-gray-800/30 bg-[#050810] sticky top-0 transition-all duration-500
  ${highlightedId ? 'z-[100005]' : 'z-[100]'} 
  ${isSidebarCollapsed ? 'w-24 px-2' : 'w-64 px-6'}`}
      >
        <div className="flex items-center justify-between mb-12">
          {!isSidebarCollapsed && (
            <div className="text-2xl font-black italic tracking-tighter">HackHero</div>
          )}
          <button
            onClick={() => setIsSidebarCollapsed(prev => !prev)}
            className="p-2 rounded-lg hover:bg-white/5 transition-all duration-300"
          >
            {isSidebarCollapsed ? <PanelLeftOpen size={20} className="text-gray-400 hover:text-white" /> : <PanelLeftClose size={20} className="text-gray-400 hover:text-white" />}          </button>
        </div>

        <nav className="flex-1 flex flex-col space-y-4">
          <Link
            to="/home"
            className={`block transition-all duration-500 ${highlightedId ? 'tour-blur-out pointer-events-none' : ''}`}
          >
            <NavItem
              icon={<Home size={20} />}
              label="Home"
              active={activePage === 'home'}
              isCollapsed={isSidebarCollapsed}
            />
          </Link>

          <Link to="/games" id="games-step" className={`transition-all duration-500 rounded-xl block ${highlightedId === 'games-step' ? 'tour-spotlight-active' : (highlightedId ? 'tour-blur-out' : '')}`}>
            <NavItem icon={<Gamepad2 size={20} />} label="Games" active={activePage === 'games'} isCollapsed={isSidebarCollapsed} />
          </Link>


          <Link to="/challenges" id="challenge-step" className={`transition-all duration-500 rounded-xl block ${highlightedId === 'challenge-step' ? 'tour-spotlight-active' : (highlightedId ? 'tour-blur-out' : '')}`}>

            <NavItem icon={<Swords size={20} />} label="Challenge" active={activePage === 'challenge'} isCollapsed={isSidebarCollapsed} />
          </Link>
          <Link
            to="/achievements"
            id="achievements-step"
            className={`transition-all duration-500 rounded-xl block 
              ${highlightedId === 'achievements-step' ? 'tour-spotlight-active' : (highlightedId ? 'tour-blur-out' : '')}
              ${(hasUnseenAchievements&& !forceHideGlow)
                ? 'border-2 border-cyan-400 shadow-[0_0_35px_rgba(34,211,238,1),inset_0_0_15px_rgba(34,211,238,0.6)] bg-cyan-400/15 animate-pulse'
                : ''}
            `}
          >
            <NavItem
              icon={<Trophy size={20} />}
              label="Achievements"
              active={activePage === 'achievements'}
              isCollapsed={isSidebarCollapsed}
            />
          </Link>

          <Link
            to="/dashboard"
            id="dashboard-step"
            className={`transition-all duration-500 rounded-xl block ${highlightedId === 'dashboard-step' ? 'tour-spotlight-active' : (highlightedId ? 'tour-blur-out' : '')}`}
          >
            <NavItem
              icon={<LayoutDashboard size={20} />}
              label="Dashboard"
              active={activePage === 'dashboard'}
              isCollapsed={isSidebarCollapsed}
            />
          </Link>

          <Link
            to="/friends"
            id="friends-step"
            className={`transition-all duration-500 rounded-xl block ${highlightedId === 'friends-step' ? 'tour-spotlight-active' : (highlightedId ? 'tour-blur-out' : '')}`}
          >
            <NavItem
              icon={<Users size={20} />}
              label="Friends"
              active={activePage === 'friends'}
              isCollapsed={isSidebarCollapsed}
            />
          </Link>

          <Link
            to="/profile"
            id="profile-step"
            className={`transition-all duration-500 rounded-xl block ${highlightedId === 'profile-step' ? 'tour-spotlight-active' : (highlightedId ? 'tour-blur-out' : '')}`}
          >
            <NavItem
              icon={<User size={20} />}
              label="Profile"
              active={activePage === 'profile'}
              isCollapsed={isSidebarCollapsed}
            />
          </Link>



          <div className={`mt-auto pt-6 border-t border-gray-800/30 ${highlightedId ? 'tour-blur-out' : ''}`}>            <button onClick={handleLogout} className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-all group w-full bg-transparent hover:bg-red-500/10 ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}>
            <div className="text-[#8a96a3] group-hover:text-red-500"><LogOut size={20} /></div>
            {!isSidebarCollapsed && <span className="text-sm tracking-wide text-[#8a96a3] group-hover:text-red-500 font-bold">Logout</span>}
          </button>
          </div>
        </nav>
      </aside>

      <main className="flex-1 px-8 md:px-16 py-8 overflow-y-auto w-full transition-all duration-500">
        <header className="flex justify-between items-center mb-10 w-full">
          <div className="flex-shrink-0">{headerActions}</div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 bg-[#1c2438] px-5 py-2.5 rounded-2xl border border-white/5 shadow-2xl">
              <div className="flex items-center gap-2 px-2 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <Zap size={14} className="text-yellow-500 fill-yellow-500" />
                <span className="text-xs font-black text-yellow-500 tracking-wider">{user?.totalScore || 0} XP</span>
              </div>
              <div className="w-px h-6 bg-white/10 mx-1"></div>

              <span className="text-white font-black italic text-sm tracking-wide">
                {user?.username || "Guest"}
              </span>

              <div className="w-9 h-9 rounded-full border border-blue-600/50 flex items-center justify-center bg-blue-600/10 overflow-hidden shadow-lg">
                <img
                  src={user?.characterStyle ? `/${user.characterStyle}` : '/saudi-man.png'}
                  className="w-full h-full object-cover"
                  alt="User"
                />
              </div>
            </div>

            <div className="relative cursor-pointer group" onClick={() => setIsNotifOpen(true)}>
              <Bell
                size={20}
                className={`${hasUnread ? 'text-[#ff3b6b] animate-pulse' : 'text-gray-500'} hover:text-white transition-colors`}
              />
              {hasUnread && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#ff3b6b] rounded-full border-2 border-[#050810] shadow-sm shadow-[#ff3b6b]/50"></span>
              )}
            </div>
          </div>
        </header>
        {children}
      </main>

      <NotificationsModal
        isOpen={isNotifOpen}
        onClose={() => { setIsNotifOpen(false); checkNotifications(); }}
      />
    </div>
  );
};

const NavItem = ({ icon, label, active, isCollapsed, isDanger }: any) => (
  <div className={`flex items-center gap-4 px-3 py-3 rounded-xl cursor-pointer transition-all duration-300 group 
    ${active ? 'bg-gradient-to-r from-[#ff3b6b]/20 to-transparent border-l-2 border-[#ff3b6b]' : 'hover:bg-white/5'} 
    ${isCollapsed ? 'justify-center px-0' : ''}`}>
    <div className={`${active ? 'text-[#ff3b6b]' : isDanger ? 'text-red-500 group-hover:text-red-400' : 'text-[#8a96a3] group-hover:text-white'}`}>{icon}</div>
    {!isCollapsed && (
      <span className={`text-sm tracking-wide ${active ? 'text-white font-black' : isDanger ? 'text-red-500 group-hover:text-red-400 font-bold' : 'text-[#8a96a3] group-hover:text-white font-medium'}`}>
        {label}
      </span>
    )}
  </div>
);

export default MainLayout;