import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiSearch, FiTrash2, FiFlag, FiFilter } from 'react-icons/fi';
import AdminLayout from '../AdminLayout'; 
import '../../styles/AdminStyles.css';
import Swal from 'sweetalert2';
import { BASE_URL } from '../../api/auth.js';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const viewReport = (userId) => {
        navigate(`/admin/users/report/${userId}`);
    };
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/admin-task/users-management/all`);
            setUsers(res.data);
        } catch (err) {
            console.error("فشل الاتصال بالباك إند:", err);
        }
    };

   const deleteUser = async (id) => {
    const result = await Swal.fire({
        title: '<span style="font-family: Montserrat; font-weight: 900; font-style: italic;">DELETE AGENT?</span>',
        text: "This action will permanently remove the user from the HackHero database.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ff2d55', 
        cancelButtonColor: 'rgba(255,255,255,0.1)',
        confirmButtonText: 'YES, DELETE',
        cancelButtonText: 'CANCEL',
        background: '#050810', 
        color: '#fff',
        customClass: {
            popup: 'rounded-[2rem] border border-white/10 backdrop-blur-xl',
            confirmButton: 'rounded-full px-6 py-2 font-black italic',
            cancelButton: 'rounded-full px-6 py-2 font-black italic'
        }
    });

    if (result.isConfirmed) {
        try {
            await axios.delete(`${BASE_URL}/admin-task/users-management/delete/${id}`);
            
            Swal.fire({
                title: 'DELETED!',
                text: 'Agent has been removed.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
                background: '#050810',
                color: '#fff'
            });

            fetchUsers();
        } catch (err) {
            Swal.fire({
                title: 'ERROR',
                text: 'Failed to delete the agent. System breach detected?',
                icon: 'error',
                background: '#050810',
                color: '#fff'
            });
        }
    }
};

    // --- الستايلات الموحدة (Montserrat & Inter) ---
    const pageTitleStyle = {
        fontSize: '36px',
        fontFamily: "'Montserrat', sans-serif",
        fontWeight: '900',
        fontStyle: 'italic',
        textTransform: 'uppercase',
        letterSpacing: '-1.5px',
        color: 'white',
        marginBottom: '40px'
    };

    return (
        <AdminLayout activePage="admin-users">

        <div style={{ color: 'white', fontFamily: "'Inter', sans-serif" }}>
            {/* العنوان المائل والضخم   */}
            <h1 style={pageTitleStyle}>Recent Users</h1>

            {/* --- بار البحث --- */}
            <div style={{ position: 'relative', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                <FiFilter style={{ fontSize: '24px', color: '#8b949e', cursor: 'pointer' }} />
                <div style={{ position: 'relative', flex: 1, maxWidth: '500px' }}>
                    <input 
                        type="text" 
                        placeholder="Enter ID or name for search"
                        style={{
                            width: '100%', padding: '12px 20px', borderRadius: '30px',
                            backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                            color: 'white', outline: 'none', paddingLeft: '45px',
                            fontFamily: "'Inter', sans-serif"
                        }}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <FiSearch style={{ position: 'absolute', left: '15px', top: '15px', color: '#8b949e' }} />
                </div>
            </div>

            {/* --- حاوية الجدول --- */}
            <div style={{ 
                background: 'rgba(13, 17, 23, 0.6)', 
                borderRadius: '30px', 
                border: '1px solid rgba(255,255,255,0.05)',
                padding: '20px',
                backdropFilter: 'blur(10px)'
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ color: '#8b949e', borderBottom: '1px solid rgba(255,255,255,0.1)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                <th style={{ padding: '20px' }}>Name</th>
                                <th>Email</th>
                                <th>Score (XP)</th> {/* 🟢 تم تحديث المسمى */}
                                <th>Status</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody style={{ fontSize: '14px' }}>
                            {users
                                .filter(u => (u.username || "").toLowerCase().includes(searchTerm.toLowerCase()))
                                .map((user) => (
                                    <tr key={user._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: '0.3s' }}>
                                        <td style={{ padding: '20px', fontWeight: '600' }}>{user.username}</td>
                                        <td style={{ color: '#8b949e' }}>{user.email}</td>
                                        
                                        {/* 🟢 التغيير الجوهري هنا: نستخدم totalScore الذي وفره الـ aggregate */}
                                        <td style={{ color: '#ffcc00', fontWeight: 'bold', fontSize: '18px' }}>
                                            {user.totalScore} <span style={{ fontSize: '10px', opacity: 0.6 }}>XP</span>
                                        </td>

                                        <td>
                                            <span style={{ 
                                                backgroundColor: user.isActive !== false ? 'rgba(0, 255, 127, 0.2)' : 'rgba(139, 148, 158, 0.2)',
                                                color: user.isActive !== false ? '#00ff7f' : '#8b949e',
                                                padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold'
                                            }}>
                                                {user.isActive !== false ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td style={{ color: '#8b949e' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <button onClick={() => deleteUser(user._id)} style={btnStyle('rgba(188, 47, 47, 0.93)')}><FiTrash2 /> Delete</button>
                                                <button onClick={() => viewReport(user._id)} style={btnStyle('#3b82f6')}><FiFlag /> Report</button>                               
                                     </div>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                
                {users.length === 0 && (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#8b949e' }}>
                        No agents found in database. Check backend connection.
                    </div>
                )}
            </div>
        </div>
            </AdminLayout>

    );
};

const btnStyle = (bg) => ({
    backgroundColor: bg, 
    color: 'white', 
    border: 'none', 
    padding: '8px 16px', 
    borderRadius: '12px', 
    cursor: 'pointer', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '5px', 
    fontSize: '12px',
    fontWeight: 'bold',
    fontFamily: "'Inter', sans-serif",
    transition: '0.2s'
});

export default UserManagement;