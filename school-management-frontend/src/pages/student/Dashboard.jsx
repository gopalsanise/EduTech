import React from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, CheckCircle, AlertTriangle, BookOpen, Clock, Calendar, BarChart3, ArrowUpRight, Zap, Target, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import studentService from '../../services/studentService';
import attendanceService from '../../services/attendanceService';
import resultService from '../../services/resultService';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/ui/Badge';

const StudentDashboard = () => {
    const { user } = useAuth();

    const { data: profile, isLoading: profileLoading } = useQuery({
        queryKey: ['student-me'],
        queryFn: () => studentService.getMe()
    });

    const { data: attendance } = useQuery({
        queryKey: ['my-attendance'],
        queryFn: () => attendanceService.getAll(),
        enabled: !!profile
    });

    const { data: results } = useQuery({
        queryKey: ['my-results'],
        queryFn: () => resultService.getAll(),
        enabled: !!profile
    });

    const attendanceRate = attendance?.length > 0
        ? Math.round((attendance.filter(a => a.status === 'Present').length / attendance.length) * 100)
        : 0;

    const avgGpa = results?.length > 0
        ? (results.reduce((acc, r) => acc + (r.totalMarks / 10), 0) / results.length).toFixed(2)
        : '0.00';

    return (
        <div className="p-4 md:p-6 lg:p-10 min-h-screen">
            <header className="mb-12 flex flex-col md:flex-row md:justify-between md:items-end gap-6">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-3 uppercase tracking-tighter">
                        Student <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-blue-600">Workspace</span>
                    </h1>
                    <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-[10px] flex items-center gap-2">
                        <Zap size={12} className="text-primary-500" /> System Authentication: {user?.name} • Sem {profile?.semester || '0'}
                    </p>
                </motion.div>
                <div className="glass px-8 py-4 rounded-3xl border border-white/10 flex items-center gap-6 bg-white/[0.02]">
                    <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-400 border border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-none mb-1.5">Portal Status</p>
                        <p className="text-sm font-black text-white uppercase tracking-tight">Active Node</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-12">
                {/* Academic Analytics Card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-2 glass-card p-12 rounded-[3rem] border border-primary-500/20 relative overflow-hidden group shadow-2xl bg-gradient-to-br from-slate-900 to-black"
                >
                    <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
                        <TrendingUp size={180} className="text-primary-500" />
                    </div>

                    <div className="flex items-center gap-5 mb-12">
                        <div className="p-4 bg-primary-600/10 text-primary-400 rounded-[1.25rem] border border-primary-500/20 shadow-lg">
                            <BarChart3 size={32} />
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-white uppercase tracking-tight">Performance Analytics</h3>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Real-time academic data synchronization</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
                        <div className="space-y-4">
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Presence Rate</p>
                            <h4 className={`text-6xl font-black tracking-tighter tabular-nums ${attendanceRate < 75 ? 'text-red-400' : 'text-primary-400'}`}>{attendanceRate}%</h4>
                            <div className="h-2 w-full bg-slate-800 rounded-full mt-2 overflow-hidden shadow-inner">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${attendanceRate}%` }} className={`h-full shadow-lg ${attendanceRate < 75 ? 'bg-red-500' : 'bg-primary-500'}`} />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Credit GPA</p>
                            <h4 className="text-6xl font-black text-white tracking-tighter tabular-nums">{avgGpa}</h4>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1.5"><Target size={10} /> Goal: 9.00+</p>
                        </div>
                        <div className="space-y-4 border-l border-white/5 pl-8 hidden md:block">
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Academic Stream</p>
                            <h4 className="text-3xl font-black text-white tracking-tight uppercase mt-2">{profile?.branch?.code || 'CSE'}</h4>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-relaxed">{profile?.branch?.name?.split(' ').slice(0, 2).join(' ')}...</p>
                        </div>
                    </div>
                </motion.div>

                {/* Quick Identification Modules */}
                <div className="flex flex-col gap-8">
                    <motion.div whileHover={{ x: 5 }} className="glass-card p-8 rounded-[2.5rem] border border-white/5 flex items-center gap-6 bg-white/[0.01] transition-all hover:border-primary-500/20">
                        <div className="p-5 bg-purple-500/10 text-purple-400 rounded-[1.5rem] border border-purple-500/20 shadow-lg group-hover:scale-110 transition-transform">
                            <Calendar size={28} />
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest mb-1">Institutional UID</p>
                            <p className="text-xl font-black text-white font-mono tabular-nums tracking-tighter">{profile?.rollNumber || 'LOADING...'}</p>
                        </div>
                    </motion.div>
                    <motion.div whileHover={{ x: 5 }} className="glass-card p-8 rounded-[2.5rem] border border-white/5 flex items-center gap-6 bg-white/[0.01] transition-all hover:border-amber-500/20">
                        <div className="p-5 bg-amber-500/10 text-amber-400 rounded-[1.5rem] border border-amber-500/20 shadow-lg group-hover:scale-110 transition-transform">
                            <BookOpen size={28} />
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest mb-1">Academic Status</p>
                            <p className="text-xl font-black text-white uppercase tracking-tight">Active Semester {profile?.semester || '1'}</p>
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="glass-card p-12 rounded-[3.5rem] border border-white/10 bg-slate-900/40 backdrop-blur-2xl transition-all hover:border-white/20">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                            <Activity className="text-primary-500" size={24} /> Verified <span className="text-primary-500">History</span>
                        </h3>
                        <motion.button whileHover={{ x: 3 }} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary-400 flex items-center gap-1.5 transition-colors">
                            Full Log <ArrowUpRight size={14} />
                        </motion.button>
                    </div>
                    <div className="space-y-5">
                        {attendance?.slice(0, 4).map((a, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="flex items-center justify-between p-6 bg-white/[0.02] rounded-3xl border border-white/5 hover:border-primary-500/20 transition-all group"
                            >
                                <div className="flex items-center gap-6">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${a.status === 'Present' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                        {a.status === 'Present' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-white uppercase tracking-tight">{a.status === 'Present' ? 'Identity Verified' : 'Session Absent'}</p>
                                        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1">TS: {a.date} • Staff: {a.markedBy}</p>
                                    </div>
                                </div>
                                <Badge className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] shadow-lg ${a.status === 'Present' ? 'bg-green-500/10 text-green-400 border-green-500/10' : 'bg-red-500/10 text-red-400 border-red-500/10'}`}>
                                    {a.status}
                                </Badge>
                            </motion.div>
                        ))}
                        {(!attendance || attendance.length === 0) && (
                            <div className="py-24 text-center">
                                <p className="text-slate-600 italic font-black uppercase tracking-widest text-xs animate-pulse underline decoration-primary-500/50 underline-offset-8">No historical metadata found</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="glass-card p-12 rounded-[3.5rem] border border-primary-500/10 bg-gradient-to-br from-slate-950 via-slate-900 to-black overflow-hidden relative group">
                    <div className="absolute -bottom-16 -right-16 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Brain size={350} className="text-white" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-4 bg-primary-500/10 text-primary-400 rounded-2xl border border-primary-500/20 shadow-lg">
                                <Brain size={32} />
                            </div>
                            <h3 className="text-3xl font-black text-white uppercase tracking-tight">AI Internal <span className="text-primary-500">Insights</span></h3>
                        </div>
                        <div className="p-8 bg-black/40 rounded-[2.5rem] border border-white/5 mb-10 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-primary-500/50" />
                            <p className="text-slate-400 text-lg italic leading-relaxed font-medium">
                                "Based on Semester {profile?.semester} metrics, your presence rate of {attendanceRate}% is {attendanceRate >= 75 ? 'OPTIMAL' : 'CRITICAL'}. 
                                Current trajectory suggests successful internal qualification. Prioritize Semester examinations to stabilize academic standing."
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-6 font-black uppercase tracking-[0.2em] text-[10px]">
                            <motion.div whileHover={{ scale: 1.05 }} className="px-6 py-4 bg-primary-600/10 text-primary-400 rounded-2xl border border-primary-500/20 text-center shadow-lg">Eligibility: {attendanceRate >= 75 ? 'Safe' : 'Warning'}</motion.div>
                            <motion.div whileHover={{ scale: 1.05 }} className="px-6 py-4 bg-purple-600/10 text-purple-400 rounded-2xl border border-purple-500/20 text-center shadow-lg">Academic Index: Stable</motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
