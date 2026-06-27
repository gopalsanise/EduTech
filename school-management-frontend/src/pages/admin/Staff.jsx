import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { UserCheck, UserPlus, Edit2, Trash2, Search, Mail, Phone, Building2, BookOpen, Loader2, Filter, GraduationCap, X, CheckCircle2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';
import facultyService from '../../services/facultyService';
import branchService from '../../services/branchService';
import { motion } from 'framer-motion';

// ── Sub-Components ──────────────────────────────────────────────────────────
const FacultyForm = ({ form, setForm, branches, onSubmit, onCancel, isEdit, loading }) => {
    const handle = e => {
        const { name, value, checked, type } = e.target;
        if (type === 'checkbox' && name === 'assignedSemesters') {
            const semester = Number(value);
            setForm(p => ({
                ...p,
                assignedSemesters: checked
                    ? [...p.assignedSemesters, semester].sort((a,b) => a-b)
                    : p.assignedSemesters.filter(s => s !== semester)
            }));
        } else {
            setForm(p => ({ ...p, [name]: value }));
        }
    };

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
                    <label htmlFor="fac-name" className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">Full Name *</label>
                    <input id="fac-name" name="name" value={form.name} onChange={handle} required placeholder="Dr. Alice Smith"
                        className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all" />
                </div>
                <div>
                    <label htmlFor="fac-employee-id" className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">Employee ID *</label>
                    <input id="fac-employee-id" name="employeeId" value={form.employeeId} onChange={handle} required placeholder="FAC102"
                        className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:ring-2 focus:ring-primary-500 focus:outline-none font-mono" />
                </div>
                <div>
                    <label htmlFor="fac-designation" className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">Designation *</label>
                    <select id="fac-designation" name="designation" value={form.designation} onChange={handle} required
                        className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:ring-2 focus:ring-primary-500 focus:outline-none">
                        <option>Professor</option>
                        <option>Associate Professor</option>
                        <option>Assistant Professor</option>
                        <option>Lab Instructor</option>
                        <option>HOD</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="fac-status" className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">Status *</label>
                    <select id="fac-status" name="status" value={form.status} onChange={handle} required
                        className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:ring-2 focus:ring-primary-500 focus:outline-none">
                        <option value="Approved">Approved</option>
                        <option value="Pending">Pending Application</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="fac-branch" className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">Branch *</label>
                    <select id="fac-branch" name="branch" value={form.branch} onChange={handle} required
                        className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:ring-2 focus:ring-primary-500 focus:outline-none">
                        <option value="">Select Branch</option>
                        {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                    </select>
                </div>
                <div className="sm:col-span-2">
                    <label className="block text-xs font-black text-slate-500 mb-4 uppercase tracking-[0.2em]">Assigned Semesters *</label>
                    <div className="grid grid-cols-4 gap-3 bg-slate-950/50 p-4 rounded-2xl border border-white/5">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                            <label key={s} className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all cursor-pointer ${form.assignedSemesters.includes(s) ? 'bg-primary-500/10 border-primary-500/50 text-primary-400' : 'bg-slate-900 border-white/5 text-slate-500 hover:border-white/20'}`}>
                                <input
                                    type="checkbox"
                                    name="assignedSemesters"
                                    value={s}
                                    checked={form.assignedSemesters.includes(s)}
                                    onChange={handle}
                                    className="hidden"
                                />
                                <span className="text-[10px] font-black uppercase tracking-widest">SEM {s}</span>
                            </label>
                        ))}
                    </div>
                </div>
                <div>
                    <label htmlFor="fac-qualification" className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">Highest Qualification</label>
                    <input id="fac-qualification" name="qualification" value={form.qualification} onChange={handle} placeholder="e.g. PhD in Computer Science"
                        className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                </div>
                <div>
                    <label htmlFor="fac-education" className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">Detailed Education</label>
                    <input id="fac-education" name="education" value={form.education} onChange={handle} placeholder="Graduate from Stanford University"
                        className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                </div>
                <div>
                    <label htmlFor="fac-father" className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">Father's Name</label>
                    <input id="fac-father" name="fatherName" value={form.fatherName} onChange={handle} placeholder="John Doe"
                        className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                </div>
                <div>
                    <label htmlFor="fac-mother" className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">Mother's Name</label>
                    <input id="fac-mother" name="motherName" value={form.motherName} onChange={handle} placeholder="Jane Doe"
                        className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                </div>
                <div>
                    <label htmlFor="fac-dob" className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">Date of Birth</label>
                    <input id="fac-dob" name="dob" type="date" value={form.dob} onChange={handle}
                        className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                </div>
                <div>
                    <label htmlFor="fac-dept" className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">Department Name</label>
                    <input id="fac-dept" name="department" value={form.department} onChange={handle} placeholder="Computer Science"
                        className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                </div>
                <div className="sm:col-span-2">
                    <label htmlFor="fac-email" className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">Official Email *</label>
                    <input id="fac-email" name="email" type="email" value={form.email} onChange={handle} required placeholder="alice@college.edu"
                        className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                </div>
                <div>
                    <label htmlFor="fac-phone" className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">Phone Number</label>
                    <div className="relative flex items-center">
                        <span className="absolute left-5 text-slate-400 font-bold pointer-events-none">+91</span>
                        <input id="fac-phone" name="phone" value={form.phone} onChange={(e) => setForm(p => ({ ...p, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))} placeholder="0000000000" pattern="[0-9]{10}" maxLength={10}
                            className="w-full bg-slate-950 border border-white/10 rounded-2xl pl-12 pr-5 py-3.5 text-white focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                    </div>
                </div>
                <div className="sm:col-span-2">
                    <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest text-[10px]">Optional Profile Photo</label>
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 rounded-3xl bg-slate-900 border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden shrink-0 group relative cursor-pointer hover:border-primary-500/50 transition-all">
                            {form.photo ? (
                                <img src={form.photo} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <GraduationCap size={24} className="text-slate-700" />
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs text-slate-400 font-medium mb-2">Upload a formal faculty photograph. Preferred for HODs.</p>
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
                    {loading ? <Loader2 className="animate-spin" size={20} /> : (isEdit ? 'Update Faculty' : 'Register Faculty')}
                </Button>
            </div>
        </form>
    );
};

const AdminStaff = () => {
    const [staff, setStaff] = useState([]);
    const [branches, setBranches] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [branchFilter, setBranchFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [editTarget, setEditTarget] = useState(null);
    const [form, setForm] = useState({
        name: '', email: '', employeeId: '', designation: 'Assistant Professor',
        branch: '', assignedSemesters: [1], qualification: '', education: '', phone: '',
        fatherName: '', motherName: '', dob: '', department: '',
        status: 'Approved', photo: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const location = useLocation();

    useEffect(() => {
        if (location.pathname === '/admin/staff/add') {
            setEditTarget(null);
            setForm({
                name: '', email: '', employeeId: '', designation: 'Assistant Professor',
                branch: '', assignedSemesters: [1], qualification: '', phone: '', dob: '',
                status: 'Active', photo: ''
            });
            setModalOpen(true);
        }
    }, [location.pathname]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [staffRes, branchRes] = await Promise.all([
                facultyService.getAll(),
                branchService.getAll()
            ]);
            setStaff(staffRes);
            setBranches(branchRes);
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const filtered = useMemo(() => staff.filter(s => {
        const q = search.toLowerCase();
        const name = s.user?.name || s.name || '';
        const empId = s.employeeId || '';
        const desig = s.designation || '';
        const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
        
        return (!q || name.toLowerCase().includes(q) || desig.toLowerCase().includes(q) || empId.toLowerCase().includes(q)) &&
            (!branchFilter || s.branch?._id === branchFilter) &&
            matchesStatus;
    }), [staff, search, branchFilter, statusFilter]);

    const handleOpenEdit = s => {
        setEditTarget(s._id);
        setForm({
            name: s.user?.name || s.name || '',
            email: s.user?.email || s.email || '',
            employeeId: s.employeeId || '',
            designation: s.designation,
            branch: s.branch?._id || '',
            qualification: s.qualification || '',
            education: s.education || '',
            phone: s.phone ? s.phone.replace('+91', '').trim() : '',
            fatherName: s.fatherName || '',
            motherName: s.motherName || '',
            dob: s.dob ? s.dob.split('T')[0] : '',
            department: s.department || '',
            assignedSemesters: s.assignedSemesters || [1],
            status: s.status || 'Approved',
            photo: s.photo || s.user?.photo || ''
        });
        setModalOpen(true);
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = { ...form, phone: form.phone ? '+91' + form.phone : '' };
            if (editTarget) await facultyService.update(editTarget, payload);
            else await facultyService.create(payload);
            await fetchData();
            setModalOpen(false);
        } catch (err) {
            alert('Operation failed: ' + (err.response?.data?.error || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-4 md:p-6 lg:p-10 min-h-screen">
            <PageHeader title="Faculty Registry" subtitle={`Orchestrating ${staff.length} academic professionals`} icon={UserCheck} iconColor="purple"
                action={<Button onClick={() => {
                    setEditTarget(null);
                    setForm({
                        name: '', email: '', employeeId: '', designation: 'Assistant Professor',
                        branch: '', assignedSemesters: [1], qualification: '', education: '',
                        fatherName: '', motherName: '', dob: '', department: '',
                        phone: '', status: 'Approved', photo: ''
                    });
                    setModalOpen(true);
                }} className="rounded-2xl px-6"><UserPlus size={18} className="mr-2" /> Register Faculty</Button>} />

            <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
                <div className="flex bg-slate-900/50 backdrop-blur-md p-1 rounded-2xl border border-white/10 w-full sm:w-auto overflow-x-auto scrollbar-hide">
                    {['All', 'Pending', 'Approved', 'Rejected'].map(st => (
                        <button
                            key={st}
                            onClick={() => setStatusFilter(st)}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                statusFilter === st 
                                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' 
                                : 'text-slate-500 hover:text-slate-300'
                            }`}
                        >
                            {st} {st !== 'All' && `(${staff.filter(s => s.status === st).length})`}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
                <div className="lg:col-span-2 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input id="fac-search" type="text" placeholder="Search by name, ID, or designation..."
                        className="w-full bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-[1.2rem] py-4 pl-12 pr-4 text-white text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all placeholder:text-slate-600"
                        value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="relative">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                    <select id="fac-filter-branch" value={branchFilter} onChange={e => setBranchFilter(e.target.value)}
                        className="w-full bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-[1.2rem] py-4 pl-12 pr-4 text-white text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none appearance-none">
                        <option value="">All Departments</option>
                        {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                    </select>
                </div>
            </div>

            <div className="glass-card rounded-[2.5rem] overflow-hidden border border-white/10 bg-slate-900/40 backdrop-blur-2xl">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <Loader2 className="animate-spin text-purple-500 mb-6" size={48} strokeWidth={1.5} />
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Accessing Faculty Core...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[1100px] border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.02]">
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Faculty Info</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Assignment</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Academics</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Specialization</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.03]">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={5}>
                                            <EmptyState title="No Faculty Records" description="No academic professionals match your search criteria." />
                                        </td>
                                    </tr>
                                ) : filtered.map(s => (
                                    <tr key={s._id} className="hover:bg-white/[0.04] transition-all group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600/20 to-indigo-600/20 border border-white/10 flex items-center justify-center text-purple-400 font-black text-lg shadow-xl shrink-0 group-hover:scale-110 transition-transform overflow-hidden">
                                                    {s.photo || s.user?.photo ? (
                                                        <img src={s.photo || s.user?.photo} alt={s.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        (s.user?.name || s.name || 'F').charAt(0)
                                                    )}
                                                </div>
                                                <div className="max-w-[200px]">
                                                    <p className="font-black text-white text-base truncate tracking-tight uppercase leading-none mb-1">{s.user?.name || s.name}</p>
                                                    <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium truncate italic"><Mail size={12} className="shrink-0" /> {s.user?.email || s.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <p className="text-sm font-black text-white tracking-tight">{s.designation}</p>
                                            <p className="text-[10px] text-slate-600 mt-0.5 uppercase tracking-widest font-black">EMP ID: {s.employeeId}</p>
                                            <div className="flex gap-2 mt-2">
                                                <Badge variant={s.status === 'Pending' ? 'warning' : s.status === 'Rejected' ? 'danger' : 'success'} className="text-[9px] uppercase">
                                                    {s.status || 'Approved'}
                                                </Badge>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-xs text-slate-300 font-bold">
                                                    <Building2 size={12} className="text-purple-500" />
                                                    {s.department || s.branch?.name || 'Unassigned'}
                                                </div>
                                                <div className="flex flex-wrap gap-1.5 mt-2">
                                                    {(s.assignedSemesters || []).map(sem => (
                                                        <Badge key={sem} variant="outline" className="text-[9px] bg-slate-950/40 border-primary-500/20 text-primary-400 px-2 leading-tight uppercase font-black">
                                                            SEM {sem}
                                                        </Badge>
                                                    ))}
                                                </div>
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-tight truncate max-w-[150px] mt-1">{s.qualification || 'Qualification Pending'}</p>
                                                <p className="text-[9px] text-slate-600 font-medium italic truncate max-w-[150px]">{s.education || 'Education Details Not Available'}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            {/* Specialization column content goes here if available */}
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex justify-end gap-2 group-hover:opacity-100 transition-opacity">
                                                {s.status === 'Pending' && (
                                                    <>
                                                        <button onClick={async () => { await facultyService.approve(s._id); fetchData(); }}
                                                            className="p-3 text-emerald-400 hover:bg-emerald-500/10 rounded-2xl transition-all border border-transparent hover:border-emerald-500/20" title="Approve Application">
                                                            <UserCheck size={18} strokeWidth={2.5} />
                                                        </button>
                                                        <button onClick={async () => { await facultyService.reject(s._id); fetchData(); }}
                                                            className="p-3 text-rose-400 hover:bg-rose-500/10 rounded-2xl transition-all border border-transparent hover:border-rose-500/20" title="Reject Application">
                                                            <X size={18} strokeWidth={2.5} />
                                                        </button>
                                                    </>
                                                )}
                                                <button onClick={() => handleOpenEdit(s)} className="p-3 text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-2xl transition-all border border-transparent hover:border-purple-500/20">
                                                    <Edit2 size={18} strokeWidth={2.5} />
                                                </button>
                                                <button onClick={() => setDeleteId(s._id)} className="p-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all border border-transparent hover:border-red-500/20">
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

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? 'Modify Faculty Record' : 'Faculty Onboarding'} size="md">
                <FacultyForm form={form} setForm={setForm} branches={branches} onSubmit={handleSubmit} onCancel={() => setModalOpen(false)} isEdit={!!editTarget} loading={submitting} />
            </Modal>

            <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Revoke Appointment" size="sm">
                <div className="text-center p-2">
                    <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                        <Trash2 size={36} className="text-red-500" />
                    </div>
                    <h4 className="text-xl font-black text-white mb-2">Confirm Termination?</h4>
                    <p className="text-slate-500 text-sm leading-relaxed mb-8">This will permanently revoke all access and purge faculty telemetry from the system core. This is irreversible.</p>
                    <div className="flex gap-3">
                        <Button variant="glass" onClick={() => setDeleteId(null)} className="flex-1 rounded-2xl">Abort</Button>
                        <Button className="flex-1 bg-red-600 hover:bg-red-700 shadow-[0_0_20px_rgba(220,38,38,0.4)] rounded-2xl" onClick={async () => { await facultyService.delete(deleteId); setDeleteId(null); fetchData(); }}>Authorize</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default AdminStaff;
