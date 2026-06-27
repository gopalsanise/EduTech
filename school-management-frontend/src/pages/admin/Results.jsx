import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { ClipboardList, Search, TrendingUp, Filter, Plus, Save, Loader2, Download, AlertCircle, ChevronRight, User, GraduationCap, BarChart as BarChartIcon } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import Badge from '../../components/ui/Badge';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import branchService from '../../services/branchService';
import resultService from '../../services/resultService';
import studentService from '../../services/studentService';

// ── Sub-Components ──────────────────────────────────────────────────────────
const MarksEntryForm = ({ onSubmit, onCancel, branches, students, loading, mode }) => {
    const [form, setForm] = useState({
        student: '',
        branch: '',
        semester: 1,
        internalMarks: 0,
        practicalMarks: 0,
        externalMarks: 0,
        outOf: 100
    });

    const isInternalMode = mode === 'internal';
    const isPracticalMode = mode === 'practical';
    const isSemesterMode = mode === 'semester';

    const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="res-branch" className="block text-sm text-slate-400 mb-1">Branch</label>
                    <select id="res-branch" name="branch" value={form.branch} onChange={handle} required
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-primary-500 text-sm">
                        <option value="">Select Branch</option>
                        {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="res-semester" className="block text-sm text-slate-400 mb-1">Semester</label>
                    <select id="res-semester" name="semester" value={form.semester} onChange={handle} required
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-primary-500 text-sm">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                    </select>
                </div>
                <div className="sm:col-span-2">
                    <label htmlFor="res-student" className="block text-sm text-slate-400 mb-1">Student</label>
                    <select id="res-student" name="student" value={form.student} onChange={handle} required
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-primary-500 text-sm">
                        <option value="">Select Student</option>
                        {students.filter(s => s.branch?._id === form.branch && s.semester == form.semester).map(s => (
                            <option key={s._id} value={s._id}>{s.user?.name} ({s.rollNumber})</option>
                        ))}
                    </select>
                </div>

                <div className="border-t border-white/5 sm:col-span-2 pt-4 mt-2">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-500 mb-4">Marks Breakdown</h4>
                </div>

                {(isInternalMode || isSemesterMode) && (
                    <div>
                        <label htmlFor="res-internal" className="block text-xs font-bold text-slate-500 mb-1 uppercase">Internal (Max 30)</label>
                        <input id="res-internal" type="number" name="internalMarks" value={form.internalMarks} onChange={handle} max="30"
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-primary-500 h-11" />
                    </div>
                )}
                {(isPracticalMode || isSemesterMode) && (
                    <div>
                        <label htmlFor="res-practical" className="block text-xs font-bold text-slate-500 mb-1 uppercase">Practical (Max 20)</label>
                        <input id="res-practical" type="number" name="practicalMarks" value={form.practicalMarks} onChange={handle} max="20"
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-primary-500 h-11" />
                    </div>
                )}
                {isSemesterMode && (
                    <div>
                        <label htmlFor="res-external" className="block text-xs font-bold text-slate-500 mb-1 uppercase">Theory / End Sem (Max 50)</label>
                        <input id="res-external" type="number" name="externalMarks" value={form.externalMarks} onChange={handle} max="50"
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-primary-500 h-11" />
                    </div>
                )}
                <div className={isSemesterMode ? '' : 'sm:col-span-2'}>
                    <label htmlFor="res-total" className="block text-xs font-bold text-slate-500 mb-1 uppercase">Total weightage</label>
                    <input id="res-total" type="number" name="outOf" value={form.outOf} disabled
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-500 h-11" />
                </div>
            </div>
            <div className="flex justify-end gap-3 pt-6">
                <Button type="button" variant="glass" onClick={onCancel} className="rounded-xl px-6">Cancel</Button>
                <Button type="submit" disabled={loading} className="rounded-xl px-8 shadow-lg shadow-primary-500/20">
                    {loading && <Loader2 className="animate-spin mr-2" size={16} />}
                    Finalize Entry
                </Button>
            </div>
        </form>
    );
};

