import React, { useState, useMemo } from 'react';
import { FileText, Plus, Edit2, Trash2, Search } from 'lucide-react';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';

const today = new Date();
const fmt = (d) => d.toISOString().split('T')[0];

const INITIAL_EXAMS = [
    { id: 1, examName: 'Regualr End Semester Exams', department: 'CSE', semester: 3, type: 'Internal', date: fmt(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5)), time: '09:00', venue: 'Hall A', duration: '3 hrs', status: 'Upcoming' },
    { id: 2, examName: 'Sessional Assessment', department: 'CSE', semester: 5, type: 'External', date: fmt(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10)), time: '10:00', venue: 'Hall B', duration: '3 hrs', status: 'Upcoming' },
    { id: 3, examName: 'Practical Viva Voce', department: 'ECE', semester: 3, type: 'Internal', date: fmt(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3)), time: '11:00', venue: 'Room 204', duration: '2 hrs', status: 'Completed' },
    { id: 4, examName: 'Mid-Sem Evaluation', department: 'ME', semester: 3, type: 'Practical', date: fmt(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)), time: '08:00', venue: 'ME Lab', duration: '4 hrs', status: 'Upcoming' },
    { id: 5, examName: 'Theory Examination', department: 'IT', semester: 3, type: 'Internal', date: fmt(new Date(today.getFullYear(), today.getMonth(), today.getDate())), time: '14:00', venue: 'Hall C', duration: '2 hrs', status: 'Ongoing' },
    { id: 6, examName: 'Regualr End Semester Exams', department: 'CSE', semester: 5, type: 'External', date: fmt(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7)), time: '09:00', venue: 'Hall A', duration: '3 hrs', status: 'Completed' },
];

const TYPES = ['Internal', 'External', 'Practical'];
const DEPTS = ['CSE', 'ECE', 'ME', 'CE', 'IT', 'EEE'];
const BLANK = { examName: '', department: 'CSE', semester: 3, type: 'Internal', date: '', time: '09:00', venue: '', duration: '3 hrs', status: 'Upcoming' };

const statusVariant = { Upcoming: 'info', Ongoing: 'warning', Completed: 'success' };

