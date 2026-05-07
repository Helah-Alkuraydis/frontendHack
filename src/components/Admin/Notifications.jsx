import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiSend, FiClock, FiX } from 'react-icons/fi';
import AdminLayout from '../AdminLayout'; 
import '../../styles/AdminStyles.css';
import Swal from 'sweetalert2'; 

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
    target: 'Players', 
    content: '',
    specificUser: '', 
    isScheduled: false,
    scheduledDate: ''
});

const [searchResults, setSearchResults] = useState([]);
const [isSearching, setIsSearching] = useState(false);

useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
        if (formData.specificUser.length > 1) {
            handleSearch(formData.specificUser);
        } else {
            setSearchResults([]);
        }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
}, [formData.specificUser]);

const handleSearch = async (query) => {
    try {
        const res = await axios.get(`${BASE_URL}/admin-task/users/search?q=${query}`);
        setSearchResults(res.data);
    } catch (err) {
        console.error("Search failed");
    }
};

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/admin-task/notifications/history`);
            setNotifications(res.data);
        } catch (err) {
            console.error("Error fetching notifications");
        }
    };

 const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.isScheduled && new Date(formData.scheduledDate) < new Date().setHours(0,0,0,0)) {
        return Swal.fire({
            title: 'TIME PARADOX DETECTED',
            text: 'Cannot schedule a mission in the past. Select a future date.',
            icon: 'warning',
            background: '#050810',
            color: '#fff',
            confirmButtonColor: '#ff2d55'
        });
    }
    
    try {
        await axios.post(`${BASE_URL}/admin-task/notifications/send`, {
            target: formData.target,
            content: formData.content,
            specificUser: formData.specificUser, 
            isScheduled: formData.isScheduled,
            scheduledDate: formData.scheduledDate
        });
        
        Swal.fire({
            title: 'SEND NOTIFICATION ACCOMPLISHED',
            text: formData.isScheduled ? 'Notification has been scheduled!' : 'Notification has been broadcasted!',
            icon: 'success',
            background: '#050810',
            color: '#fff',
            confirmButtonColor: '#ff2d55'
        });

        setShowModal(false);
        fetchNotifications(); 
        setFormData({ target: 'Players', content: '', specificUser: '', isScheduled: false, scheduledDate: '' });    } catch (err) {
        Swal.fire('SYSTEM BREACH', err.response?.data?.message || 'Failed to send notification', 'error');
    }
};

    const modalOverlayStyle = { /* ... نفس كودك ... */ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' };
    const modalContentStyle = { backgroundColor: '#111827', padding: '35px', borderRadius: '30px', width: '500px', color: 'white', border: '1px solid rgba(255, 255, 255, 0.05)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' };
    const inputStyle = { width: '100%', padding: '14px', marginBottom: '20px', backgroundColor: '#1f2937', color: 'white', border: '1px solid #374151', borderRadius: '15px' };
    const btnNewStyle = { backgroundColor: '#ff2d55', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '25px', cursor: 'pointer', fontWeight: '900', fontStyle: 'italic', textTransform: 'uppercase', fontFamily: "'Montserrat', sans-serif", display: 'flex', alignItems: 'center', gap: '10px' };

    return (
        <AdminLayout activePage="admin-notifications">
            <div style={{ fontFamily: "'Inter', sans-serif" }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <h2 style={{ fontSize: '36px', fontFamily: "'Montserrat', sans-serif", fontWeight: '900', fontStyle: 'italic', textTransform: 'uppercase', letterSpacing: '-1.5px', color: 'white', margin: 0 }}>
                        Notification History
                    </h2>
                    <button style={btnNewStyle} onClick={() => setShowModal(true)}>
                        <FiPlus /> New Notification
                    </button>
                </div>

                <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '20px', padding: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                   <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', tableLayout: 'fixed' }}> {/* 👈 أضفنا tableLayout: 'fixed' للتحكم التام */}
    <thead>
        <tr style={{ color: '#8b949e', borderBottom: '1px solid rgba(255,255,255,0.1)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px' }}>
            <th style={{ padding: '20px', width: '10%' }}>Target</th>
            <th style={{ padding: '20px', width: '60%' }}>Message</th> 
            <th style={{ padding: '20px', width: '10%' }}>Status</th>
            <th style={{ padding: '20px', width: '20%' }}>Date</th>
        </tr>
    </thead>
    <tbody style={{ fontSize: '14px' }}>
        {notifications.map(n => (
            <tr key={n._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <td style={{ padding: '20px', fontWeight: '800', color: '#3b82f6' }}>{n.target}</td>
                
                <td style={{ 
    color: '#e5e7eb', 
    paddingRight: '40px', 
    paddingTop: '20px',
    paddingBottom: '20px',
    lineHeight: '1.6', 
    wordWrap: 'break-word', 
    overflowWrap: 'break-word',
    textAlign: 'justify' 
}}>
    {n.content}
</td>

                <td>
                    <span style={{ 
                        padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold',
                        backgroundColor: n.status === 'Sent' ? 'rgba(0, 255, 127, 0.1)' : 'rgba(255, 204, 0, 0.1)',
                        color: n.status === 'Sent' ? '#00ff7f' : '#ffcc00' 
                    }}>
                        {n.status}
                    </span>
                </td>

                <td style={{ color: '#6b7280' }}>
                    {n.status === 'Scheduled' ? (
                        <div className="flex flex-col">
                            <span className="text-yellow-500 font-bold text-[10px] uppercase tracking-tighter">Scheduled For:</span>
                            <span className="text-white font-medium">
                                {new Date(n.scheduledDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            <span className="text-gray-600 text-[10px] uppercase tracking-tighter">Sent On:</span>
                            <span>
                                {new Date(n.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                        </div>
                    )}
                </td>
            </tr>
        ))}
    </tbody>
</table>
                </div>

                {showModal && (
                    <div style={modalOverlayStyle} onClick={() => setShowModal(false)}>
                        <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '900', fontStyle: 'italic', textTransform: 'uppercase', fontFamily: "'Montserrat', sans-serif", color: '#ff2d55' }}>
                                    Create New Notification
                                </h3>
                                <button style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer' }} onClick={() => setShowModal(false)}>
                                    <FiX size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <label style={{ display: 'block', color: '#6b7280', marginBottom: '8px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}>
    Target Group
</label>
<select 
    style={inputStyle} 
    value={formData.target} 
    onChange={(e) => setFormData({...formData, target: e.target.value})}
>
    <option value="Players">All Players</option>
    <option value="Specific">Specific Player</option>
</select>

{formData.target === 'Specific' && (
    <div className="relative animate-in fade-in slide-in-from-top-2 duration-300">
        <label style={{ display: 'block', color: '#6b7280', marginBottom: '8px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}>
            Operative Identifier
        </label>
        
        <input 
            type="text" 
            placeholder="Type username or email..." 
            style={inputStyle}
            value={formData.specificUser}
            onChange={(e) => setFormData({...formData, specificUser: e.target.value})}
            autoComplete="off" 
        />

        {searchResults.length > 0 && (
            <div className="absolute top-[85px] left-0 w-full bg-[#111827] border border-white/10 rounded-xl z-[9999] shadow-2xl overflow-hidden shadow-blue-500/10">
                {searchResults.map((user) => (
                    <div 
                        key={user._id} 
                        onClick={() => {
                            setFormData({...formData, specificUser: user.email});
                            setSearchResults([]); 
                        }}
                        className="flex items-center gap-3 p-3 hover:bg-blue-600/20 cursor-pointer border-b border-white/5 last:border-0 group transition-colors"
                    >
                        <div className="w-8 h-8 rounded-full border border-white/10 overflow-hidden bg-blue-500/10">
                            <img 
                                src={`/${user.characterStyle || 'saudi-man.png'}`} 
                                className="w-full h-full object-cover"
                                alt="Agent"
                            />
                        </div>
                        <div>
                            <div className="text-xs font-black text-white group-hover:text-blue-400">{user.username}</div>
                            <div className="text-[10px] text-gray-500">{user.email}</div>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
)}
                                <label style={{ display: 'block', color: '#6b7280', marginBottom: '8px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}>Message Content</label>
                                <textarea style={{...inputStyle, height: '100px', resize: 'none'}} placeholder="Enter content of message..." value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} required />

                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                    <input type="checkbox" id="schedule" checked={formData.isScheduled} onChange={(e) => setFormData({...formData, isScheduled: e.target.checked})} style={{ width: '18px', height: '18px', accentColor: '#ff2d55' }} />
                                    <label htmlFor="schedule" style={{ color: '#9ca3af', fontSize: '14px' }}>Enable Delayed Transmission?</label>
                                </div>

                                {formData.isScheduled && (
                                    <input 
                                        type="date" 
                                        style={inputStyle} 
                                        min={new Date().toISOString().split('T')[0]} 
                                        onChange={(e) => setFormData({...formData, scheduledDate: e.target.value})} 
                                        required 
                                    />
                                )}

                                <button type="submit" style={{ width: '100%', backgroundColor: '#ff2d55', color: 'white', border: 'none', padding: '15px', borderRadius: '15px', cursor: 'pointer', fontWeight: '900', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                    <FiSend /> {formData.isScheduled ? 'Schedule Notification' : 'Send Notification'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default Notifications;