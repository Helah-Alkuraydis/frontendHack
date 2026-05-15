import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2'; 
import MainLayout from '../components/MainLayout';
import { User, Mail, Calendar, Globe, Shield, UserCircle, Save, Eye, CheckCircle2 } from 'lucide-react';
import { socket } from "../socket";
import { BASE_URL } from '../api/auth.js';

const SAUDI_REGIONS = [
  "Riyadh", "Makkah", "Madinah", "Eastern Province", "Qassim", 
  "Asir", "Tabuk", "Hail", "Northern Borders", "Jazan", 
  "Najran", "Al-Baha", "Al-Jouf"
];

const CHARACTER_IMAGES = [
  "Avatar.png", "saudi-man.png", "man1.png", "Women1.png", "Women2.png", "Women3.png"
];

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    birthdate: '',
    gender: 'female',
    region: 'Riyadh',
    isTechnical: true,
    onlineStatus: 'Public',
    characterStyle: 'saudi-man.png' 
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const data = res.data;
        setFormData({
          ...data,
          characterStyle: data.characterStyle || 'saudi-man.png',
          birthdate: (data.birthdate && !isNaN(Date.parse(data.birthdate))) 
            ? new Date(data.birthdate).toISOString().split('T')[0] 
            : ''
        });
      } catch (err) {
        console.error("Fetch profile error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const res = await axios.put(`${BASE_URL}/auth/update-profile`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

   const updatedUserData = { 
        ...JSON.parse(localStorage.getItem('user') || '{}'), 
        ...formData 
    };
    localStorage.setItem('user', JSON.stringify(updatedUserData)); 

    socket.emit("register_user", {
      userId: updatedUserData._id,
      onlineStatus: formData.onlineStatus 
    });
      Swal.fire({
        icon: 'success',
        title: 'Update Profile',
        background: '#121620',
        color: '#fff',
        confirmButtonColor: '#3b82f6',
        timer: 2000
      });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Update Failed', background: '#121620', color: '#fff' });
    } finally {
      setSaving(false);
    }
  };



  return (
    <MainLayout activePage="profile">
      {/* تقليل الحواف الجانبية في الجوال px-4 بدال px-6 */}
      <div className="max-w-6xl mx-auto space-y-8 md:space-y-12 pb-20 px-4 md:px-6">
        
        {/* تقليل مساحة البادينق (p-6) في الجوال بدال (p-10) عشان ما تضغط المحتوى */}
        <div className="relative bg-[#0d111a]/80 backdrop-blur-3xl border border-white/5 rounded-3xl md:rounded-[3rem] p-6 md:p-14 shadow-2xl overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"></div>
          
          {/* تصغير الـ gap بين الصورة والفورم في الجوال */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 relative z-10 items-center lg:items-start">
            
            {/* الجانب الأيسر: الصورة والمستوى */}
            <div className="flex flex-col items-center gap-4 md:gap-6 w-full lg:w-auto">
              <div className="relative">
                {/* تصغير حجم الصورة في الجوال لـ w-40 h-40 */}
                <div className="w-40 h-40 md:w-56 md:h-56 rounded-full md:rounded-[2.5rem] border-2 border-cyan-500/20 p-2 bg-[#1c2438]/60 shadow-[0_0_60px_rgba(6,182,212,0.1)] group-hover:border-cyan-500/40 transition-all duration-500">
                  <img src={`/${formData.characterStyle}`} className="w-full h-full object-contain" alt="Avatar" />
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-cyan-600 text-white text-[10px] md:text-[11px] font-black px-3 md:px-4 py-1.5 rounded-full shadow-xl border border-white/10 tracking-widest uppercase whitespace-nowrap">
               {formData.username} 
                </div>
              </div>
              
              <div className="w-full max-w-[220px] space-y-2 md:space-y-3 pt-2 md:pt-4">
                <div className="flex justify-between text-[10px] md:text-[11px] font-black text-gray-500 uppercase tracking-widest">
                  <span>Exp Progress</span>
                  <span className="text-cyan-400">80%</span>
                </div>
                <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-white/5 p-[1px]">
                  <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full w-[80%] shadow-[0_0_15px_rgba(6,182,212,0.4)]"></div>
                </div>
              </div>
            </div>

            {/* الجانب الأيمن: شبكة المعلومات */}
            {/* تصغير المسافات بين المدخلات بالجوال gap-y-5 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-5 md:gap-y-8 flex-1 w-full mt-4 md:mt-0">
              <ProfileInput label="Full Name" icon={<User size={18}/>} value={formData.name} onChange={(val: string) => setFormData({...formData, name: val})} />
              <ProfileInput label="Username" icon={<UserCircle size={18}/>} value={formData.username} readOnly />
              <ProfileInput label="Email Address" icon={<Mail size={18}/>} value={formData.email} readOnly />
              <ProfileInput label="Birthdate" icon={<Calendar size={18}/>} type="date" value={formData.birthdate} onChange={(val: string) => setFormData({...formData, birthdate: val})} />
              
              <ProfileSelect label="Region" icon={<Globe size={18}/>} options={SAUDI_REGIONS} value={formData.region} onChange={(val: string) => setFormData({...formData, region: val})} />
              <ProfileSelect label="Gender Identity" icon={<Shield size={18}/>} options={['Male', 'Female']} value={formData.gender} onChange={(val: string) => setFormData({...formData, gender: val})} />
              
              <div className="md:col-span-2">
                <ProfileSelect 
                  label="Online Status Visibility" 
                  icon={<Eye size={18}/>} 
                  options={['Public', 'Friends Only', 'Hidden']} 
                  value={formData.onlineStatus} 
                  onChange={(val: string) => setFormData({...formData, onlineStatus: val})} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* --- قسم التخصيص (Customization) --- */}
        <div className="space-y-8 md:space-y-12 px-2">
          <div className="flex items-center gap-4">
             <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white uppercase italic">Customization</h2>
             <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:gap-12 text-center md:text-left">
            {/* Player Type */}
            <div className="space-y-4 md:space-y-6">
              <p className="text-blue-400 font-black text-xs md:text-sm tracking-[0.2em] uppercase ml-1">01. Player Type</p>
              <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4 md:gap-6">
                <RadioOption label="Technical" checked={formData.isTechnical} onClick={() => setFormData({...formData, isTechnical: true})} />
                <RadioOption label="Non-Technical" checked={!formData.isTechnical} onClick={() => setFormData({...formData, isTechnical: false})} />
              </div>
            </div>

            {/* Character Style */}
            <div className="space-y-4 md:space-y-6">
              <p className="text-blue-400 font-black text-xs md:text-sm tracking-[0.2em] uppercase ml-1">02. Character Style</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-3 md:gap-5">
                {CHARACTER_IMAGES.map((style) => (
                  <button 
                    key={style}
                    onClick={() => setFormData({...formData, characterStyle: style})}
                    /* تصغير كروت الشخصيات بالجوال w-20 h-20 */
                    className={`relative w-20 h-20 md:w-24 md:h-24 rounded-2xl md:rounded-3xl border-2 transition-all duration-300 flex items-center justify-center p-2 md:p-3 group/char
                      ${formData.characterStyle === style 
                        ? 'border-cyan-500 bg-cyan-500/10 scale-110 shadow-[0_0_20px_rgba(6,182,212,0.3)]' 
                        : 'border-white/5 bg-[#0d111a]/50 hover:border-white/20'}`}
                  >
                    <img src={`/${style}`} className="w-full h-full object-contain transition-transform group-hover/char:scale-110" alt={style} />
                    {formData.characterStyle === style && (
                        <div className="absolute -top-1.5 -right-1.5 bg-cyan-500 rounded-full p-0.5 shadow-lg">
                            <CheckCircle2 size={14} className="text-white" />
                        </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-10 md:pt-16">
            <button 
              onClick={handleUpdate}
              disabled={saving}
              className="group relative w-full max-w-md overflow-hidden bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_auto] hover:bg-right py-4 md:py-5 rounded-2xl md:rounded-[2rem] font-black text-[12px] md:text-[14px] tracking-[0.3em] md:tracking-[0.4em] transition-all duration-500 shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:shadow-[0_0_50px_rgba(6,182,212,0.5)] active:scale-95 disabled:opacity-50 text-white uppercase"
            >
              <div className="flex items-center justify-center gap-3 md:gap-4 relative z-10">
                <Save size={18} className={`${saving ? 'animate-spin' : 'group-hover:rotate-12 transition-transform'}`} />
                {saving ? 'SYNCHRONIZING...' : 'SAVE CHANGES'}
              </div>
              <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
            </button>
          </div>
        </div>

      </div>
    </MainLayout>
  );
};

/* --- المكونات المساعدة للواجهة --- */

const ProfileInput = ({ label, icon, value, onChange, type = "text", readOnly = false }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] md:text-[11px] font-bold uppercase text-white/70 tracking-widest ml-1 block">
        {label}
    </label>
    <div className="relative group">
      <input 
        type={type} 
        value={value} 
        readOnly={readOnly}
        onChange={(e) => onChange && onChange(e.target.value)}
        className={`w-full bg-[#0d111a]/90 border border-white/10 rounded-xl md:rounded-2xl py-3 md:py-4 pl-10 md:pl-12 pr-4 text-xs md:text-sm text-white font-medium outline-none transition-all 
          ${readOnly ? 'opacity-50 cursor-not-allowed border-dashed bg-black/20' : 'focus:border-cyan-500/50 focus:bg-[#131926] shadow-inner'}`}
      />
      <div className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-cyan-500/30 group-focus-within:text-cyan-400 scale-90 md:scale-100">{icon}</div>
    </div>
  </div>
);

const ProfileSelect = ({ label, icon, options, value, onChange }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] md:text-[11px] font-bold uppercase text-white/70 tracking-widest ml-1 block">{label}</label>
    <div className="relative group">
      <select 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#0d111a]/90 border border-white/10 rounded-xl md:rounded-2xl py-3 md:py-4 pl-10 md:pl-12 pr-4 text-xs md:text-sm text-white font-medium outline-none appearance-none focus:border-cyan-500/50 transition-all cursor-pointer shadow-inner"
      >
        {options.map((opt: string) => <option key={opt} value={opt} className="bg-[#121620]">{opt}</option>)}
      </select>
      <div className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-cyan-500/30 group-focus-within:text-cyan-400 scale-90 md:scale-100">{icon}</div>
      <div className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 text-[10px]">▼</div>
    </div>
  </div>
);

const RadioOption = ({ label, checked, onClick }: any) => (
  <div 
    onClick={onClick} 
    className={`flex items-center gap-3 md:gap-4 cursor-pointer group px-6 py-3 md:px-10 md:py-4 rounded-xl md:rounded-2xl border-2 transition-all duration-300 flex-1 justify-center md:justify-start md:flex-none
      ${checked ? 'border-cyan-500 bg-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.2)]' : 'border-white/5 bg-black/20 hover:border-white/10'}`}
  >
    <div className={`w-4 h-4 md:w-5 md:h-5 rounded-full border-2 flex items-center justify-center transition-all ${checked ? 'border-cyan-500' : 'border-gray-700 group-hover:border-gray-500'}`}>
      {checked && <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,1)]"></div>}
    </div>
    <span className={`text-[12px] md:text-[14px] font-black uppercase tracking-[0.1em] md:tracking-[0.15em] ${checked ? 'text-white' : 'text-gray-500 group-hover:text-gray-400'}`}>{label}</span>
  </div>
);

export default Profile;