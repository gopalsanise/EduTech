import React, { useState, useEffect } from 'react';
import {
    ClipboardList, Plus, Search, Loader2, BookOpen,
    Calendar, User, FileText, Upload, CheckCircle,
    AlertCircle, ExternalLink, Filter, GraduationCap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import assignmentService from '../services/assignmentService';
import facultyService from '../services/facultyService';
import studentService from '../services/studentService';
import Button from '../components/ui/Button';
import PageHeader from '../components/ui/PageHeader';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import { motion, AnimatePresence } from 'framer-motion';

const Assignments = () => {
    const { user } = useAuth();
    const isStaff = user?.role === 'staff' || user?.role === 'teacher';

    const [assignments, setAssignments] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterSemester, setFilterSemester] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [submitModalOpen, setSubmitModalOpen] = useState(false);

    const [form, setForm] = useState({
        title: '',
        description: '',
        semester: '',
        deadline: '',
        studyMaterial: []
    });

    const [submissionForm, setSubmissionForm] = useState({
        fileUrl: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            if (isStaff) {
                const profile = await facultyService.getMe();
                setSemesters(profile.assignedSemesters || []);
            } else {
                const profile = await studentService.getMe();
                setSemesters([profile.semester]);
            }

            const allAssignments = await assignmentService.getAll();
            setAssignments(allAssignments);
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await assignmentService.create(form);
            await fetchData();
            setModalOpen(false);
            setForm({ title: '', description: '', semester: '', deadline: '', studyMaterial: [] });
        } catch (err) {
            alert('Failed to create assignment');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmitAssignment = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await assignmentService.submit(selectedAssignment._id, submissionForm);
            await fetchData();
            setSubmitModalOpen(false);
            setSubmissionForm({ fileUrl: '' });
        } catch (err) {
            alert('Submission failed');
        } finally {
            setSubmitting(false);
        }
    };

    const filtered = assignments.filter(a => {
        const matchesSearch = a.title?.toLowerCase().includes(search.toLowerCase()) ||
            a.description?.toLowerCase().includes(search.toLowerCase());
        const matchesSemester = !filterSemester || a.semester === Number(filterSemester);
        return matchesSearch && matchesSemester;
    });

    return (
        <div className="p-4 md:p-6 lg:p-10 min-h-screen">
            <PageHeader
                title="Academic Taskforce"
                subtitle={isStaff ? "Distribute tasks and track student progress" : "Review assignments and submit coursework"}
                icon={ClipboardList}
                iconColor="sky"
                action={isStaff && (
                    <Button onClick={() => setModalOpen(true)} className="rounded-2xl px-6">
                        <Plus size={18} className="mr-2" /> New Assignment
                    </Button>
                )}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8 mt-8">
                <div className="lg:col-span-2 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search by title, description..."
                        className="w-full bg-slate-900 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:ring-2 focus:ring-primary-500"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                    <select
                        className="w-full bg-slate-900 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm appearance-none focus:ring-2 focus:ring-primary-500"
                        value={filterSemester}
                        onChange={e => setFilterSemester(e.target.value)}
                    >
                        <option value="">All Semesters</option>
                        {semesters.map(s => <option key={s} value={s}>Semester {s}</option>)}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24">
                    <Loader2 className="animate-spin text-sky-500 mb-4" size={48} />
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Accessing Assignment Vault...</p>
                </div>
            ) : filtered.length === 0 ? (
                <EmptyState
                    title="No assignments found"
                    description={isStaff ? "You haven't posted any assignments for these filters." : "No pending tasks found for your curriculum."}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {filtered.map((a, idx) => (
                            <motion.div
                                key={a._id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                className="glass-card group flex flex-col h-full bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] overflow-hidden hover:border-sky-500/50 transition-all p-6"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <Badge className="bg-sky-500/10 text-sky-400 border-sky-500/20 uppercase font-black text-[9px] px-3">
                                        Semester {a.semester || '?'}
                                    </Badge>
                                    <div className="text-[10px] text-slate-500 flex items-center gap-1.5 font-bold uppercase tracking-wider">
                                        <Calendar size={12} /> {new Date(a.deadline).toLocaleDateString()}
                                    </div>
                                </div>

                                <h3 className="text-white font-black text-lg uppercase tracking-tight leading-tight mb-2 group-hover:text-sky-400 transition-colors">
                                    {a.title}
                                </h3>
                                <p className="text-slate-400 text-xs leading-relaxed mb-6 line-clamp-3">
                                    {a.description || 'No additional instructions provided for this task.'}
                                </p>

                                <div className="mt-auto space-y-4">
                                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-widest border-t border-white/5 pt-4">
                                        <span className="flex items-center gap-1.5"><User size={12} className="text-slate-600" /> {a.faculty?.name || 'Faculty'}</span>
                                        <span className="flex items-center gap-1.5"><FileText size={12} className="text-slate-600" /> {a.submissions?.length || 0} Submissions</span>
                                    </div>

                                    {!isStaff && (
                                        <Button
                                            onClick={() => { setSelectedAssignment(a); setSubmitModalOpen(true); }}
                                            className="w-full rounded-2xl bg-sky-600 hover:bg-sky-500 shadow-[0_0_20px_rgba(2,132,199,0.2)] uppercase font-black tracking-widest text-[10px] py-4"
                                        >
                                            Submit Solution
                                        </Button>
                                    )}
                                    {isStaff && (
                                        <Button
                                            variant="glass"
                                            className="w-full rounded-2xl border-white/10 hover:border-sky-500/30 uppercase font-black tracking-widest text-[10px] py-4"
                                        >
                                            Review Submissions
                                        </Button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Create Assignment Modal (Staff) */}
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Broadcast Assignment" size="md">
                <form onSubmit={handleCreate} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Target Semester *</label>
                            <select
                                required
                                className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:ring-2 focus:ring-sky-500"
                                value={form.semester}
                                onChange={e => setForm({ ...form, semester: e.target.value })}
                            >
                                <option value="">Select Target Semester</option>
                                {semesters.map(s => <option key={s} value={s}>Semester {s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Task Title *</label>
                            <input
                                required
                                placeholder="e.g. Analysis of Neural Architectures"
                                className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:ring-2 focus:ring-sky-500"
                                value={form.title}
                                onChange={e => setForm({ ...form, title: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Instructions</label>
                            <textarea
                                placeholder="Detail the requirements, constraints and learning objectives..."
                                className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:ring-2 focus:ring-sky-500 min-h-[120px]"
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Submission Deadline *</label>
                            <input
                                required
                                type="datetime-local"
                                className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:ring-2 focus:ring-sky-500"
                                value={form.deadline}
                                onChange={e => setForm({ ...form, deadline: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="flex gap-3 pt-4 border-t border-white/10">
                        <Button type="button" variant="glass" onClick={() => setModalOpen(false)} className="flex-1 rounded-2xl">Discard</Button>
                        <Button type="submit" disabled={submitting} className="flex-1 rounded-2xl bg-sky-600 shadow-[0_0_20px_rgba(2,132,199,0.3)]">
                            {submitting ? <Loader2 className="animate-spin" size={20} /> : 'Deploy Assignment'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Submit Assignment Modal (Student) */}
            <Modal isOpen={submitModalOpen} onClose={() => setSubmitModalOpen(false)} title="Telemetry Submission" size="sm">
                <form onSubmit={handleSubmitAssignment} className="space-y-6">
                    <div className="p-4 bg-sky-500/10 border border-sky-500/20 rounded-2xl">
                        <p className="text-xs text-sky-400 font-bold mb-1 uppercase tracking-tight">Active Task</p>
                        <p className="text-white font-black uppercase text-sm">{selectedAssignment?.title}</p>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Repository / File URL *</label>
                        <div className="relative">
                            <Upload className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                            <input
                                required
                                type="url"
                                placeholder="https://github.com/... or Google Drive link"
                                className="w-full bg-slate-950 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:ring-2 focus:ring-sky-500"
                                value={submissionForm.fileUrl}
                                onChange={e => setSubmissionForm({ fileUrl: e.target.value })}
                            />
                        </div>
                        <p className="text-[10px] text-slate-600 mt-2 italic">Ensure access permissions are enabled for faculty review.</p>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant="glass" onClick={() => setSubmitModalOpen(false)} className="flex-1 rounded-2xl">Abort</Button>
                        <Button type="submit" disabled={submitting} className="flex-1 rounded-2xl bg-sky-600 shadow-[0_0_20px_rgba(2,132,199,0.3)]">
                            {submitting ? <Loader2 className="animate-spin" size={20} /> : 'Authorize Upload'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Assignments;
