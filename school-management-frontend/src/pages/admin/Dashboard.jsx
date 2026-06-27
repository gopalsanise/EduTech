import React from 'react';
import { motion } from 'framer-motion';
import {
    LayoutDashboard, Users, UserCheck, TrendingUp,
    BookOpen, Activity, Loader2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import branchService from '../../services/branchService';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/ui/PageHeader';

const StatCard = ({ icon: Icon, label, value, color, delay }) => {
    const colorMap = {
        primary: 'text-sky-400 bg-sky-500/10 ring-sky-500/20',
        secondary: 'text-indigo-400 bg-indigo-500/10 ring-indigo-500/20',
        green: 'text-emerald-400 bg-emerald-500/10 ring-emerald-500/20',
        blue: 'text-blue-400 bg-blue-500/10 ring-blue-500/20',
        amber: 'text-amber-400 bg-amber-500/10 ring-amber-500/20',
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay, duration: 0.5, ease: 'easeOut' }}
            className="glass-card p-8 rounded-[2.5rem] border border-white/10 hover:border-white/20 transition-all group relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full -mr-12 -mt-12 group-hover:bg-white/10 transition-colors" />

            <div className="flex items-center justify-between mb-6 relative z-10">
                <div className={`p-4 rounded-2xl ring-2 ${colorMap[color] || colorMap.primary}`}>
                    <Icon size={24} strokeWidth={2.5} />
                </div>
                <Activity size={16} className="text-slate-500 group-hover:text-primary-400 transition-colors" />
            </div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">{label}</p>
            <h3 className="text-4xl font-black text-white mt-2 tracking-tighter">{value}</h3>
        </motion.div>
    );
};

const AdminDashboard = () => {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['adminStats'],
        queryFn: async () => {
            try {
                const { data } = await api.get('/analytics');
                return data;
            } catch (err) {
                console.error('Stats fetch failed:', err);
                return { totalStudents: 0, passRatio: 0, deptStats: {} };
            }
        },
        refetchInterval: 30000
    });

    const { data: branches, isLoading: branchesLoading } = useQuery({
        queryKey: ['admin-dashboard-branches'],
        queryFn: branchService.getAll
    });

    if (isLoading) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-primary-500 mb-6" size={56} strokeWidth={1.5} />
                <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Aggregating College Intelligence...</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 lg:p-10 min-h-screen">
            <PageHeader
                title="Intelligence Terminal"
                subtitle="Real-time strategic metrics and departmental telemetry"
                icon={LayoutDashboard}
                iconColor="primary"
            />

            {stats?.pendingFaculty > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500/20 rounded-xl text-amber-400">
                            <UserCheck size={20} />
                        </div>
                        <div>
                            <h4 className="text-amber-400 font-bold text-sm">Action Required: Pending Faculty Applications</h4>
                            <p className="text-slate-400 text-xs mt-0.5">There are {stats.pendingFaculty} teacher request(s) waiting for approval.</p>
                        </div>
                    </div>
                </motion.div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <StatCard
                    icon={Users}
                    label="Total Students"
                    value={stats?.totalStudents || '0'}
                    color="primary"
                    delay={0.1}
                />
                <StatCard
                    icon={UserCheck}
                    label="Faculty Active"
                    value={stats?.totalFaculty || '0'}
                    color="secondary"
                    delay={0.2}
                />
                <StatCard
                    icon={TrendingUp}
                    label="Avg Pass Rate"
                    value={`${stats?.passRatio || 0}%`}
                    color="green"
                    delay={0.3}
                />
                <StatCard
                    icon={BookOpen}
                    label="Active Branches"
                    value={branches?.length || '0'}
                    color="blue"
                    delay={0.4}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="lg:col-span-2 glass-card p-8 rounded-[2.5rem] border border-white/10"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-white tracking-tight">Active Branches</h3>
                            <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-wider">Academic departments in the system</p>
                        </div>
                    </div>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {branchesLoading ? (
                            <div className="flex items-center justify-center p-8">
                                <Loader2 className="animate-spin text-primary-500" size={24} />
                            </div>
                        ) : branches?.length > 0 ? (
                            branches.map((branch) => (
                                <div key={branch._id} className="flex gap-4 items-center group p-4 bg-slate-900/50 border border-white/5 rounded-2xl hover:border-primary-500/30 hover:bg-white/[0.02] transition-all">
                                    <div className="w-12 h-12 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center shrink-0">
                                        <BookOpen size={20} className="text-primary-400 group-hover:scale-110 transition-transform" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <p className="text-white font-bold text-base leading-none">{branch.name}</p>
                                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest bg-white/5 px-2 py-1 rounded-md">{branch.code}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-slate-500 text-sm italic text-center p-8 border border-dashed border-white/10 rounded-2xl">No branches found. Add branches in the Admin Panel.</p>
                        )}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="glass-card p-8 rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-slate-900/50 to-transparent"
                >
                    <div className="mb-8">
                        <h3 className="text-xl font-black text-white tracking-tight">Network Load</h3>
                        <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-wider">Student density per branch</p>
                    </div>
                    <div className="space-y-6">
                        {stats?.deptStats && Object.entries(stats.deptStats).length > 0 ? (
                            Object.entries(stats.deptStats).map(([dept, count]) => (
                                <div key={dept} className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Department</span>
                                            <span className="text-sm text-white font-bold leading-none">{dept}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-lg font-black text-white leading-none">{count}</span>
                                            <span className="text-[10px] text-slate-500 font-bold ml-1 uppercase">Students</span>
                                        </div>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-800/50 rounded-full overflow-hidden border border-white/5">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(count / (stats.totalStudents || 1)) * 100}%` }}
                                            transition={{ delay: 1, duration: 1 }}
                                            className="h-full bg-gradient-to-r from-primary-600 to-indigo-500 shadow-[0_0_10px_rgba(2,132,199,0.5)]"
                                        />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-12 text-center">
                                <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Activity size={24} className="text-slate-600" />
                                </div>
                                <p className="text-slate-500 text-sm font-medium">No departmental telemetry available</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AdminDashboard;
