// src/components/NotificationsModal.tsx
import { useState, useEffect, } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { X, Check, BellOff, Loader2, UserPlus, Gamepad2, ShieldAlert } from 'lucide-react';
import Swal from 'sweetalert2';
import { socket } from '../socket';

const NotificationsModal = ({ isOpen, onClose }: any) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  const Toast = Swal.mixin({
    background: '#0f172a',
    color: '#fff',
    confirmButtonColor: '#ff3b6b',
    cancelButtonColor: '#1e293b',
  });

  const markAllAsRead = async (notifList: any[]) => {
    const unreadIds = notifList.filter(n => !n.isRead).map(n => n._id);
    if (unreadIds.length === 0) return;

    try {
      await Promise.all(unreadIds.map(id =>
        axios.put(`http://localhost:5000/api/social/notifications/${id}/read`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ));
    } catch (err) {
      console.error("Error marking all as read", err);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/social/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data);
      markAllAsRead(res.data);
    } catch (err) {
      console.error("Error fetching notifications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchNotifications();
  }, [isOpen]);

  const markAsRead = async (notifId: string) => {
    try {
      await axios.put(`http://localhost:5000/api/social/notifications/${notifId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const handleAccept = async (notif: any) => {
    try {
      const requestId = notif.friendshipId;
      if (!requestId) return;

      await axios.put(`http://localhost:5000/api/social/friends/accept/${requestId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setNotifications(prev => prev.filter(n => n._id !== notif._id));
      await markAsRead(notif._id);

      Toast.fire({ icon: 'success', title: 'Accepted!', text: 'You are now friends! 🎉', timer: 2000, showConfirmButton: false });
    } catch (err) {
      Toast.fire({ icon: 'error', title: 'Error', text: 'Could not accept request.' });
    }
  };

  const handleReject = async (notif: any) => {
    const result = await Toast.fire({
      title: 'Are you sure?',
      text: "Reject this friend request?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, reject'
    });

    if (result.isConfirmed) {
      try {
        const requestId = notif.friendshipId;
        if (requestId) {
          await axios.delete(`http://localhost:5000/api/social/friends/${requestId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
        }
        setNotifications(prev => prev.filter(n => n._id !== notif._id));
        await markAsRead(notif._id);
        Toast.fire({ icon: 'info', title: 'Rejected', timer: 1500, showConfirmButton: false });
      } catch (err) {
        Toast.fire({ icon: 'error', title: 'Error' });
      }
    }
  };

  // 🔥 هذا هو الحل: تسجيل اللاعب في السوكيت على مستوى الموقع كامل 🔥
  useEffect(() => {
    if (!socket) return;

    const registerSocket = () => {
      const userString = localStorage.getItem("user");
      const userData = userString ? JSON.parse(userString) : null;
      if (userData?._id) {
        socket.emit("register_user", userData._id);
        console.log("🌐 Agent registered globally:", userData.username);
      }
    };

    // تسجيل فوري إذا كان السوكيت متصل
    if (socket.connected) {
      registerSocket();
    } else {
      socket.connect();
    }

    // إعادة التسجيل لو فصل السوكيت ورجع شبك
    socket.on("connect", registerSocket);

    return () => {
      socket.off("connect", registerSocket);
    };
  }, []);

const handleJoinGame = async (notif: any) => {
  try {
    const sessionMatch = notif.messageContent.match(/\[ID:([\w-]+)\]/);
    const sId = sessionMatch ? sessionMatch[1].trim() : null;

    if (sId) {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/multiplayer/join/${sId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      socket.emit("join_room", sId);
      navigate(`/waiting-room/${sId}`);
      await markAsRead(notif._id);
      onClose();
    } else {
      console.error("❌ Session ID missing in message:", notif.messageContent);
    }
  } catch (err) {
    console.error("❌ Join error:", err);
  }
};

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10005] flex justify-end p-6 pointer-events-none">
      <div className="absolute inset-0 bg-black/20 pointer-events-auto" onClick={onClose}></div>

      <div className="relative w-full max-w-sm bg-[#0f172a] border border-white/10 rounded-[2rem] shadow-2xl pointer-events-auto flex flex-col h-fit max-h-[80vh] overflow-hidden animate-in slide-in-from-right">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#1e293b]/50">
          <h3 className="font-black italic uppercase tracking-wider text-sm">Notifications</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {loading ? (
            <div className="py-10 text-center"><Loader2 className="animate-spin mx-auto text-[#ff3b6b]" /></div>
          ) : notifications.length === 0 ? (
            <div className="py-10 text-center opacity-30">
              <BellOff size={40} className="mx-auto mb-2" />
              <p className="text-xs font-bold italic">No new notifications</p>
            </div>
          ) : (
            notifications.map((notif) => {
              const isSystem = notif.notificationId?.type === 'System';
                  const isGameInvite = 
                      notif.type === "GameInvite" || 
                      notif.notificationId?.mType === "GameInvite" || 
                      notif.notificationId?.title === "GAME_START_INVITE"; 
                 const isFriendRequest = !!notif.friendshipId && !isGameInvite;

              return (
                <div key={notif._id} className={`p-4 rounded-2xl border transition-all ${notif.isRead ? 'bg-white/5 border-white/5 opacity-50' : isSystem
                  ? 'bg-red-500/5 border-red-500/20 shadow-lg'
                  : 'bg-white/10 border-[#ff3b6b]/20 shadow-lg'
                  }`}>
                  <div className="flex items-start gap-3 mb-4">
                    {isSystem ? (
                      <ShieldAlert size={18} className="text-red-500 mt-0.5 animate-pulse" />
                    ) : isGameInvite ? (
                      <Gamepad2 size={16} className="text-blue-400 mt-0.5" />
                    ) : (
                      <UserPlus size={16} className="text-[#ff3b6b] mt-0.5" />
                    )}

                    <div className="flex-1">
                      <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest mt-1 block mb-1.5">
                        {notif.notificationId?.title || (isSystem ? "SYSTEM_ALERT" : isGameInvite ? "GAME_INVITE" : "NOTIFICATION")}
                      </span>
                      <p className={`text-xs font-medium leading-relaxed ${isSystem ? 'text-white' : 'text-gray-200'}`}>
                        {isGameInvite
                          ? notif.messageContent.replace(/\[ID:.+?\]/, "").trim()
                          : notif.messageContent}
                      </p>

                    </div>
                  </div>

                  {!notif.isRead && (
                    <div className="flex gap-2">
                      {/* حالة 1: دعوة لعبة */}
                      {isGameInvite ? (
                        <>
                          <button
                            onClick={() => handleJoinGame(notif)}
                            className="flex-1 bg-blue-600 text-[10px] font-black uppercase py-2 rounded-lg flex items-center justify-center gap-1 hover:bg-blue-500 transition-all shadow-lg"
                          >
                            <Check size={12} /> Join Mission
                          </button>
                          <button
                            onClick={async () => {
                              await markAsRead(notif._id);
                              setNotifications(prev => prev.filter(n => n._id !== notif._id));
                            }}
                            className="flex-1 bg-white/5 text-[10px] font-black uppercase py-2 rounded-lg hover:bg-white/10 text-gray-400 transition-all border border-white/5"
                          >
                            Ignore
                          </button>
                        </>
                      )
                        /* حالة 2: طلب صداقة */
                        : isFriendRequest ? (
                          <>
                            <button
                              onClick={() => handleAccept(notif)}
                              className="flex-1 bg-[#ff3b6b] text-[10px] font-black uppercase py-2 rounded-lg flex items-center justify-center gap-1 hover:scale-105 transition-transform shadow-lg shadow-[#ff3b6b]/20"
                            >
                              <Check size={12} /> Accept
                            </button>
                            <button
                              onClick={() => handleReject(notif)}
                              className="flex-1 bg-white/5 text-[10px] font-black uppercase py-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all border border-white/5"
                            >
                              Reject
                            </button>
                          </>
                        ) : null}
                    </div>
                  )}

                  {/* حالة تمت القراءة */}
                  {notif.isRead && (
                    <div className="text-[10px] font-bold text-gray-600 italic uppercase tracking-tighter">
                      Seen
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsModal;