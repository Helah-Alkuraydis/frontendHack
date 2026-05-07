import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Mail, MapPin, Calendar, Save, ShieldCheck, Image as ImageIcon, ChevronDown } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { BASE_URL } from '../api/auth.js';

const AdminProfile = () => {
    const [profile, setProfile] = useState({
        username: '',
        email: '',
        role: '',
        name: '',
        region: 'Riyadh',
        birthdate: '', // تمت إضافة تاريخ الميلاد
        gender: 'Male', // تمت إضافة الجندر
        characterStyle: 'menAdmin.png',
        createdAt: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const avatars = ['menAdmin.png', 'womenAdmin.png'];

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${BASE_URL}/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                const fetchedAvatar = res.data.characterStyle;
                const finalAvatar = avatars.includes(fetchedAvatar) ? fetchedAvatar : 'menAdmin.png';

                // سحب البيانات الجديدة من الباك إند
                setProfile({
                    username: res.data.username || '',
                    email: res.data.email || '',
                    role: res.data.role || 'Admin',
                    name: res.data.name || '',
                    region: res.data.region || 'Riyadh',
                    birthdate: res.data.birthdate ? res.data.birthdate.split('T')[0] : '', // تنظيف صيغة التاريخ
                    gender: res.data.gender || 'Male',
                    characterStyle: finalAvatar,
                    createdAt: res.data.createdAt || ''
                });
            } catch (error) {
                console.error("Error fetching profile:", error);
                setMessage({ type: 'error', text: 'Failed to load profile data.' });
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('token');
            // إرسال البيانات الجديدة للباك إند
            await axios.put(`${BASE_URL}/auth/profile`, 
                {
                    name: profile.name,
                    region: profile.region,
                    birthdate: profile.birthdate,
                    gender: profile.gender,
                    characterStyle: profile.characterStyle
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessage({ type: 'success', text: 'Profile updated successfully! 🎉' });
            
            setTimeout(() => window.location.reload(), 1500); 
        } catch (error) {
            console.error("Error updating profile:", error);
            setMessage({ type: 'error', text: 'Failed to update profile. Check Backend Route!' });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <AdminLayout activePage="admin-profile"><div className="text-white text-center mt-20">Loading profile...</div></AdminLayout>;

    return (
        <AdminLayout activePage="admin-profile">
            <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
                
                <div className="bg-[#0b1221] border border-gray-800 rounded-[2rem] overflow-hidden shadow-2xl">
                    {/* Header Banner */}
                    <div className="h-32 bg-gradient-to-r from-blue-600/40 to-cyan-500/20 relative">
                        <div className="absolute -bottom-12 left-8 w-24 h-24 rounded-full border-4 border-[#0b1221] overflow-hidden bg-[#060a13] shadow-xl flex items-center justify-center">
                            <img src={`/${profile.characterStyle}`} alt="Avatar" className="w-[85%] h-[85%] object-contain" />
                        </div>
                    </div>

                    <div className="pt-16 px-8 pb-8">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h1 className="text-3xl font-black text-white">{profile.username}</h1>
                                <div className="flex items-center gap-2 mt-2 text-cyan-400 font-bold text-sm bg-cyan-500/10 w-fit px-3 py-1 rounded-full border border-cyan-500/20">
                                    <ShieldCheck size={16} />
                                    {profile.role.toUpperCase()}
                                </div>
                            </div>
                            <div className="text-right text-gray-500 text-xs font-medium">
                                <p>Joined HackHero</p>
                                <p className="text-gray-400 mt-1">{new Date(profile.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>

                        {message.text && (
                            <div className={`p-4 rounded-xl mb-6 font-bold text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Read-only Fields */}
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Username (Locked)</label>
                                    <div className="flex items-center gap-3 bg-[#050810] border border-gray-800 p-3 rounded-xl text-gray-400 cursor-not-allowed">
                                        <User size={18} />
                                        <span>{profile.username}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Email (Locked)</label>
                                    <div className="flex items-center gap-3 bg-[#050810] border border-gray-800 p-3 rounded-xl text-gray-400 cursor-not-allowed">
                                        <Mail size={18} />
                                        <span>{profile.email}</span>
                                    </div>
                                </div>

                                {/* Editable Fields */}
                                <div>
                                    <label className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-2 block">Display Name</label>
                                    <div className="flex items-center gap-3 bg-[#050810] border border-gray-700 focus-within:border-cyan-500 p-3 rounded-xl transition-colors">
                                        <User size={18} className="text-cyan-400" />
                                        <input 
                                            type="text" 
                                            value={profile.name} 
                                            onChange={(e) => setProfile({...profile, name: e.target.value})}
                                            className="bg-transparent border-none outline-none text-white w-full placeholder-gray-600"
                                            placeholder="Enter your real name"
                                        />
                                    </div>
                                </div>
                                
                                {/* Region Dropdown */}
                                <div>
                                    <label className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-2 block">Region</label>
                                    <div className="relative flex items-center gap-3 bg-[#050810] border border-gray-700 focus-within:border-cyan-500 p-3 rounded-xl transition-colors">
                                        <MapPin size={18} className="text-cyan-400 pointer-events-none" />
                                        <select 
                                            value={profile.region} 
                                            onChange={(e) => setProfile({...profile, region: e.target.value})}
                                            className="bg-transparent border-none outline-none text-white w-full appearance-none cursor-pointer"
                                        >
                                            <option value="Riyadh" className="bg-slate-900">Riyadh</option>
                                            <option value="Jeddah" className="bg-slate-900">Jeddah</option>
                                            <option value="Dammam" className="bg-slate-900">Dammam</option>
                                            <option value="Qassim" className="bg-slate-900">Qassim</option>
                                        </select>
                                        <ChevronDown size={16} className="text-gray-500 absolute right-3 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Birthdate Field */}
                                <div>
                                    <label className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-2 block">Birthdate</label>
                                    <div className="flex items-center gap-3 bg-[#050810] border border-gray-700 focus-within:border-cyan-500 p-3 rounded-xl transition-colors">
                                        <Calendar size={18} className="text-cyan-400" />
                                        <input 
                                            type="date" 
                                            value={profile.birthdate} 
                                            onChange={(e) => setProfile({...profile, birthdate: e.target.value})}
                                            className="bg-transparent border-none outline-none text-white w-full placeholder-gray-600 [color-scheme:dark]"
                                        />
                                    </div>
                                </div>

                                {/* Gender Dropdown */}
                                <div>
                                    <label className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-2 block">Gender Identity</label>
                                    <div className="relative flex items-center gap-3 bg-[#050810] border border-gray-700 focus-within:border-cyan-500 p-3 rounded-xl transition-colors">
                                        <User size={18} className="text-cyan-400 pointer-events-none" />
                                        <select 
                                            value={profile.gender} 
                                            onChange={(e) => setProfile({...profile, gender: e.target.value})}
                                            className="bg-transparent border-none outline-none text-white w-full appearance-none cursor-pointer"
                                        >
                                            <option value="Male" className="bg-slate-900">Male</option>
                                            <option value="Female" className="bg-slate-900">Female</option>
                                        </select>
                                        <ChevronDown size={16} className="text-gray-500 absolute right-3 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Avatar Selection */}
                            <div className="pt-6 border-t border-gray-800">
                                <label className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <ImageIcon size={16} className="text-cyan-400" />
                                    Choose Avatar
                                </label>
                                <div className="flex flex-wrap gap-4">
                                    {avatars.map((avatar) => (
                                        <div 
                                            key={avatar}
                                            onClick={() => setProfile({...profile, characterStyle: avatar})}
                                            className={`w-20 h-20 bg-[#060a13] rounded-xl cursor-pointer overflow-hidden border-2 transition-all flex items-center justify-center p-2 ${profile.characterStyle === avatar ? 'border-cyan-400 scale-110 shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'border-gray-800 hover:border-gray-600 opacity-50 hover:opacity-100'}`}
                                        >
                                            <img src={`/${avatar}`} alt="Avatar Option" className="w-full h-full object-contain" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-6 text-right">
                                <button 
                                    type="submit" 
                                    disabled={isSaving}
                                    className="bg-cyan-500 hover:bg-cyan-400 text-[#0b1221] font-black uppercase tracking-widest py-3 px-8 rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ml-auto"
                                >
                                    <Save size={20} />
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminProfile;