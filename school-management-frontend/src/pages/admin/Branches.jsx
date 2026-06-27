import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Shield, Loader2, Search, Building2, User } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import branchService from '../../services/branchService';

const Branches = () => {
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingBranch, setEditingBranch] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [formData, setFormData] = useState({ name: '', code: '', hodName: '', description: '', photo: '' });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(p => ({ ...p, photo: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        fetchBranches();
    }, []);

    const fetchBranches = async () => {
        try {
            setLoading(true);
            const data = await branchService.getAll();
            setBranches(data);
        } catch (err) {
            console.error('Failed to fetch branches:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingBranch) {
                await branchService.update(editingBranch._id, formData);
            } else {
                await branchService.create(formData);
            }
            setModalOpen(false);
            fetchBranches();
        } catch (err) {
            alert('Error saving branch: ' + err.message);
        }
    };

    const handleDelete = async () => {
        try {
            await branchService.delete(deleteId);
            setDeleteId(null);
            fetchBranches();
        } catch (err) {
            alert('Error deleting branch: ' + err.message);
        }
    };

    return (
        <div className="p-4 md:p-6 lg:p-10 min-h-screen">
            <PageHeader
                title="Academic Branches"
                subtitle={`Managing ${branches.length} active departments`}
                icon={Shield}
                iconColor="emerald"
                action={<Button onClick={() => { setEditingBranch(null); setFormData({ name: '', code: '', hodName: '', description: '', photo: '' }); setModalOpen(true); }} className="rounded-2xl px-6"><Plus size={18} className="mr-2" /> Add Department</Button>}
            />

            <div className="glass-card rounded-[2.5rem] overflow-hidden border border-white/10 bg-slate-900/40 backdrop-blur-2xl">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <Loader2 className="animate-spin text-emerald-500 mb-6" size={48} strokeWidth={1.5} />
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Departmental Data...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[900px] border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.02]">
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Departmental Identity</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Administrative Head</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Telemetry</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.03]">
                                {branches.length === 0 ? (
                                    <tr><td colSpan={4}><EmptyState title="No Departments Registered" description="Begin by defining the academic structure of your institution." /></td></tr>
                                ) : branches.map(branch => (
                                    <tr key={branch._id} className="hover:bg-white/[0.04] transition-all group font-medium">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                                                    <Building2 size={24} />
                                                </div>
                                                <div>
                                                    <p className="text-white font-black text-lg tracking-tight uppercase leading-none mb-1">{branch.name}</p>
                                                    <Badge variant="emerald" className="text-[10px] py-0 px-2 font-mono">{branch.code}</Badge>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 overflow-hidden border border-white/5">
                                                    {branch.photo ? (
                                                        <img src={branch.photo} alt={branch.hodName} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User size={16} />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm text-white font-bold">{branch.hodName || 'HEAD NOT ASSIGNED'}</p>
                                                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-0.5">Head of Department</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-xs text-slate-400 italic max-w-xs truncate">{branch.description || 'System-level architectural unit.'}</p>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                                                <button onClick={() => {
                                                    setEditingBranch(branch);
                                                    setFormData({
                                                        name: branch.name,
                                                        code: branch.code,
                                                        hodName: branch.hodName || '',
                                                        description: branch.description || '',
                                                        photo: branch.photo || ''
                                                    });
                                                    setModalOpen(true);
                                                }} className="p-3 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-2xl transition-all border border-transparent hover:border-emerald-500/20">
                                                    <Edit2 size={18} strokeWidth={2.5} />
                                                </button>
                                                <button onClick={() => setDeleteId(branch._id)} className="p-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all border border-transparent hover:border-red-500/20">
                                                    <Trash2 size={18} strokeWidth={2.5} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal for Create/Edit */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingBranch ? 'Edit Department Profile' : 'New Academic Unit'}
                size="md"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="sm:col-span-2">
                            <label htmlFor="br-name" className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">Department Name *</label>
                            <input
                                id="br-name"
                                className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                                placeholder="Computer Science & Engineering"
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label htmlFor="br-code" className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">Branch Code *</label>
                            <input
                                id="br-code"
                                className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all font-mono"
                                placeholder="CSE"
                                required
                                value={formData.code}
                                onChange={e => setFormData({ ...formData, code: e.target.value })}
                            />
                        </div>
                        <div>
                            <label htmlFor="br-hod" className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest text-[10px]">HOD Photograph & Name</label>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 relative group cursor-pointer">
                                    {formData.photo ? (
                                        <img src={formData.photo} alt="HOD" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={16} className="text-slate-700" />
                                    )}
                                    <input id="br-photo" type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" title="Upload HOD Photo" aria-label="Upload HOD Photo" />
                                </div>
                                <input
                                    id="br-hod"
                                    className="flex-1 bg-slate-950 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                                    placeholder="HOD Name"
                                    value={formData.hodName}
                                    onChange={e => setFormData({ ...formData, hodName: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="sm:col-span-2">
                            <label htmlFor="br-desc" className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">Description</label>
                            <textarea
                                id="br-desc"
                                className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all min-h-[120px]"
                                placeholder="Formal summary of the academic unit..."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-8 mt-4 border-t border-white/5">
                        <Button variant="glass" type="button" onClick={() => setModalOpen(false)} className="rounded-2xl px-8">Discard</Button>
                        <Button type="submit" className="rounded-2xl px-8 bg-emerald-600 hover:bg-emerald-700 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                            {editingBranch ? 'Update Department' : 'Establish Unit'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Confirm Delete */}
            <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Revoke Department" size="sm">
                <div className="text-center p-2">
                    <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                        <Trash2 size={36} className="text-red-500" />
                    </div>
                    <h4 className="text-xl font-black text-white mb-2">Decommission Unit?</h4>
                    <p className="text-slate-500 text-sm leading-relaxed mb-8">
                        This action will dissolve the branch in the system core. Associated student and faculty mapping will be orphaned.
                    </p>
                    <div className="flex gap-3">
                        <Button variant="glass" onClick={() => setDeleteId(null)} className="flex-1 rounded-2xl">Abort</Button>
                        <Button className="flex-1 bg-red-600 hover:bg-red-700 shadow-[0_0_20px_rgba(220,38,38,0.4)] rounded-2xl" onClick={handleDelete}>Decommission</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Branches;
