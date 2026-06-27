import React from 'react';
import { motion } from 'framer-motion';
import { Users, CheckCircle, BookOpen, Calendar, TrendingUp, ArrowRight, History, ShieldCheck } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import facultyService from '../../services/facultyService';
import attendanceService from '../../services/attendanceService';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import Badge from '../../components/ui/Badge';

const StaffDashboard = () => {
    const { user } = useAuth();

    const { data: profile, isLoading: profileLoading } = useQuery({
        queryKey: ['faculty-me'],
        queryFn: () => facultyService.getMe()
    });

    const { data: students, isLoading: studentsLoading } = useQuery({
        queryKey: ['faculty-students'],
        queryFn: () => facultyService.getMyStudents(),
        enabled: !!profile
    });

    const { data: attendanceHistory } = useQuery({
        queryKey: ['staff-attendance-history', profile?.assignedSemesters],
        queryFn: () => attendanceService.getAll({ semesters: profile?.assignedSemesters }),
        enabled: !!profile
    });

    // Calculate Average Attendance for the semester
    const calculateAvgAttendance = () => {
        if (!attendanceHistory || attendanceHistory.length === 0) return 0;
        const totalPossible = attendanceHistory.length * (students?.length || 1);
        const totalPresent = attendanceHistory.reduce((acc, session) =>
            acc + session.records.filter(r => r.status === 'Present').length, 0);
        return Math.round((totalPresent / totalPossible) * 100);
    };

    const avgAttendance = calculateAvgAttendance();

    const stats = [
        { label: 'Assigned Students', value: students?.length || 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { label: 'Avg Attendance', value: `${avgAttendance}%`, icon: History, color: 'text-green-400', bg: 'bg-green-500/10' },
        { label: 'Total Semesters', value: profile?.assignedSemesters?.length || 0, icon: CheckCircle, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    ];

    return (
        <div className="p-4 md:p-6 lg:p-10 min-h-screen">
            <header className="mb-10">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <ShieldCheck className="text-primary-500" size={24} />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">Verified Faculty Portal</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-white mb-2 uppercase tracking-tighter">
                            Instructor <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-green-500">Dashboard</span>
                        </h1>
                        <p className="text-slate-400 font-medium italic">Authenticated as {user?.name}. Managing {profile?.assignedSemesters?.length || 0} assigned semesters.</p>
                    </div>
                    <div className="glass px-6 py-4 rounded-[1.5rem] border border-white/10 flex items-center gap-4 bg-slate-900/50">
                        <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center text-primary-400">
                            <Calendar size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-none mb-1">Active Session</p>
                            <p className="text-sm font-bold text-white leading-none">Spring 2026</p>
                        </div>
                    </div>
                </motion.div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-card p-8 rounded-[2rem] border border-white/10 group hover:border-primary-500/30 transition-all bg-slate-900/40 backdrop-blur-xl"
                    >
                        <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                            <stat.icon size={28} />
                        </div>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                        <h3 className="text-4xl font-black text-white tracking-tighter">{stat.value}</h3>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Semester Summary */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass-card p-10 rounded-[2.5rem] border border-white/10 flex flex-col justify-between bg-slate-900/40"
                >
                    <div className="mb-8">
                        <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-tight">Academic <span className="text-primary-500">Assignment</span></h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">Branch</p>
                                <p className="text-lg font-black text-white truncate">{profile?.branch?.name || 'Loading...'}</p>
                            </div>
                            <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">Active Designation</p>
                                <p className="text-xl font-black text-white">{profile?.designation || 'Lecturer'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Link to="/staff/attendance" className="group flex items-center justify-between p-6 bg-slate-800/50 border border-white/5 rounded-2xl text-white font-bold uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-all">
                            Mark Today's Attendance
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link to="/staff/students" className="group flex items-center justify-between p-6 bg-primary-600 rounded-2xl text-white font-black uppercase tracking-widest text-[10px] hover:bg-primary-500 transition-all shadow-[0_10px_30px_rgba(59,130,246,0.3)]">
                            Finalize Marks (Results)
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </motion.div>

                {/* Professional Identity */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="glass-card p-10 rounded-[2.5rem] border border-white/10 bg-slate-900/40"
                >
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight">Professional <span className="text-amber-500">Identity</span></h3>
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                             <TrendingUp size={20} />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                        <div className="p-5 bg-white/5 rounded-2xl border border-white/5 group hover:border-amber-500/20 transition-all">
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1.5">Highest Qualification</p>
                            <p className="text-base font-black text-white group-hover:text-amber-400 transition-colors uppercase leading-tight">{profile?.qualification || 'Not Specified'}</p>
                        </div>
                        
                        <div className="p-5 bg-white/5 rounded-2xl border border-white/5 group hover:border-amber-500/20 transition-all">
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1.5">Academic Department</p>
                            <p className="text-base font-black text-white group-hover:text-amber-400 transition-colors uppercase leading-tight">{profile?.department || profile?.branch?.name || 'General'}</p>
                        </div>

                        <div className="p-5 bg-white/5 rounded-2xl border border-white/5 group hover:border-amber-500/20 transition-all">
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1.5">Educational Background</p>
                            <p className="text-xs font-medium text-slate-400 italic leading-relaxed">{profile?.education || 'Detailed history pending...'}</p>
                        </div>
                    </div>

                    <div className="mt-8 p-5 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
                        <div className="flex items-center gap-3 mb-2">
                             <ShieldCheck className="text-indigo-400" size={16} />
                             <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Portal Synchronization</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                            Your professional telemetry is synchronized with the institutional core. Contact administration for profile updates.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default StaffDashboard;