// ── Main Component ──────────────────────────────────────────────────────────
const AdminResults = () => {
    const [results, setResults] = useState([]);
    const [branches, setBranches] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [branchFilter, setBranchFilter] = useState('');
    const [semesterFilter, setSemesterFilter] = useState('');
    const [entryModal, setEntryModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const location = useLocation();
    const isInternal = location.pathname.includes('/results/internal');
    const isPractical = location.pathname.includes('/results/practical');
    const isSemester = location.pathname.includes('/results/semester');
    const isAnalytics = location.pathname.includes('/results/analytics');

    const viewTitle = isInternal ? 'Internal Marks Upload' :
        isPractical ? 'Practical Marks Upload' :
            isSemester ? 'Semester Result Upload' :
                isAnalytics ? 'Performance Analytics' : 'Academic Performance';

    useEffect(() => {
        if (location.pathname.includes('/admin/results/internal') || location.pathname.includes('/admin/results/practical')) {
            setEntryModal(true);
        }
    }, [location.pathname]);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [r, b, st] = await Promise.all([
                resultService.getAll(),
                branchService.getAll(),
                studentService.getAll()
            ]);
            setResults(r);
            setBranches(b);
            setStudents(st);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchResults = async () => {
        try {
            const data = await resultService.getAll({
                branch: branchFilter,
                semester: semesterFilter
            });
            setResults(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (!loading) fetchResults();
    }, [branchFilter, semesterFilter]);

    const filtered = useMemo(() => results.filter(r => {
        const q = search.toLowerCase();
        return !q || r.student?.user?.name.toLowerCase().includes(q) || r.student?.rollNumber.toLowerCase().includes(q);
    }), [results, search]);

    const stats = useMemo(() => {
        if (!filtered.length) return { avg: 0, passRate: 0, top: null };
        const avg = filtered.reduce((a, b) => a + (b.internalMarks + b.practicalMarks + b.externalMarks), 0) / filtered.length;
        const passed = filtered.filter(r => r.grade !== 'F').length;
        return {
            avg: Math.round(avg),
            passRate: Math.round((passed / filtered.length) * 100),
            top: [...filtered].sort((a, b) => (b.internalMarks + b.practicalMarks + b.externalMarks) - (a.internalMarks + a.practicalMarks + a.externalMarks))[0]
        };
    }, [filtered]);

    const handleSubmit = async (data) => {
        setSubmitting(true);
        try {
            await resultService.submit(data);
            await fetchResults();
            setEntryModal(false);
        } catch (err) {
            alert('Failed: ' + (err.response?.data?.error || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    const gradeColors = { 'O': 'success', 'A+': 'success', 'A': 'success', 'B+': 'info', 'B': 'info', 'C': 'warning', 'F': 'danger' };

    if (isAnalytics) {
        return (
            <div className="p-4 md:p-6 lg:p-10 min-h-screen">
                <PageHeader title="Performance Analytics" subtitle="Data-driven insights and academic predictions" icon={TrendingUp} />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                    {/* Trend Chart */}
                    <div className="glass-card p-6 rounded-3xl border border-white/10 bg-slate-900/40 backdrop-blur-3xl min-h-[400px]">
                        <h3 className="text-white font-black text-lg mb-8 uppercase tracking-tight flex items-center gap-3">
                            <TrendingUp size={20} className="text-primary-500" /> Performance Trends
                        </h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%" debounce={50}>
                                <AreaChart data={results.slice(0, 10).map((r, i) => ({ name: `S${i + 1}`, score: r.internalMarks + r.practicalMarks + r.externalMarks }))}>
                                    <defs>
                                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                                    <YAxis stroke="#64748b" fontSize={12} />
                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }} />
                                    <Area type="monotone" dataKey="score" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorScore)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Subject Analysis */}
                    <div className="glass-card p-6 rounded-3xl border border-white/10 bg-slate-900/40 backdrop-blur-3xl min-h-[400px]">
                        <h3 className="text-white font-black text-lg mb-8 uppercase tracking-tight flex items-center gap-3">
                            <GraduationCap size={20} className="text-emerald-500" /> Skills Matrix
                        </h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%" debounce={50}>
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                                    { subject: 'Internal', A: 80, fullMark: 100 },
                                    { subject: 'Practical', A: 98, fullMark: 100 },
                                    { subject: 'Theory', A: 86, fullMark: 100 },
                                    { subject: 'Viva', A: 99, fullMark: 100 },
                                    { subject: 'Projects', A: 85, fullMark: 100 },
                                ]}>
                                    <PolarGrid stroke="#ffffff10" />
                                    <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={10} />
                                    <PolarRadiusAxis stroke="#64748b" fontSize={10} />
                                    <Radar name="Student" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Prediction Card */}
                <div className="mt-8 glass-card p-8 rounded-3xl border border-primary-500/20 bg-gradient-to-r from-primary-600/10 to-indigo-600/10 backdrop-blur-3xl relative overflow-hidden group">
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <Badge variant="glass" className="mb-4 bg-primary-500/20 text-primary-400 border-primary-500/20">AI PREDICTION</Badge>
                            <h2 className="text-3xl font-black text-white leading-tight">Projected Semester GPA: <span className="text-primary-400">8.42</span></h2>
                            <p className="text-slate-400 mt-2 max-w-xl">Based on historical data and current internal performance, this student is likely to secure a distinction. Suggested focus: <span className="text-white font-bold">Practical Labs</span>.</p>
                        </div>
                        <Button size="lg" className="rounded-2xl group-hover:scale-105 transition-transform shadow-2xl shadow-primary-500/20">View Detailed Plan</Button>
                    </div>
                </div>
            </div>
        );
    }

    const entryMode = isInternal ? 'internal' : isPractical ? 'practical' : isSemester ? 'semester' : 'semester';

    return (
        <div className="p-4 md:p-6 lg:p-8 min-h-screen">
            <PageHeader
                title={viewTitle}
                subtitle="Centralized management of student examination results"
                icon={ClipboardList}
                action={!isAnalytics && <Button onClick={() => setEntryModal(true)}><Plus size={16} className="mr-2" />Add New Entry</Button>}
            />

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="glass-card p-6 rounded-2xl border-l-4 border-primary-500 group hover:bg-white/[0.04] transition-all">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Average Score</p>
                    <div className="flex items-end gap-2">
                        <span className="text-4xl font-black text-white">{stats.avg}</span>
                        <span className="text-slate-500 mb-1">/100</span>
                    </div>
                </div>
                <div className="glass-card p-6 rounded-2xl border-l-4 border-emerald-500 group hover:bg-white/[0.04] transition-all">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Pass Percentage</p>
                    <span className="text-4xl font-black text-emerald-400">{stats.passRate}%</span>
                </div>
                <div className="glass-card p-6 rounded-2xl border-l-4 border-amber-500 group hover:bg-white/[0.04] transition-all">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Top Performer</p>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold">
                            {(stats.top?.student?.user?.name || '?').charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-white font-bold truncate">{stats.top?.student?.user?.name || '---'}</p>
                            <p className="text-[10px] text-slate-500 truncate">Enrollment: {stats.top?.student?.rollNumber}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="glass-card p-4 rounded-2xl mb-6 flex flex-wrap gap-4">
                <div className="flex-1 min-w-[280px] relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                        id="res-search"
                        type="text"
                        placeholder="Search student name or roll number..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-9 pr-4 text-white text-sm focus:ring-2 focus:ring-primary-500"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select
                    id="res-filter-branch"
                    value={branchFilter}
                    onChange={(e) => setBranchFilter(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:ring-2 focus:ring-primary-500 min-w-[160px]"
                >
                    <option value="">All Branches</option>
                    {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                </select>
                <select
                    id="res-filter-semester"
                    value={semesterFilter}
                    onChange={(e) => setSemesterFilter(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:ring-2 focus:ring-primary-500 min-w-[140px]"
                >
                    <option value="">All Semesters</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                </select>
                <Button variant="glass" className="h-[42px] px-4"><Download size={16} /></Button>
            </div>

            {/* Results Table */}
            <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="animate-spin text-primary-500 mb-4" size={40} />
                        <p className="text-slate-400">Compiling result database...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <EmptyState title="No records found" description="Adjust your filters or add a new result entry." />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[1000px]">
                            <thead className="bg-white/5 border-b border-white/10 uppercase tracking-widest text-[10px] font-bold text-slate-500">
                                <tr>
                                    <th className="px-6 py-4">Student Participant</th>
                                    <th className="px-6 py-4">Academic Semester</th>
                                    <th className="px-6 py-4">Breakdown (I/P/E)</th>
                                    <th className="px-6 py-4">Total</th>
                                    <th className="px-6 py-4">Grade</th>
                                    <th className="px-6 py-4">Added By</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filtered.map(r => {
                                    const total = r.internalMarks + r.practicalMarks + r.externalMarks;
                                    return (
                                        <tr key={r._id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 font-bold group-hover:bg-primary-500 group-hover:text-white transition-colors">
                                                        <User size={14} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-white uppercase">{r.student?.user?.name}</p>
                                                        <p className="text-[10px] text-slate-500 font-mono tracking-tighter">{r.student?.rollNumber}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant="glass" className="text-[11px] font-black px-4 bg-slate-800/50">
                                                    Semester {r.semester}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs">
                                                <span className="text-blue-400">{r.internalMarks}</span>
                                                <span className="text-slate-700 mx-1">/</span>
                                                <span className="text-emerald-400">{r.practicalMarks}</span>
                                                <span className="text-slate-700 mx-1">/</span>
                                                <span className="text-amber-400">{r.externalMarks}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-base font-black text-white">{total}</span>
                                                    <span className="text-[10px] text-slate-600 font-bold">PTS</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant={gradeColors[r.grade] || 'glass'} className="text-[11px] font-black px-3">
                                                    {r.grade}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-primary-500 opacity-50" />
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{r.markedBy?.teacherName || 'System'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                    <button className="p-2 text-slate-500 hover:text-primary-400 hover:bg-white/5 rounded-lg transition-colors"><TrendingUp size={16} /></button>
                                                    <button className="p-2 text-slate-500 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"><AlertCircle size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Modal isOpen={entryModal} onClose={() => setEntryModal(false)} title={`New ${entryMode.charAt(0).toUpperCase() + entryMode.slice(1)} Entry`} size="md">
                <MarksEntryForm
                    branches={branches}
                    students={students}
                    onSubmit={handleSubmit}
                    onCancel={() => setEntryModal(false)}
                    loading={submitting}
                    mode={entryMode}
                />
            </Modal>
        </div>
    );
};

export default AdminResults;
