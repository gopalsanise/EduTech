import React, { useState, useEffect, useMemo } from 'react';
import { BookOpen, Plus, Edit2, Trash2, Search, Loader2, AlertCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';
import subjectService from '../../services/subjectService';
import branchService from '../../services/branchService';

const Subjects = () => {
    const [subjects, setSubjects] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingSubject, setEditingSubject] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({ name: '', code: '', branch: '', semester: 1, credits: 3 });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [s, b] = await Promise.all([
                subjectService.getAll(),
                branchService.getAll()
            ]);
            setSubjects(s);
            setBranches(b);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (subj = null) => {
        if (subj) {
            setEditingSubject(subj);
            setFormData({
                name: subj.name,
                code: subj.code,
                branch: subj.branch?._id || '',
                semester: subj.semester,
                credits: subj.credits
            });
        } else {
            setEditingSubject(null);
            setFormData({ name: '', code: '', branch: '', semester: 1, credits: 3 });
        }
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingSubject) {
                await subjectService.update(editingSubject._id, formData);
            } else {
                await subjectService.create(formData);
            }
            await fetchData();
            setModalOpen(false);
        } catch (err) {
            alert('Operation failed: ' + (err.response?.data?.error || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this subject?')) return;
        try {
            await subjectService.delete(id);
            await fetchData();
        } catch (err) {
            alert('Delete failed');
        }
    };

    const filtered = useMemo(() => subjects.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.code.toLowerCase().includes(search.toLowerCase()) ||
        s.branch?.name.toLowerCase().includes(search.toLowerCase())
    ), [subjects, search]);

    return (
        <div className="p-4 md:p-6 lg:p-8 min-h-screen">
            <PageHeader
                title="Subject Management"
                subtitle="Curriculum definitions and academic course catalog"
                icon={BookOpen}
                action={<Button onClick={() => handleOpenModal()}><Plus size={16} className="mr-2" />Add Subject</Button>}
            />

            <div className="glass-card p-3 rounded-2xl mb-6 flex gap-3 mt-8">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                        type="text"
                        placeholder="Search subjects by name, code or branch..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-9 pr-4 text-white text-sm focus:ring-2 focus:ring-primary-500"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="animate-spin text-primary-500 mb-4" size={40} />
                    <p className="text-slate-400">Loading catalog...</p>
                </div>
            ) : filtered.length === 0 ? (
                <EmptyState title="No subjects found" description="Try adjusting your search or add a new subject." />
            ) : (
                <div className="glass-card rounded-[2.5rem] overflow-hidden border border-white/10 bg-slate-900/40 backdrop-blur-3xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 border-b border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                                <tr>
                                    <th className="px-8 py-6">Subject Code</th>
                                    <th className="px-8 py-6">Course Name</th>
                                    <th className="px-8 py-6">Branch / Sem</th>
                                    <th className="px-8 py-6">Credits</th>
                                    <th className="px-8 py-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filtered.map(s => (
                                    <tr key={s._id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-8 py-5">
                                            <Badge variant="glass" className="font-mono text-primary-400 border-primary-500/20">{s.code}</Badge>
                                        </td>
                                        <td className="px-8 py-5">
                                            <p className="text-white font-bold">{s.name}</p>
                                        </td>
                                        <td className="px-8 py-5">
                                            <p className="text-sm text-slate-300 font-medium">{s.branch?.name || '---'}</p>
                                            <p className="text-[10px] text-slate-600 font-black uppercase">Semester {s.semester}</p>
                                        </td>
                                        <td className="px-8 py-5 text-slate-400 font-bold">{s.credits} CR</td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex justify-end gap-1">
                                                <button onClick={() => handleOpenModal(s)} className="p-2 text-slate-500 hover:text-primary-400 rounded-lg hover:bg-white/5"><Edit2 size={16} /></button>
                                                <button onClick={() => handleDelete(s._id)} className="p-2 text-slate-500 hover:text-red-400 rounded-lg hover:bg-white/5"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingSubject ? "Edit Subject" : "Create New Subject"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <label className="block text-sm text-slate-400 mb-1">Subject Name *</label>
                            <input
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Subject Code *</label>
                            <input
                                required
                                value={formData.code}
                                onChange={e => setFormData({ ...formData, code: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Credits</label>
                            <input
                                type="number"
                                value={formData.credits}
                                onChange={e => setFormData({ ...formData, credits: Number(e.target.value) })}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Branch *</label>
                            <select
                                required
                                value={formData.branch}
                                onChange={e => setFormData({ ...formData, branch: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="">Select Branch</option>
                                {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Semester</label>
                            <select
                                value={formData.semester}
                                onChange={e => setFormData({ ...formData, semester: Number(e.target.value) })}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:ring-2 focus:ring-primary-500"
                            >
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="glass" onClick={() => setModalOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting && <Loader2 className="animate-spin mr-2" size={16} />}
                            {editingSubject ? 'Update Subject' : 'Save Subject'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Subjects;
