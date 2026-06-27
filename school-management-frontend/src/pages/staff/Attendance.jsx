import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Save, Loader2, Calendar as CalendarIcon, Users, AlertCircle, History, Clock, UserCheck, ArrowRight, ShieldCheck, Activity } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, getDay, getDaysInMonth, addMonths, subMonths, isSameDay } from 'date-fns';
import facultyService from '../../services/facultyService';
import attendanceService from '../../services/attendanceService';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { withErrorBoundary } from '../../components/ui/ErrorBoundary';

const StaffAttendance = () => {
    const queryClient = useQueryClient();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [selectedSemester, setSelectedSemester] = useState(null);
    const [attendanceData, setAttendanceData] = useState({}); // studentId -> status (P/A/L)

    const { data: profile } = useQuery({
        queryKey: ['faculty-me'],
        queryFn: () => facultyService.getMe()
    });

    useEffect(() => {
        if (profile?.assignedSemesters?.length > 0 && !selectedSemester) {
            setSelectedSemester(profile.assignedSemesters[0]);
        }
    }, [profile, selectedSemester]);

    const { data: students, isLoading: studentsLoading } = useQuery({
        queryKey: ['faculty-students-list', selectedSemester],
        queryFn: () => facultyService.getMyStudents({ semester: selectedSemester }),
        enabled: !!selectedSemester
    });

    const { data: history, isLoading: historyLoading, isError: historyError } = useQuery({
        queryKey: ['attendance-history', selectedSemester],
        queryFn: () => attendanceService.getAll({ semester: selectedSemester }),
        enabled: !!selectedSemester
    });

    const safeHistory = Array.isArray(history) ? history : [];

    useEffect(() => {
        if (Array.isArray(students)) {
            const initial = {};
            students.forEach(s => initial[s._id] = null);
            setAttendanceData(initial);
        }
    }, [students]);

    const isAlreadyMarked = safeHistory.some(s => s.date === date);

    const markAll = (status) => {
        if (isAlreadyMarked || !Array.isArray(students)) return;
        const updated = {};
        students.forEach(s => updated[s._id] = status);
        setAttendanceData(updated);
    };

    const resetAttendance = () => {
        if (isAlreadyMarked || !Array.isArray(students)) return;
        const initial = {};
        students.forEach(s => initial[s._id] = null);
        setAttendanceData(initial);
    };

    const setStatus = (id, status) => {
        if (isAlreadyMarked) return;
        setAttendanceData(prev => ({
            ...prev,
            [id]: status
        }));
    };

    const saveMutation = useMutation({
        mutationFn: (payload) => attendanceService.create(payload),
        onSuccess: () => {
            alert('Attendance record permanently stored!');
            queryClient.invalidateQueries(['attendance-history']);
        },
        onError: (err) => {
            alert('Error: ' + (err.response?.data?.error || err.message));
        }
    });

    const handleSave = () => {
        const missing = Object.values(attendanceData).some(v => v === null);
        if (missing) return alert("Please mark attendance for all students before confirming.");

        if (!window.confirm(`Are you sure you want to finalize attendance for Semester ${selectedSemester} on ${date}?`)) return;

        const records = Object.entries(attendanceData).map(([studentId, status]) => ({
            student: studentId,
            status: status === 'P' ? 'Present' : 'Absent'
        }));

        saveMutation.mutate({
            date,
            semester: selectedSemester,
            branch: profile?.branch?._id,
            records
        });
    };

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonthCount = getDaysInMonth(currentMonth);
    const firstDay = getDay(new Date(year, month, 1));

    const days = Array.from({ length: daysInMonthCount }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDay }, (_, i) => i);

    return (
        <div className="p-4 md:p-6 lg:p-10 min-h-screen">
            <PageHeader
                title="Academic Attendance"
                subtitle={`Management System • Semester ${selectedSemester || '?'}`}
                icon={CheckCircle2}
                iconColor="green"
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                {/* Configuration & Calendar Panel */}
                <div className="lg:col-span-1 space-y-8">
                    {/* Semester Selector */}
                    <div className="glass-card p-6 rounded-3xl border border-white/10">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Active Roster Select</label>
                        <div className="grid grid-cols-2 gap-3">
                            {(profile?.assignedSemesters || []).map(sem => (
                                <button
                                    key={sem}
                                    onClick={() => setSelectedSemester(sem)}
                                    className={`py-3.5 rounded-2xl border text-[11px] font-black uppercase tracking-widest transition-all ${selectedSemester === sem ? 'bg-primary-500/10 border-primary-500/40 text-primary-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'bg-slate-950 border-white/5 text-slate-600 hover:border-white/20'}`}
                                >
                                    Sem {sem}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Compact Calendar for Date selection */}
                    <div className="glass-card rounded-3xl border border-white/10 overflow-hidden bg-slate-900/40 backdrop-blur-xl">
                        <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                            <button onClick={prevMonth} className="p-2 hover:bg-white/5 rounded-lg transition-colors"><ArrowRight size={14} className="rotate-180" /></button>
                            <span className="text-[11px] font-black uppercase text-white tabular-nums tracking-widest">{format(currentMonth, 'MMM yyyy')}</span>
                            <button onClick={nextMonth} className="p-2 hover:bg-white/5 rounded-lg transition-colors"><ArrowRight size={14} /></button>
                        </div>
                        <div className="p-5">
                            <div className="grid grid-cols-7 gap-1 mb-2">
                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                                    <div key={d} className="text-center text-[8px] font-black text-slate-600 uppercase">{d}</div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 gap-1">
                                {blanks.map(b => <div key={`b-${b}`} className="aspect-square opacity-0" />)}
                                {days.map(day => {
                                    const dStr = format(new Date(year, month, day), 'yyyy-MM-dd');
                                    const marked = safeHistory.some(s => s.date === dStr);
                                    const isActive = date === dStr;
                                    return (
                                        <button
                                            key={day}
                                            onClick={() => setDate(dStr)}
                                            className={`aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold transition-all ${
                                                isActive ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' : 
                                                (marked ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'text-slate-500 hover:bg-white/5')
                                            }`}
                                        >
                                            {day}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="p-4 bg-black/20 border-t border-white/5 flex justify-center gap-4">
                            <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-500" /><span className="text-[8px] font-black text-slate-500 uppercase">Marked</span></div>
                            <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-primary-500" /><span className="text-[8px] font-black text-slate-500 uppercase">Selected</span></div>
                        </div>
                    </div>

                    {/* Instructor Badge */}
                    <div className="glass-card p-6 rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-slate-900 to-black relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><UserCheck size={80} /></div>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2 italic">Authorized Instructor</p>
                        <h4 className="text-xl font-black text-white tracking-tight uppercase mb-1">{profile?.user?.name}</h4>
                        <div className="flex items-center gap-2 text-[9px] text-green-400 font-black uppercase tracking-widest bg-green-500/10 py-1.5 px-3 rounded-xl border border-green-500/20 w-fit">
                            <ShieldCheck size={12} /> Verification Active
                        </div>
                    </div>
                </div>

                {/* Main Roster Body */}
                <div className="lg:col-span-3 space-y-8">
                    <div className="glass-card rounded-[2.5rem] overflow-hidden border border-white/10 bg-slate-900/40 backdrop-blur-2xl shadow-2xl">
                        <div className="p-8 border-b border-white/5 flex flex-wrap items-center justify-between gap-6 bg-white/[0.01]">
                            <div className="flex items-center gap-5">
                                <div className="p-4 bg-primary-500/10 text-primary-400 rounded-2xl border border-primary-500/20 shadow-[0_10px_30px_rgba(59,130,246,0.1)]">
                                    <Users size={28} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tight leading-none mb-1">Marking Registry</h3>
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{date} • Session: 01</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => markAll('P')} disabled={isAlreadyMarked} className="px-5 py-2.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-500/20 transition-all active:scale-95 disabled:opacity-30">Mark All Present</button>
                                <button onClick={() => markAll('A')} disabled={isAlreadyMarked} className="px-5 py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all active:scale-95 disabled:opacity-30">Mark All Absent</button>
                                <button onClick={resetAttendance} disabled={isAlreadyMarked} className="px-5 py-2.5 bg-slate-500/10 border border-white/10 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all active:scale-95 disabled:opacity-30">Reset</button>
                            </div>
                        </div>

                        {studentsLoading ? (
                            <div className="py-32 flex flex-col items-center">
                                <Loader2 className="animate-spin text-primary-500 mb-6" size={56} strokeWidth={1.5} />
                                <p className="text-slate-500 font-black uppercase tracking-widest text-[10px] animate-pulse">Establishing Roster Pipeline...</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-white/[0.03] border-b border-white/10">
                                        <tr className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                                            <th className="px-10 py-6">Participant Identity</th>
                                            <th className="px-10 py-6">Enrollment UID</th>
                                            <th className="px-10 py-6 text-center">Status Toggle</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/[0.03]">
                                        {Array.isArray(students) && students.length > 0 ? (
                                            students.map((s, i) => (
                                                <motion.tr
                                                    key={s._id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.02 }}
                                                    className="hover:bg-white/[0.02] transition-colors group"
                                                >
                                                    <td className="px-10 py-5">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-xs font-black text-slate-500 border border-white/5 transition-all group-hover:border-primary-500/30 group-hover:text-primary-400">
                                                                {s.user?.name?.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-white uppercase tracking-tight">{s.user?.name}</p>
                                                                <p className="text-[10px] text-slate-600 font-mono italic tracking-tighter">AUTHENTICATED_MEMBER</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-5">
                                                        <span className="text-[10px] font-mono font-black text-slate-400 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 uppercase tracking-widest tabular-nums">{s.rollNumber}</span>
                                                    </td>
                                                    <td className="px-10 py-5">
                                                        <div className="flex justify-center gap-2">
                                                            <button
                                                                disabled={isAlreadyMarked}
                                                                onClick={() => setStatus(s._id, 'P')}
                                                                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all min-w-[110px] justify-center ${
                                                                    attendanceData[s._id] === 'P'
                                                                        ? 'bg-green-500/20 border-green-500/40 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.2)]'
                                                                        : 'bg-white/5 border-white/10 text-slate-500 hover:bg-white/10'
                                                                } ${isAlreadyMarked ? 'opacity-30' : 'active:scale-95'}`}
                                                            >
                                                                {attendanceData[s._id] === 'P' ? <CheckCircle2 size={14} /> : null}
                                                                <span className="text-[9px] font-black uppercase tracking-widest">Present</span>
                                                            </button>
                                                            <button
                                                                disabled={isAlreadyMarked}
                                                                onClick={() => setStatus(s._id, 'A')}
                                                                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all min-w-[110px] justify-center ${
                                                                    attendanceData[s._id] === 'A'
                                                                        ? 'bg-red-500/20 border-red-500/40 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                                                                        : 'bg-white/5 border-white/10 text-slate-500 hover:bg-white/10'
                                                                } ${isAlreadyMarked ? 'opacity-30' : 'active:scale-95'}`}
                                                            >
                                                                {attendanceData[s._id] === 'A' ? <XCircle size={14} /> : null}
                                                                <span className="text-[9px] font-black uppercase tracking-widest">Absent</span>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="3" className="py-24 text-center">
                                                    <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-slate-700 mx-auto mb-4 border border-white/5">
                                                        <Users size={32} />
                                                    </div>
                                                    <p className="text-white font-bold uppercase tracking-widest text-xs">No Students Assigned</p>
                                                    <p className="text-slate-500 text-[10px] mt-2 italic px-8">There are no students registered for this semester/branch in your roster.</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <div className="p-10 bg-black/40 border-t border-white/5 flex flex-wrap items-center justify-between gap-8">
                            <div className="flex items-start gap-4 max-w-lg">
                                <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
                                    <AlertCircle size={20} />
                                </div>
                                <div>
                                    <p className="text-[11px] font-black text-amber-500/80 uppercase tracking-widest mb-1.5 leading-none">Data Finalization Protocol</p>
                                    <p className="text-[10px] text-slate-600 font-medium leading-relaxed italic">
                                        Submitting this roster creates a permanent digital entry signed by your faculty credentials. Retroactive modifications require HOD-level override authorization.
                                    </p>
                                </div>
                            </div>
                            <Button
                                disabled={saveMutation.isLoading || !students?.length || isAlreadyMarked}
                                onClick={handleSave}
                                className={`px-10 py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl transition-all ${isAlreadyMarked ? 'bg-slate-800 text-slate-600 border border-white/5' : 'bg-primary-600 hover:bg-primary-500 text-white shadow-primary-600/30 active:scale-95'}`}
                            >
                                {saveMutation.isLoading ? <Loader2 className="animate-spin mr-3" size={18} /> : <Save className="mr-3" size={18} />}
                                {isAlreadyMarked ? 'Temporal Lock Active' : 'Commit Final Records'}
                            </Button>
                        </div>
                    </div>

                    {/* Quick History Metrics Below Roster */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="glass-card p-8 rounded-[2.5rem] border border-white/10 flex items-center gap-6 group hover:border-primary-500/20 transition-all overflow-hidden relative">
                           <div className="absolute -bottom-4 -right-4 opacity-5 group-hover:opacity-10 transition-opacity"><Activity size={100} /></div>
                           <div className="p-4 bg-primary-600/10 text-primary-400 rounded-2xl border border-primary-500/20"><Activity size={24} /></div>
                           <div>
                               <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Semester Average</p>
                               <h4 className="text-3xl font-black text-white leading-none">
                                   {safeHistory.length > 0 ? Math.round((safeHistory.reduce((acc, h) => acc + ( (h.records?.filter(r => r.status === 'Present').length || 0) / (h.records?.length || 1) ), 0) / safeHistory.length) * 100) : 0}%
                               </h4>
                           </div>
                        </div>
                        <div className="glass-card p-8 rounded-[2.5rem] border border-white/10 flex items-center gap-6 group hover:border-amber-500/20 transition-all overflow-hidden relative">
                           <div className="absolute -bottom-4 -right-4 opacity-5 group-hover:opacity-10 transition-opacity"><History size={100} /></div>
                           <div className="p-4 bg-amber-600/10 text-amber-400 rounded-2xl border border-amber-500/20"><History size={24} /></div>
                           <div>
                               <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Sessions Marked</p>
                               <h4 className="text-3xl font-black text-white leading-none">{safeHistory.length} Records</h4>
                           </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default withErrorBoundary(StaffAttendance);
