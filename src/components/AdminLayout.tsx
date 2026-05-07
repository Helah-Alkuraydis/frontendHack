import { useState, useEffect, ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  LayoutDashboard, Gamepad2, UserCog, Swords, 
  User, PanelLeftClose, PanelLeftOpen, Bell, Zap, LogOut, 
  Trophy
} from 'lucide-react';
// @ts-ignore
import '../styles/AdminStyles.css';
import NotificationsModal from './NotificationsModal'; 

interface AdminLayoutProps {
  children: ReactNode;
  activePage: string;
}

const AdminLayout = ({ children, activePage }: AdminLayoutProps) => {
  const [user, setUser] = useState<any>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false); 
  const [hasUnread, setHasUnread] = useState(false);     
  const navigate = useNavigate();

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
    } catch (err) { console.error(err); }
  };

  const checkNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get('http://localhost:5000/api/social/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHasUnread(res.data.some((n: any) => !n.isRead));
    } catch (err) {
      console.error("Error checking notifications", err);
    }
  };

  useEffect(() => {
    fetchAdminData();
    checkNotifications();
    const interval = setInterval(checkNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="admin-theme-wrapper admin-page-bg flex min-h-screen text-white font-sans items-stretch w-full">
      
      <aside className={`py-8 flex flex-col h-screen border-r border-gray-800/30 bg-[#050810] sticky top-0 transition-all duration-500
        ${isSidebarCollapsed ? 'w-24 px-2' : 'w-68 px-6'}`}>
        
        <div className="flex items-center justify-between mb-12 px-2">
          {!isSidebarCollapsed && (
            <div className="text-2xl font-black italic tracking-tighter ">HackHero</div>
          )}
          <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="p-2 rounded-lg hover:bg-white/10 transition-all text-gray-400 hover:text-white">
            {isSidebarCollapsed ? <PanelLeftOpen size={20}/> : <PanelLeftClose size={20}/>}
          </button>
        </div>

        <nav className="flex-1 flex flex-col space-y-2">
          <Link to="/admin/dashboard" className='block transition-all duration-500'><AdminNavItem icon={<LayoutDashboard size={20}/>} label="Dashboard" active={activePage === 'admin-dashboard'} isCollapsed={isSidebarCollapsed}/></Link>
          <Link to="/admin/games" className='block transition-all duration-500'><AdminNavItem icon={<Gamepad2 size={20}/>} label="Games Management" active={activePage === 'admin-games'} isCollapsed={isSidebarCollapsed}/></Link>
          <Link to="/admin/users" className='block transition-all duration-500'><AdminNavItem icon={<UserCog size={20}/>} label="User Management" active={activePage === 'admin-users'} isCollapsed={isSidebarCollapsed}/></Link>
          <Link to="/admin/notifications" className='block transition-all duration-500'><AdminNavItem icon={<Bell size={20}/>} label="Notifications" active={activePage === 'admin-notifications'} isCollapsed={isSidebarCollapsed}/></Link>
          <Link to="/admin/weekly-challenges" className='block transition-all duration-500'><AdminNavItem icon={<Swords size={20}/>} label="Weekly Challenges" active={activePage === 'admin-weekly'} isCollapsed={isSidebarCollapsed}/></Link>
          <Link to="/admin/public-challenges" className='block transition-all duration-500'><AdminNavItem icon={<Trophy size={20}/>} label="Public Challenges" active={activePage === 'admin-public'} isCollapsed={isSidebarCollapsed}/></Link>
          <Link to="/admin/profile" className='block transition-all duration-500'><AdminNavItem icon={<User size={20} />} label="Profile" active={activePage === 'admin-profile'} isCollapsed={isSidebarCollapsed} /></Link>
          
          <div className="mt-auto pt-6 border-t border-gray-800/30"> 
            <button onClick={() => { localStorage.removeItem('token'); navigate('/'); }} className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-all group w-full bg-transparent hover:bg-red-500/10 ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}>
              <div className="text-[#8a96a3] group-hover:text-red-500"><LogOut size={20} /></div>
              {!isSidebarCollapsed && <span className="text-sm tracking-wide text-[#8a96a3] group-hover:text-red-500 font-bold">Logout</span>}
            </button>
          </div>
        </nav>
      </aside>

      <main className="flex-1 px-8 md:px-16 py-8 overflow-y-auto w-full">
        <header className="flex justify-between items-center mb-10">
          <div className="text-blue-500/80 font-black uppercase tracking-[0.3em] text-[10px] italic"></div>
          <div className="flex items-center gap-6">
            
          

            <div className="flex items-center gap-4 bg-white/5 px-5 py-2.5 rounded-2xl border border-white/5 shadow-2xl backdrop-blur-md">
               <div className="flex items-center gap-2 text-yellow-500 font-black text-xs">
                 <span className="tracking-widest">ADMIN</span>
               </div>
               <div className="w-px h-6 bg-white/10 mx-1"></div>
               <span className="font-black italic text-sm tracking-tight text-white">{user?.username || "Admin"}</span>
               <div className="w-9 h-9 rounded-full border-2 border-blue-500 overflow-hidden shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                 <img src={user?.characterStyle ? `/${user.characterStyle}` : '/saudi-man.png'} className="w-full h-full object-cover" alt="Admin"/>
               </div>
            </div>
  <div className="relative cursor-pointer group" onClick={() => setIsNotifOpen(true)}>
              <Bell
                size={22}
                className={`${hasUnread ? 'text-blue-500 animate-pulse' : 'text-gray-500'} hover:text-white transition-colors`}
              />
              {hasUnread && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-[#0b1020] shadow-sm shadow-blue-500/50"></span>
              )}
            </div>
          </div>
        </header>
        
        {children}
      </main>

      {/* ✅ إضافة المودال في نهاية المكون */}
      <NotificationsModal
        isOpen={isNotifOpen}
        onClose={() => { setIsNotifOpen(false); checkNotifications(); }}
      />
    </div>
  );
};

const AdminNavItem = ({ icon, label, active, isCollapsed }: any) => (
  <div className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-all border-l-2 
    ${active 
      ? 'bg-gradient-to-r from-blue-600/20 to-transparent border-blue-600 text-white font-black italic' 
      : 'border-transparent text-gray-500 hover:bg-white/5 hover:text-white font-medium'} 
    ${isCollapsed ? 'justify-center px-0' : ''}`}>
    <div className={active ? 'text-blue-400' : 'opacity-70'}>{icon}</div>
    {!isCollapsed && <span className="text-sm tracking-wide uppercase text-[11px] font-bold">{label}</span>}
  </div>
);

export default AdminLayout;