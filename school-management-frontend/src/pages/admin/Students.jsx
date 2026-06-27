import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { UserPlus, Search, Edit2, Trash2, Users, Loader2, Mail, Phone, GraduationCap, Building2, Filter, Download } from 'lucide-react';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';
import api from '../../services/api';
import studentService from '../../services/studentService';
import branchService from '../../services/branchService';

// ── Sub-Components ──────────────────────────────────────────────────────────
const StudentForm = ({ form, setForm, branches, onSubmit, onCancel, isEdit, loading }) => {
    const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setForm(p => ({ ...p, photo: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="sm:col-span-2">
                    <label htmlFor="stu-name" className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">Full Name *</label>
                    <input id="stu-name" name="name" value={form.name} onChange={handleChange} required placeholder="John Doe"
                        className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all" />
                </div>
                <div>
                    <label htmlFor="stu-roll" className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">Enrollment Number *</label>
                    <input id="stu-roll" name="rollNumber" value={form.rollNumber} onChange={handleChange} required placeholder="CS2024001"
                        className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:ring-2 focus:ring-primary-500 focus:outline-none font-mono" />
                </div>
                <div>
                    <label htmlFor="stu-branch" className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">Branch *</label>
                    <select id="stu-branch" name="branch" value={form.branch} onChange={handleChange} required
                        className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:ring-2 focus:ring-primary-500 focus:outline-none">
                        <option value="">Select Branch</option>
                        {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="stu-semester" className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">Semester *</label>
                    <select id="stu-semester" name="semester" value={form.semester} onChange={handleChange} required
                        className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:ring-2 focus:ring-primary-500 focus:outline-none">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="stu-section" className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">Section</label>
                    <input id="stu-section" name="section" value={form.section} onChange={handleChange} placeholder="e.g. A"
                        className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:ring-2 focus:ring-primary-500 focus:outline-none uppercase" />
                </div>
                <div className="sm:col-span-2">
                    <label htmlFor="stu-email" className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">Email Address *</label>
                    <input id="stu-email" name="email" type="email" value={form.email} onChange={handleChange} required placeholder="john@college.edu"
                        className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                </div>
                <div>
                    <label htmlFor="stu-dob" className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">Date of Birth *</label>
                    <input id="stu-dob" name="dob" type="date" value={form.dob ? form.dob.split('T')[0] : ''} onChange={handleChange} required
                        className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                </div>
                <div>
                    <label htmlFor="stu-phone" className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">Phone Number</label>
                    <div className="relative flex items-center">
                        <span className="absolute left-5 text-slate-400 font-bold pointer-events-none">+91</span>
                        <input id="stu-phone" name="phone" value={form.phone} onChange={(e) => setForm(p => ({ ...p, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))} placeholder="0000000000" pattern="[0-9]{10}" maxLength={10}
                            className="w-full bg-slate-950 border border-white/10 rounded-2xl pl-12 pr-5 py-3.5 text-white focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                    </div>
                </div>
                <div>
                    <label htmlFor="stu-status" className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">Student Status</label>
                    <select id="stu-status" name="status" value={form.status} onChange={handleChange}
                        className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:ring-2 focus:ring-primary-500 focus:outline-none">
                        <option value="Active">Active</option>
                        <option value="Newly Registered">Newly Registered</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                </div>
                <div className="sm:col-span-2">
                    <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest text-[10px]">Optional Profile Photo</label>
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 rounded-3xl bg-slate-900 border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden shrink-0 group relative cursor-pointer hover:border-primary-500/50 transition-all">
                            {form.photo ? (
                                <img src={form.photo} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <Users size={24} className="text-slate-700" />
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs text-slate-400 font-medium mb-2">Upload a formal student photograph. Max size 2MB (JPEG/PNG).</p>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="block w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-[11px] file:font-black file:uppercase file:bg-primary-500/10 file:text-primary-400 hover:file:bg-primary-500/20 cursor-pointer"
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex justify-end gap-3 pt-8 mt-4 border-t border-white/5">
                <Button type="button" variant="glass" onClick={onCancel} disabled={loading} className="rounded-2xl px-8">Discard</Button>
                <Button type="submit" disabled={loading} className="rounded-2xl px-8">
                    {loading ? <Loader2 className="animate-spin" size={20} /> : (isEdit ? 'Save Changes' : 'Register Student')}
                </Button>
            </div>
        </form>
    );
};

// ── Main Component ──────────────────────────────────────────────────────────
const AdminStudents = () => {
    const [students, setStudents] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [branchFilter, setBranchFilter] = useState('');
    const [semesterFilter, setSemesterFilter] = useState('');

    const [modalOpen, setModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [editTarget, setEditTarget] = useState(null);
    const [form, setForm] = useState({
        name: '', rollNumber: '', branch: '', semester: 1,
        section: '', email: '', phone: '', dob: '', status: 'Active', batch: '2024', photo: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const location = useLocation();

    useEffect(() => {
        if (location.pathname === '/admin/students/add') {
            setEditTarget(null);
            setForm({
                name: '', rollNumber: '', branch: '', semester: 1,
                section: '', email: '', phone: '', dob: '', status: 'Newly Registered', batch: '2024'
            });
            setModalOpen(true);
        }
    }, [location.pathname]);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [studentData, branchData] = await Promise.all([
                studentService.getAll(),
                branchService.getAll()
            ]);
            setStudents(studentData);
            setBranches(branchData);
        } catch (err) {
            console.error('Failed to fetch data:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async () => {
        try {
            const data = await studentService.getAll({
                branch: branchFilter,
                semester: semesterFilter
            });
            setStudents(data);
        } catch (err) {
            console.error('Failed to fetch students:', err);
        }
    };

    useEffect(() => {
        if (!loading) fetchStudents();
    }, [branchFilter, semesterFilter]);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return students.filter(s => {
            const name = s.user?.name || s.name || '';
            const email = s.user?.email || s.email || '';
            const roll = s.rollNumber || '';
            return !q || name.toLowerCase().includes(q) || roll.toLowerCase().includes(q) || email.toLowerCase().includes(q);
        });
    }, [students, search]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = { ...form, phone: form.phone ? '+91' + form.phone : '' };
            if (editTarget) {
                await studentService.update(editTarget, payload);
            } else {
                await studentService.create(payload);
            }
            await fetchStudents();
            setModalOpen(false);
        } catch (err) {
            alert('Operation failed: ' + (err.response?.data?.error || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        try {
            await studentService.delete(deleteId);
            setDeleteId(null);
            fetchStudents();
        } catch (err) {
            alert('Delete failed: ' + err.message);
        }
    };

    return (
        <div className="p-4 md:p-6 lg:p-10 min-h-screen">
            <PageHeader
                title="Student Registry"
                subtitle={`Managing ${students.length} enrollment profiles`}
                icon={Users}
                action={<Button onClick={() => { setEditTarget(null); setForm({ name: '', rollNumber: '', branch: '', semester: 1, section: '', email: '', phone: '', dob: '', status: 'Newly Registered', batch: '2024', photo: '' }); setModalOpen(true); }} className="rounded-2xl px-6"><UserPlus size={18} className="mr-2" /> Register Student</Button>}
            />

            {/* Premium Controls */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 mb-8">
                <div className="xl:col-span-2 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        id="stu-search"
                        type="text"
                        placeholder="Search student by name, UID or email..."
                        className="w-full bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-[1.2rem] py-4 pl-12 pr-4 text-white text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all placeholder:text-slate-600"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-2 gap-3 xl:col-span-2">
                    <div className="relative">
                        <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                        <select
                            id="stu-filter-branch"
                            value={branchFilter}
                            onChange={(e) => setBranchFilter(e.target.value)}
                            className="w-full bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-[1.2rem] py-4 pl-10 pr-4 text-white text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none appearance-none"
                        >
                            <option value="">All Branches</option>
                            {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                        </select>
                    </div>

                    <select
                        id="stu-filter-semester"
                        value={semesterFilter}
                        onChange={(e) => setSemesterFilter(e.target.value)}
                        className="w-full bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-[1.2rem] py-4 px-4 text-white text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none appearance-none"
                    >
                        <option value="">All Semesters</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                    </select>
                </div>
            </div>

            {/* Table Area */}
            <div className="glass-card rounded-[2.5rem] overflow-hidden border border-white/10 bg-slate-900/40 backdrop-blur-2xl">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <Loader2 className="animate-spin text-primary-500 mb-6" size={48} strokeWidth={1.5} />
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Synchronizing Database...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[1100px] border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.02]">
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Student Identity</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Credential</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Academics</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Status</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.03]">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={5}>
                                            <EmptyState title="No Records Found" description="The database returned zero matches for your current selection." />
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((s, i) => (
                                        <tr key={s._id} className="hover:bg-white/[0.04] transition-all group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-600/20 to-indigo-600/20 border border-white/10 flex items-center justify-center text-primary-400 font-black text-lg shadow-xl shrink-0 group-hover:scale-110 transition-transform overflow-hidden">
                                                        {s.photo || s.user?.photo ? (
                                                            <img src={s.photo || s.user?.photo} alt={s.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            (s.user?.name || s.name || 'S').charAt(0)
                                                        )}
                                                    </div>
                                                    <div className="max-w-[200px]">
                                                        <p className="font-black text-white text-base truncate tracking-tight uppercase">{s.user?.name || s.name}</p>
                                                        <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5 font-medium truncate italic"><Mail size={12} className="shrink-0" /> {s.user?.email || s.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="bg-slate-950/50 border border-white/5 rounded-xl px-3 py-2 inline-block">
                                                    <p className="text-sm font-mono font-bold text-primary-400 tracking-tighter">{s.rollNumber || 'NO_UID'}</p>
                                                    <p className="text-[9px] text-slate-600 font-black uppercase mt-0.5 tracking-widest">{s.uniqueStudentId ? `UID: ${s.uniqueStudentId}` : 'ID PENDING'}</p>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(14,165,233,0.8)]" />
                                                        <span className="text-sm text-white font-bold tracking-tight">{s.branch?.name || 'GENERIC'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <Badge variant="default" className="bg-slate-800/40 text-[10px] border-white/5 py-0">SEM {s.semester}</Badge>
                                                        {s.section && <span className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">SEC {s.section}</span>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <Badge variant={
                                                    s.status === 'Active' ? 'emerald' :
                                                        s.status === 'Newly Registered' ? 'warning' : 'danger'
                                                } className="text-[10px] py-1 px-3 border-none bg-opacity-10 font-black">{s.status}</Badge>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                                                    <button onClick={() => {
                                                        setEditTarget(s._id);
                                                        setForm({
                                                            name: s.user?.name || s.name || '',
                                                            email: s.user?.email || s.email || '',
                                                            rollNumber: s.rollNumber,
                                                            branch: s.branch?._id || '',
                                                            semester: s.semester,
                                                            section: s.section || '',
                                                            phone: s.phone ? s.phone.replace('+91', '').trim() : '',
                                                            dob: s.dob ? s.dob.split('T')[0] : '',
                                                            status: s.status,
                                                            batch: s.batch,
                                                            photo: s.photo || s.user?.photo || ''
                                                        });
                                                        setModalOpen(true);
                                                    }} className="p-3 text-slate-400 hover:text-primary-400 hover:bg-primary-500/10 rounded-2xl transition-all border border-transparent hover:border-primary-500/20">
                                                        <Edit2 size={18} strokeWidth={2.5} />
                                                    </button>
                                                    <button onClick={() => setDeleteId(s._id)} className="p-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all border border-transparent hover:border-red-500/20">
                                                        <Trash2 size={18} strokeWidth={2.5} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modals */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editTarget ? 'Modify Student Profile' : 'New Enrollment Portal'}
                size="md"
            >
                <StudentForm
                    form={form} setForm={setForm} branches={branches}
                    onSubmit={handleSubmit} onCancel={() => setModalOpen(false)}
                    isEdit={!!editTarget} loading={submitting}
                />
            </Modal>

            <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Terminate Profile" size="sm">
                <div className="text-center p-2">
                    <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                        <Trash2 size={36} className="text-red-500" />
                    </div>
                    <h4 className="text-xl font-black text-white mb-2">Are you absolutely sure?</h4>
                    <p className="text-slate-500 text-sm leading-relaxed mb-8">
                        This operation will permanently purge the student record and all associated academic telemetry. This cannot be undone.
                    </p>
                    <div className="flex gap-3">
                        <Button variant="glass" onClick={() => setDeleteId(null)} className="flex-1 rounded-2xl">Cancel</Button>
                        <Button className="flex-1 bg-red-600 hover:bg-red-700 shadow-[0_0_20px_rgba(220,38,38,0.4)] rounded-2xl" onClick={handleDelete}>Purge Data</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default AdminStudents;
