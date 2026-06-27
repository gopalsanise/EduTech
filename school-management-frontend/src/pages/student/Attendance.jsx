import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, CheckCircle, Clock, AlertCircle, Loader2, UserCheck, ShieldCheck, ArrowRight, Activity, XCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { format, getDay, getDaysInMonth, addMonths, subMonths, isSameDay } from 'date-fns';
import attendanceService from '../../services/attendanceService';
import studentService from '../../services/studentService';
import PageHeader from '../../components/ui/PageHeader';
import Badge from '../../components/ui/Badge';
import { Filter } from 'lucide-react';
import { withErrorBoundary } from '../../components/ui/ErrorBoundary';

const StudentAttendance = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedSemester, setSelectedSemester] = useState('');

    const { data: profile } = useQuery({
        queryKey: ['student-profile-me'],
        queryFn: studentService.getMe
    });

    React.useEffect(() => {
        if (profile?.semester && !selectedSemester) {
            setSelectedSemester(profile.semester);
        }
    }, [profile, selectedSemester]);

    const { data: attendance, isLoading, isError } = useQuery({
        queryKey: ['my-attendance-history', selectedSemester],
        queryFn: () => attendanceService.getAll({ semester: selectedSemester }),
        enabled: !!selectedSemester
    });

    const safeAttendance = Array.isArray(attendance) ? attendance : [];
    const totalSessions = safeAttendance.length;
    const presentCount = safeAttendance.filter(a => a.status === 'Present').length;
    const attendanceRate = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0;

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonthCount = getDaysInMonth(currentMonth);
    const firstDay = getDay(new Date(year, month, 1));

    const days = Array.from({ length: daysInMonthCount }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDay }, (_, i) => i);

    if (isError) {
        return (
            <div className="p-4 md:p-6 lg:p-10 min-h-screen">
                <PageHeader title="Attendance History" subtitle="Error Loading Records" icon={CalendarIcon} iconColor="red" />
                <div className="flex flex-col items-center justify-center py-32 glass-card rounded-[2rem] border border-red-500/10 bg-red-500/5">
                    <AlertCircle className="text-red-500 mb-4" size={48} />
                    <p className="text-white font-bold mb-2">Failed to Load Attendance</p>
                    <p className="text-slate-400 text-sm">There was an issue connecting to the server. Please try again later.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 lg:p-10 min-h-screen">
            <PageHeader
                title="Attendance History"
                subtitle="Daily track of your semester presence"
                icon={CalendarIcon}
                iconColor="green"
            />

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-32">
                    <Loader2 className="animate-spin text-primary-500 mb-6" size={48} strokeWidth={1.5} />
                    <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Accessing Records...</p>
                </div>
            ) : (
                <div className="space-y-10">
                    <div className="flex flex-wrap items-center justify-between gap-6 mb-10">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary-500/10 text-primary-400 rounded-2xl border border-primary-500/20">
                        <Filter size={20} />
                    </div>
                    <select
                        value={selectedSemester}
                        onChange={(e) => setSelectedSemester(e.target.value)}
                        className="bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-3 text-xs font-black uppercase tracking-widest text-white focus:ring-2 focus:ring-primary-500 transition-all appearance-none min-w-[200px]"
                    >
                        <option value="">Select Semester</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                            <option key={sem} value={sem}>Semester {sem}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Metrics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 rounded-[2rem] border border-green-500/10 flex items-center justify-between group bg-gradient-to-br from-green-500/5 to-transparent">
                            <div>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Total Present</p>
                                <h4 className="text-4xl font-black text-white tracking-tighter">{presentCount} Days</h4>
                            </div>
                            <div className="w-14 h-14 bg-green-500/10 text-green-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform border border-green-500/20">
                                <CheckCircle size={28} />
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-8 rounded-[2rem] border border-blue-500/10 flex items-center justify-between group bg-gradient-to-br from-blue-500/5 to-transparent">
                            <div>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Total Sessions</p>
                                <h4 className="text-4xl font-black text-white tracking-tighter">{totalSessions} Days</h4>
                            </div>
                            <div className="w-14 h-14 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform border border-blue-500/20">
                                <CalendarIcon size={28} />
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-8 rounded-[2rem] border border-amber-500/10 flex items-center justify-between group bg-gradient-to-br from-amber-500/5 to-transparent">
                            <div>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Current Rate</p>
                                <h4 className={`text-4xl font-black tracking-tighter ${attendanceRate < 75 ? 'text-red-400' : 'text-amber-400'}`}>
                                    {attendanceRate}%
                                </h4>
                            </div>
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform border ${attendanceRate < 75 ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                                <Clock size={28} />
                            </div>
                        </motion.div>
                    </div>

                    {/* Calendar Section */}
                    <div className="glass-card rounded-[2.5rem] border border-white/10 bg-slate-900/40 backdrop-blur-2xl overflow-hidden shadow-2xl">
                        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                            <div className="flex items-center gap-6">
                                <button onClick={prevMonth} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5 active:scale-95">
                                    <ArrowRight size={18} className="rotate-180" />
                                </button>
                                <h3 className="text-2xl font-black text-white uppercase tracking-tight w-56 text-center tabular-nums">{format(currentMonth, 'MMMM yyyy')}</h3>
                                <button onClick={nextMonth} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5 active:scale-95">
                                    <ArrowRight size={18} />
                                </button>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500" /><span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Present</span></div>
                                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500" /><span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Absent</span></div>
                            </div>
                        </div>

                        <div className="p-8 lg:p-12">
                            <div className="grid grid-cols-7 gap-4 mb-6">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                    <div key={d} className="text-center text-[11px] font-black text-slate-500 uppercase tracking-[0.25em] pb-2 border-b border-white/5">{d}</div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 gap-4">
                                {blanks.map(b => <div key={`blank-${b}`} className="aspect-square bg-slate-950/10 rounded-3xl border border-dashed border-white/5 opacity-50" />)}
                                {days.map(day => {
                                    const dateStr = format(new Date(year, month, day), 'yyyy-MM-dd');
                                    const dayRecords = safeAttendance.filter(a => a.date === dateStr);
                                    const hasRecords = dayRecords.length > 0;
                                    const isPresent = dayRecords.some(r => r.status === 'Present');
                                    const isAbsent = hasRecords && !isPresent;

                                    return (
                                        <motion.div 
                                            key={day} 
                                            whileHover={{ scale: 1.05, y: -2 }}
                                            className={`aspect-square rounded-3xl border-2 flex flex-col items-center justify-center transition-all relative overflow-hidden group ${
                                                hasRecords 
                                                    ? (isPresent ? 'bg-green-500/5 border-green-500/20 hover:border-green-500/50' : 'bg-red-500/5 border-red-500/20 hover:border-red-500/50')
                                                    : 'bg-white/[0.02] border-white/5 text-slate-600 hover:bg-white/5'
                                            }`}
                                        >
                                            <span className={`text-2xl font-black tabular-nums ${
                                                hasRecords ? (isPresent ? 'text-green-400' : 'text-red-400') : 'text-slate-500'
                                            }`}>{day}</span>
                                            {hasRecords && (
                                                <div className="mt-1 flex gap-0.5">
                                                    {dayRecords.map((r, i) => (
                                                        <div key={i} className={`w-1 h-1 rounded-full ${r.status === 'Present' ? 'bg-green-500' : 'bg-red-500'}`} />
                                                    ))}
                                                </div>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Daily Log List */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        <div className="lg:col-span-2 glass-card p-10 rounded-[2.5rem] border border-white/10 bg-slate-900/40 backdrop-blur-2xl transition-all hover:border-white/20">
                            <h3 className="text-2xl font-black text-white mb-8 uppercase tracking-tight flex items-center gap-3">
                                <Activity className="text-primary-500" size={24} /> Daily <span className="text-primary-500">Log</span>
                            </h3>
                            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                {safeAttendance.length > 0 ? safeAttendance.map((entry, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="p-6 bg-white/[0.03] rounded-3xl border border-white/5 hover:border-primary-500/30 transition-all flex items-center justify-between group"
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className="text-center min-w-[70px] p-3 bg-black/20 rounded-2xl border border-white/5">
                                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">{format(new Date(entry.date), 'MMM')}</p>
                                                <p className="text-2xl font-black text-white leading-none tabular-nums">{format(new Date(entry.date), 'dd')}</p>
                                            </div>
                                            <div className="h-12 w-px bg-white/10 hidden md:block" />
                                            <div>
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <div className="w-5 h-5 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-400 border border-primary-500/20">
                                                        <UserCheck size={10} />
                                                    </div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verified by {entry.markedBy}</p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <Badge className="bg-slate-950 text-slate-400 border-none text-[8px] px-2 py-0.5">Sem {entry.semester}</Badge>
                                                    <p className="text-[10px] text-slate-600 font-mono italic tracking-tighter">
                                                        {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <Badge className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] border-2 shadow-lg transition-all ${entry.status === 'Present' ? 'bg-green-500/10 text-green-400 border-green-500/20 shadow-green-500/5' :
                                                (entry.status === 'Absent' ? 'bg-red-500/10 text-red-400 border-red-500/20 shadow-red-500/5' : 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-amber-500/5')
                                            }`}>
                                            {entry.status}
                                        </Badge>
                                    </motion.div>
                                )) : (
                                    <div className="py-24 text-center">
                                        <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-slate-700 mx-auto mb-4 border border-white/5">
                                            <CalendarIcon size={32} />
                                        </div>
                                        <p className="text-white font-bold uppercase tracking-widest text-xs">No Records Found</p>
                                        <p className="text-slate-500 text-[10px] mt-2 italic px-8">Wait for your instructors to initiate marking for this period.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-8">
                            {/* Integrity Log */}
                            <div className="glass-card p-10 rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-slate-900 to-black transition-all hover:border-white/20">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 bg-primary-500/10 rounded-2xl border border-primary-500/20 text-primary-500">
                                        <ShieldCheck size={24} />
                                    </div>
                                    <h4 className="text-xl font-black text-white uppercase tracking-tight">Security Audit</h4>
                                </div>
                                <p className="text-slate-500 text-[11px] leading-relaxed mb-8 font-medium italic">
                                    Every attendance node is cryptographically signed by the marking instructor and permanently timestamped. 
                                </p>
                                <div className="p-6 bg-black/40 rounded-3xl border border-white/5 space-y-5">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Global Status</p>
                                        <p className={`text-[10px] font-black uppercase tracking-widest ${attendanceRate >= 75 ? 'text-green-400' : 'text-red-400'}`}>
                                            {attendanceRate >= 75 ? 'Qualified' : 'Critically Low'}
                                        </p>
                                    </div>
                                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${attendanceRate}%` }}
                                            className={`h-full shadow-lg ${attendanceRate < 75 ? 'bg-red-500 shadow-red-500/50' : 'bg-primary-500 shadow-primary-500/50'}`}
                                        />
                                    </div>
                                    <p className="text-[9px] text-slate-600 text-center font-bold uppercase tracking-widest">
                                        Target: 75% • Delta: {75 - attendanceRate > 0 ? `+${75 - attendanceRate}%` : 'Safe'}
                                    </p>
                                </div>
                            </div>

                            {/* Help Alert */}
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-3xl flex items-start gap-4">
                                <AlertCircle size={20} className="text-amber-500 shrink-0" />
                                <p className="text-[10px] text-amber-500/70 leading-relaxed font-bold uppercase tracking-tight">
                                    Discrepancies in attendance markings must be officially recorded via the grievance portal within 48 hours of timestamp.
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default withErrorBoundary(StudentAttendance);
