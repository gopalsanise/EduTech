import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
    PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { Activity, Loader2, Filter, AlertTriangle, Calendar, Users, Table, Download, UserCheck } from 'lucide-react';
import attendanceService from '../../services/attendanceService';
import branchService from '../../services/branchService';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

const AdminAttendanceReport = () => {
    const [semester, setSemester] = useState('');
    const [branch, setBranch] = useState('');
    const [month, setMonth] = useState('');

    const { data: branches } = useQuery({
        queryKey: ['branches-list'],
        queryFn: branchService.getAll
    });

    const { data: report, isLoading } = useQuery({
        queryKey: ['admin-attendance-report', semester, branch, month],
        queryFn: () => {
            const filters = {};
            if (semester) filters.semester = semester;
            if (branch) filters.branch = branch;
            if (month) {
                const year = new Date().getFullYear();
                filters.startDate = `${year}-${month.padStart(2, '0')}-01`;
                filters.endDate = `${year}-${month.padStart(2, '0')}-31`;
            }
            return attendanceService.getReport(filters);
        }
    });

    const { data: rawSessions, isLoading: sessionsLoading } = useQuery({
        queryKey: ['admin-attendance-raw', semester, branch],
        queryFn: () => {
            const filters = {};
            if (semester) filters.semester = semester;
            if (branch) filters.branch = branch;
            return attendanceService.getAll(filters);
        }
    });

    const flattenedRecords = React.useMemo(() => {
        if (!rawSessions) return [];
        const records = [];
        rawSessions.forEach(session => {
            session.records.forEach(rec => {
                records.push({
                    id: `${session._id}-${rec.student?._id}`,
                    studentName: rec.student?.user?.name || 'Unknown',
                    rollNumber: rec.student?.rollNumber || 'N/A',
                    semester: session.semester,
                    date: session.date,
                    status: rec.status,
                    teacherName: session.markedBy?.teacherName || 'Admin/Unknown'
                });
            });
        });
        return records.sort((a,b) => new Date(b.date) - new Date(a.date));
    }, [rawSessions]);

    const COLORS = ['#10B981', '#EF4444', '#F59E0B'];

    const pieData = [
        { name: 'Present', value: report?.overview?.totalPresent || 0 },
        { name: 'Absent', value: report?.overview?.totalAbsent || 0 },
        { name: 'Leave', value: report?.overview?.totalLeave || 0 }
    ];

    return (
        <div className="p-4 md:p-6 lg:p-10 min-h-screen">
            <PageHeader
                title="Attendance Analytics"
                subtitle="Graphical overview of student participation and trends"
                icon={Activity}
                iconColor="blue"
            />

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="glass-card p-4 rounded-[1.5rem] border border-white/5 relative">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                    <select
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                        className="w-full bg-transparent border-none text-xs font-black uppercase tracking-widest text-white pl-10 focus:ring-0 appearance-none"
                    >
                        <option value="" className="bg-slate-950">All Semesters</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s} className="bg-slate-950">Semester {s}</option>)}
                    </select>
                </div>

                <div className="glass-card p-4 rounded-[1.5rem] border border-white/5 relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                    <select
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        className="w-full bg-transparent border-none text-xs font-black uppercase tracking-widest text-white pl-10 focus:ring-0 appearance-none"
                    >
                        <option value="" className="bg-slate-950">All Branches</option>
                        {branches?.map(b => <option key={b._id} value={b._id} className="bg-slate-950">{b.name}</option>)}
                    </select>
                </div>

                <div className="glass-card p-4 rounded-[1.5rem] border border-white/5 relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                    <select
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        className="w-full bg-transparent border-none text-xs font-black uppercase tracking-widest text-white pl-10 focus:ring-0 appearance-none"
                    >
                        <option value="" className="bg-slate-950">All Time</option>
                        <option value="1" className="bg-slate-950">January</option>
                        <option value="2" className="bg-slate-950">February</option>
                        <option value="3" className="bg-slate-950">March</option>
                        <option value="4" className="bg-slate-950">April</option>
                        <option value="5" className="bg-slate-950">May</option>
                        <option value="6" className="bg-slate-950">June</option>
                        <option value="7" className="bg-slate-950">July</option>
                        <option value="8" className="bg-slate-950">August</option>
                        <option value="9" className="bg-slate-950">September</option>
                        <option value="10" className="bg-slate-950">October</option>
                        <option value="11" className="bg-slate-950">November</option>
                        <option value="12" className="bg-slate-950">December</option>
                    </select>
                </div>

                <Button variant="glass" onClick={() => { setSemester(''); setBranch(''); setMonth(''); }} className="text-[10px] rounded-[1.5rem] font-black uppercase tracking-widest">
                    Clear Filters
                </Button>
            </div>

            {isLoading ? (
                <div className="py-32 flex flex-col items-center">
                    <Loader2 className="animate-spin text-blue-500 mb-6" size={48} strokeWidth={1.5} />
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Aggregating Global Telemetry...</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Top Level Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 rounded-[2rem] border border-white/10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 blur-2xl rounded-full -mr-8 -mt-8" />
                            <Activity className="text-green-400 mb-4" size={24} />
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Avg Attendance</p>
                            <h4 className="text-3xl font-black text-white">{Math.round(report?.overview?.overallPercentage || 0)}%</h4>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 rounded-[2rem] border border-white/10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 blur-2xl rounded-full -mr-8 -mt-8" />
                            <AlertTriangle className="text-red-400 mb-4" size={24} />
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Total Absences</p>
                            <h4 className="text-3xl font-black text-white">{report?.overview?.totalAbsent || 0}</h4>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6 rounded-[2rem] border border-white/10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 blur-2xl rounded-full -mr-8 -mt-8" />
                            <Calendar className="text-amber-400 mb-4" size={24} />
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Leaves Granted</p>
                            <h4 className="text-3xl font-black text-white">{report?.overview?.totalLeave || 0}</h4>
                        </motion.div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Attendance Distribution */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-8 rounded-[2.5rem] border border-white/10 lg:col-span-1">
                            <h3 className="text-lg font-black text-white tracking-tight mb-2">Presence Ratio</h3>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-6">Aggregate distribution mapping</p>
                            <div className="h-[250px] w-full flex items-center justify-center relative">
                                {report?.overview?.totalSessions > 0 ? (
                                    <>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={pieData}
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                    stroke="none"
                                                >
                                                    {pieData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '1rem', fontSize: '12px', fontWeight: 'bold' }}
                                                    itemStyle={{ color: '#fff' }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                            <p className="text-2xl font-black text-white leading-none">{Math.round(report?.overview?.overallPercentage || 0)}%</p>
                                            <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Active</p>
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-slate-600 font-medium italic text-xs">Insufficient data</p>
                                )}
                            </div>
                            <div className="flex justify-center gap-6 mt-4">
                                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-[10px] font-bold text-slate-400 uppercase">Present</span></div>
                                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500" /><span className="text-[10px] font-bold text-slate-400 uppercase">Absent</span></div>
                                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500" /><span className="text-[10px] font-bold text-slate-400 uppercase">Leave</span></div>
                            </div>
                        </motion.div>

                        {/* Daily Trend Line Chart */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-8 rounded-[2.5rem] border border-white/10 lg:col-span-2">
                            <h3 className="text-lg font-black text-white tracking-tight mb-2">Daily Attendance Velocity</h3>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-6">Temporal trend assessment</p>
                            <div className="h-[280px] w-full">
                                {report?.dailyTrend?.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={report.dailyTrend} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                            <XAxis
                                                dataKey="date"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                                                dy={10}
                                                tickFormatter={(val) => {
                                                    const parts = val.split('-');
                                                    return parts.length === 3 ? `${parts[2]}/${parts[1]}` : val;
                                                }}
                                            />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '1rem', fontSize: '12px' }}
                                            />
                                            <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', paddingTop: '10px' }} />
                                            <Line type="monotone" dataKey="present" name="Present" stroke="#10B981" strokeWidth={3} dot={{ strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                                            <Line type="monotone" dataKey="absent" name="Absent" stroke="#EF4444" strokeWidth={3} dot={{ strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <p className="text-slate-600 font-medium italic text-xs">No temporal data points isolated</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* Detailed List Section */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="glass-card rounded-[2.5rem] border border-white/10 overflow-hidden bg-slate-900/40">
                        <div className="p-8 border-b border-white/5 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                                    <Table size={18} className="text-primary-400" /> Granular Attendance Registry
                                </h3>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Detailed status trail per session</p>
                            </div>
                            <Button variant="glass" className="text-[10px] rounded-xl font-black uppercase tracking-widest px-4 py-2 border-primary-500/20 text-primary-400 hover:bg-primary-500/10">
                                <Download size={14} className="mr-2" /> Export CSV
                            </Button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-white/5 border-b border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    <tr>
                                        <th className="px-8 py-5">Student Participant</th>
                                        <th className="px-8 py-5">Identity (UID)</th>
                                        <th className="px-8 py-5">Acad. Context</th>
                                        <th className="px-8 py-5">Marked Status</th>
                                        <th className="px-8 py-5">Authorized By</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.03]">
                                    {sessionsLoading ? (
                                        <tr><td colSpan={5} className="py-20 text-center"><Loader2 className="animate-spin text-primary-500 mx-auto" /></td></tr>
                                    ) : flattenedRecords.length === 0 ? (
                                        <tr><td colSpan={5} className="py-20 text-center text-slate-600 font-medium italic">No detailed records found for current filters.</td></tr>
                                    ) : flattenedRecords.map((rec) => (
                                        <tr key={rec.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500 border border-white/5 group-hover:border-primary-500/30 group-hover:text-primary-400 transition-all">
                                                        {rec.studentName.charAt(0)}
                                                    </div>
                                                    <span className="font-bold text-white uppercase text-sm tracking-tight">{rec.studentName}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-950/50 px-2 py-1 rounded border border-white/5">{rec.rollNumber}</span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Sem {rec.semester}</span>
                                                    <span className="text-[10px] text-slate-500 font-bold">{rec.date}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <Badge variant={rec.status === 'Present' ? 'emerald' : (rec.status === 'Absent' ? 'danger' : 'warning')} className="text-[9px] py-0 px-2 border-none font-black uppercase tracking-tighter">
                                                    {rec.status}
                                                </Badge>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2 text-slate-500 group-hover:text-slate-300 transition-colors">
                                                    <UserCheck size={12} className="shrink-0" />
                                                    <span className="text-[10px] font-bold uppercase truncate max-w-[120px]">{rec.teacherName}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default AdminAttendanceReport;