const ExamForm = ({ form, setForm, onSubmit, onCancel, isEdit }) => {
    const h = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[['examName', 'Examination Name'], ['venue', 'Venue / Hall']].map(([name, label]) => (
                    <div key={name}>
                        <label className="block text-sm text-slate-400 mb-1">{label} *</label>
                        <input name={name} value={form[name]} onChange={h} required
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                    </div>
                ))}
                <div>
                    <label className="block text-sm text-slate-400 mb-1">Department</label>
                    <select name="department" value={form.department} onChange={h}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-primary-500 focus:outline-none">
                        {DEPTS.map(d => <option key={d}>{d}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm text-slate-400 mb-1">Semester</label>
                    <select name="semester" value={form.semester} onChange={h}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-primary-500 focus:outline-none">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm text-slate-400 mb-1">Exam Type</label>
                    <select name="type" value={form.type} onChange={h}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-primary-500 focus:outline-none">
                        {TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm text-slate-400 mb-1">Date *</label>
                    <input name="date" type="date" value={form.date} onChange={h} required
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                </div>
                <div>
                    <label className="block text-sm text-slate-400 mb-1">Time</label>
                    <input name="time" type="time" value={form.time} onChange={h}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                </div>
                <div>
                    <label className="block text-sm text-slate-400 mb-1">Duration</label>
                    <input name="duration" value={form.duration} onChange={h}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                </div>
                <div>
                    <label className="block text-sm text-slate-400 mb-1">Status</label>
                    <select name="status" value={form.status} onChange={h}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-primary-500 focus:outline-none">
                        <option>Upcoming</option><option>Ongoing</option><option>Completed</option>
                    </select>
                </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="glass" onClick={onCancel}>Cancel</Button>
                <Button type="submit">{isEdit ? 'Update Exam' : 'Schedule Exam'}</Button>
            </div>
        </form>
    );
};

const AdminExaminations = () => {
    const [exams, setExams] = useState(INITIAL_EXAMS);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatus] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [editTarget, setEditTarget] = useState(null);
    const [form, setForm] = useState(BLANK);

    const filtered = useMemo(() => exams.filter(e => {
        const q = search.toLowerCase();
        return (!q || e.examName.toLowerCase().includes(q) || e.department.toLowerCase().includes(q) || e.venue.toLowerCase().includes(q)) &&
            (!typeFilter || e.type === typeFilter) &&
            (!statusFilter || e.status === statusFilter);
    }), [exams, search, typeFilter, statusFilter]);

    const openAdd = () => { setEditTarget(null); setForm(BLANK); setModalOpen(true); };
    const openEdit = e => { setEditTarget(e.id); setForm({ ...e }); setModalOpen(true); };
    const closeModal = () => { setModalOpen(false); setEditTarget(null); };

    const handleSubmit = e => {
        e.preventDefault();
        editTarget ? setExams(p => p.map(ex => ex.id === editTarget ? { ...form, id: editTarget, semester: Number(form.semester) } : ex))
            : setExams(p => [...p, { ...form, id: Date.now(), semester: Number(form.semester) }]);
        closeModal();
    };

    return (
        <div className="p-4 md:p-6 lg:p-8 min-h-screen">
            <PageHeader title="Examinations" subtitle="Schedule and manage examination events" icon={FileText}
                action={<Button onClick={openAdd}><Plus size={16} className="mr-2" />Schedule Exam</Button>} />

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Total Exams', value: exams.length, color: 'primary' },
                    { label: 'Upcoming', value: exams.filter(e => e.status === 'Upcoming').length, color: 'blue' },
                    { label: 'Ongoing', value: exams.filter(e => e.status === 'Ongoing').length, color: 'yellow' },
                    { label: 'Completed', value: exams.filter(e => e.status === 'Completed').length, color: 'green' },
                ].map(card => (
                    <div key={card.label} className={`glass-card p-4 rounded-xl border border-${card.color}-500/20`}>
                        <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">{card.label}</p>
                        <p className={`text-3xl font-bold text-${card.color}-400 mt-1`}>{card.value}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="glass-card p-4 rounded-2xl mb-6 flex flex-wrap gap-3">
                <div className="flex-1 min-w-[160px] relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input type="text" placeholder="Search exam, dept, venue..."
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 pl-9 pr-4 text-white text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                        value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-primary-500 focus:outline-none">
                    <option value="">All Types</option>{TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
                <select value={statusFilter} onChange={e => setStatus(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-primary-500 focus:outline-none">
                    <option value="">All Status</option>
                    <option>Upcoming</option><option>Ongoing</option><option>Completed</option>
                </select>
            </div>

            {/* Table */}
            <div className="glass-card rounded-2xl overflow-x-auto">
                <table className="w-full text-left min-w-[750px]">
                    <thead className="border-b border-white/10 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                        <tr>
                            <th className="px-5 py-4">Examination</th>
                            <th className="px-5 py-4">Dept / Sem</th>
                            <th className="px-5 py-4">Type</th>
                            <th className="px-5 py-4">Date & Time</th>
                            <th className="px-5 py-4">Venue</th>
                            <th className="px-5 py-4">Status</th>
                            <th className="px-5 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filtered.length === 0 ? (
                            <tr><td colSpan={7}><EmptyState title="No exams found" /></td></tr>
                        ) : filtered.map(e => (
                            <tr key={e.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-5 py-3.5 font-semibold text-white">{e.examName}</td>
                                <td className="px-5 py-3.5 text-slate-400 text-sm">{e.department} / Sem {e.semester}</td>
                                <td className="px-5 py-3.5"><Badge variant={e.type === 'Internal' ? 'info' : e.type === 'External' ? 'purple' : 'warning'}>{e.type}</Badge></td>
                                <td className="px-5 py-3.5 text-sm">
                                    <p className="text-white">{e.date}</p>
                                    <p className="text-slate-500 text-xs">{e.time} · {e.duration}</p>
                                </td>
                                <td className="px-5 py-3.5 text-slate-300 text-sm">{e.venue}</td>
                                <td className="px-5 py-3.5"><Badge variant={statusVariant[e.status]}>{e.status}</Badge></td>
                                <td className="px-5 py-3.5 text-right space-x-1">
                                    <button onClick={() => openEdit(e)} className="p-1.5 text-slate-500 hover:text-primary-400 rounded-lg hover:bg-white/5"><Edit2 size={15} /></button>
                                    <button onClick={() => setDeleteId(e.id)} className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-white/5"><Trash2 size={15} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={modalOpen} onClose={closeModal} title={editTarget ? 'Edit Exam' : 'Schedule New Exam'}>
                <ExamForm form={form} setForm={setForm} onSubmit={handleSubmit} onCancel={closeModal} isEdit={!!editTarget} />
            </Modal>
            <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Exam" size="sm">
                <p className="text-slate-300 mb-6">Remove this exam from the schedule?</p>
                <div className="flex justify-end gap-3">
                    <Button variant="glass" onClick={() => setDeleteId(null)}>Cancel</Button>
                    <Button className="bg-red-600 hover:bg-red-700" onClick={() => { setExams(p => p.filter(e => e.id !== deleteId)); setDeleteId(null); }}>Delete</Button>
                </div>
            </Modal>
        </div>
    );
};

export default AdminExaminations;
