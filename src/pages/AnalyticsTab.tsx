import React from 'react';
import { BarChart3, Activity, Target, MapPin, Users } from 'lucide-react';

const AnalyticsTab = ({ gamePopularity = [], weeklyTraffic = [], behavior = {} }: any) => {
    
    const games = gamePopularity.length > 0 ? gamePopularity : [
        { name: 'No Data', val: 0, color: 'bg-gray-600', shadow: '' }
    ];

    const traffic = weeklyTraffic.length > 0 ? weeklyTraffic : [
        { day: 'Sun', users: 0, percentage: 0 }, { day: 'Mon', users: 0, percentage: 0 },
        { day: 'Tue', users: 0, percentage: 0 }, { day: 'Wed', users: 0, percentage: 0 },
        { day: 'Thu', users: 0, percentage: 0 }, { day: 'Fri', users: 0, percentage: 0 },
        { day: 'Sat', users: 0, percentage: 0 }
    ];

    const totalWeeklyVisits = traffic.reduce((sum: number, item: any) => sum + item.users, 0);

    return (
        <div className="animate-in fade-in duration-700 space-y-8 w-full">
            
            {}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/*  Drop-off Point */}
                <div className="bg-[#0b1221] border border-gray-800 rounded-[2rem] p-6 shadow-xl relative overflow-hidden group transition-all hover:border-rose-500/50">
    <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-all"></div>
    <div className="flex items-center gap-4 mb-4">
        <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
            <Target className="text-rose-400 w-5 h-5" />
        </div>
        <h4 className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Critical Drop-off</h4>
    </div>
    <div className="flex flex-col">
        <span className="text-3xl font-black text-white">Level {behavior.dropOffLevel || 1}</span>
        <span className="text-rose-400 text-[10px] font-bold uppercase mt-1">In: {behavior.dropOffGame || "All Games"}</span>
    </div>
    <p className="text-gray-500 text-[10px] mt-2 font-bold italic">This is where users struggle most</p>
</div>

                {/*  Top Region */}
                <div className="bg-[#0b1221] border border-gray-800 rounded-[2rem] p-6 shadow-xl relative overflow-hidden group transition-all hover:border-cyan-500/50">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-all"></div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
                            <MapPin className="text-cyan-400 w-5 h-5" />
                        </div>
                        <h4 className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Top Region</h4>
                    </div>
                    <span className="text-3xl font-black text-white">{behavior.topRegion || "N/A"}</span>
                    <p className="text-gray-500 text-[10px] mt-2 font-bold italic">Highest user engagement area</p>
                </div>

                {/* Retention Estimate */}
                <div className="bg-[#0b1221] border border-gray-800 rounded-[2rem] p-6 shadow-xl relative overflow-hidden group transition-all hover:border-green-500/50">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/5 rounded-full blur-2xl group-hover:bg-green-500/10 transition-all"></div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-2xl bg-green-500/10 border border-green-500/20">
                            <Users className="text-green-400 w-5 h-5" />
                        </div>
                        <h4 className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Retention Rate</h4>
                    </div>
                    <span className="text-3xl font-black text-white">{behavior.retentionRate || "0%"}</span>
                    <p className="text-gray-500 text-[10px] mt-2 font-bold italic">Returning players this week</p>
                </div>
            </div>

            {}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                
                {/* Game Popularity */}
                <div className="bg-[#0b1221] border border-gray-800 rounded-[2rem] p-8 shadow-2xl flex flex-col">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-white font-black tracking-wide text-lg">Game Popularity</h3>
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                            <BarChart3 className="text-purple-400 w-5 h-5" />
                        </div>
                    </div>
                    
                    <div className="space-y-6 flex-1 flex flex-col justify-center">
                        {games.map((game: any, i: number) => (
                            <div key={i} className="group">
                                <div className="flex justify-between text-[10px] mb-2">
                                    <span className="text-gray-300 font-bold uppercase tracking-wider group-hover:text-white transition-colors">{game.name}</span>
                                    <span className="text-gray-500 font-bold">{game.val}%</span>
                                </div>
                                <div className="w-full bg-gray-900 rounded-full h-1.5 overflow-visible">
                                    <div 
                                        className={`${game.color} ${game.shadow} h-1.5 rounded-full transition-all duration-1000 ease-out`} 
                                        style={{ width: `${game.val}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* System Traffic */}
                <div className="bg-[#0b1221] border border-gray-800 rounded-[2rem] p-8 shadow-2xl flex flex-col">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-white font-black tracking-wide text-lg">System Traffic</h3> 
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                            <Activity className="text-cyan-400 w-5 h-5" />
                        </div>
                    </div>

                    <div className="flex-1 flex items-end justify-between gap-2 pt-10 pb-4 border-b border-gray-800/50 relative">
                        {traffic.map((data: any, i: number) => (
                            <div key={i} className="flex flex-col items-center gap-3 w-full group z-10">
                                <span className="text-[10px] font-black text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity bg-cyan-500/10 px-2 py-1 rounded-md border border-cyan-500/20 mb-1 whitespace-nowrap">
                                    {data.users} visits
                                </span>
                                <div className="w-full max-w-[40px] h-48 bg-gray-900 rounded-t-xl overflow-hidden relative flex items-end justify-center">
                                    <div 
                                        className="w-full bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t-xl group-hover:from-cyan-500 group-hover:to-cyan-300 transition-all duration-700"
                                        style={{ height: `${data.percentage}%` }}
                                    ></div>
                                </div>
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{data.day}</span>
                            </div>
                        ))}
                    </div>
                    
                    <div className="mt-6 text-xs font-bold text-gray-500">
                        Total week traffic: <span className="text-white">{totalWeeklyVisits} total visits</span>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AnalyticsTab;