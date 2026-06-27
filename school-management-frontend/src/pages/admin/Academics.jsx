import React, { useState, useMemo } from 'react';
import { BookOpen, Plus, Edit2, Trash2, Search } from 'lucide-react';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';

const DEPTS = ['CSE', 'ECE', 'ME', 'CE', 'IT', 'EEE'];

const INITIAL_SUBJECTS = [
    { id: 1, code: 'CS301', name: 'Data Structures', credits: 4, department: 'CSE', semester: 3, faculty: 'Dr. Ramesh Gupta' },
    { id: 2, code: 'CS302', name: 'Operating Systems', credits: 4, department: 'CSE', semester: 5, faculty: 'Prof. Anita Sharma' },
    { id: 3, code: 'EC301', name: 'Digital Electronics', credits: 3, department: 'ECE', semester: 3, faculty: 'Dr. Suresh Kumar' },
    { id: 4, code: 'ME301', name: 'Thermodynamics', credits: 4, department: 'ME', semester: 3, faculty: 'Ms. Kavya Reddy' },
    { id: 5, code: 'CS501', name: 'Computer Networks', credits: 4, department: 'CSE', semester: 5, faculty: 'Dr. Ramesh Gupta' },
    { id: 6, code: 'IT301', name: 'Database Management', credits: 4, department: 'IT', semester: 3, faculty: 'Mr. Dinesh Prasad' },
];

const INITIAL_DEPARTMENTS = [
    { id: 1, code: 'CSE', name: 'Computer Science & Engineering', hod: 'Dr. Ramesh Gupta', students: 240, faculty: 18, established: '1998' },
    { id: 2, code: 'ECE', name: 'Electronics & Communication Eng.', hod: 'Prof. Anita Sharma', students: 180, faculty: 14, established: '1998' },
    { id: 3, code: 'ME', name: 'Mechanical Engineering', hod: 'Dr. Suresh Kumar', students: 120, faculty: 10, established: '2000' },
    { id: 4, code: 'CE', name: 'Civil Engineering', hod: 'Dr. Meena Iyer', students: 90, faculty: 8, established: '2002' },
    { id: 5, code: 'IT', name: 'Information Technology', hod: 'Mr. Dinesh Prasad', students: 150, faculty: 12, established: '2005' },
];

const BLANK_SUBJECT = { code: '', name: '', credits: 3, department: 'CSE', semester: 1, faculty: '' };
const BLANK_DEPT = { code: '', name: '', hod: '', students: 0, faculty: 0, established: '' };

const SubjectForm = ({ form, setForm, onSubmit, onCancel, isEdit }) => {
    const h = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[['code', 'Subject Code'], ['name', 'Subject Name'], ['faculty', 'Assigned Faculty']].map(([name, label]) => (
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
                    <label className="block text-sm text-slate-400 mb-1">Credits</label>
                    <input name="credits" type="number" min={1} max={6} value={form.credits} onChange={h}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                </div>
                <div>
                    <label className="block text-sm text-slate-400 mb-1">Semester</label>
                    <select name="semester" value={form.semester} onChange={h}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-primary-500 focus:outline-none">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                    </select>
                </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="glass" onClick={onCancel}>Cancel</Button>
                <Button type="submit">{isEdit ? 'Update Subject' : 'Add Subject'}</Button>
            </div>
        </form>
    );
};

const AdminAcademics = () => {
    const [tab, setTab] = useState('subjects');
    const [subjects, setSubjects] = useState(INITIAL_SUBJECTS);
    const [depts, setDepts] = useState(INITIAL_DEPARTMENTS);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [editTarget, setEditTarget] = useState(null);
    const [form, setForm] = useState(BLANK_SUBJECT);

    const filteredSubjects = useMemo(() => subjects.filter(s =>
        !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.code.toLowerCase().includes(search.toLowerCase())
    ), [subjects, search]);

    const openAdd = () => { setEditTarget(null); setForm(tab === 'subjects' ? BLANK_SUBJECT : BLANK_DEPT); setModalOpen(true); };
    const openEdit = item => { setEditTarget(item.id); setForm({ ...item }); setModalOpen(true); };
    const closeModal = () => { setModalOpen(false); setEditTarget(null); };

    const handleSubmit = e => {
        e.preventDefault();
        if (tab === 'subjects') {
            editTarget ? setSubjects(p => p.map(s => s.id === editTarget ? { ...form, id: editTarget } : s))
                : setSubjects(p => [...p, { ...form, id: Date.now(), credits: Number(form.credits), semester: Number(form.semester) }]);
        } else {
            editTarget ? setDepts(p => p.map(d => d.id === editTarget ? { ...form, id: editTarget } : d))
                : setDepts(p => [...p, { ...form, id: Date.now(), students: Number(form.students), faculty: Number(form.faculty) }]);
        }
        closeModal();
    };

    return (
        <div className="p-4 md:p-6 lg:p-8 min-h-screen">
            <PageHeader title="Subjects" subtitle="Manage curriculum and departments" icon={BookOpen}
                action={<Button onClick={openAdd}><Plus size={16} className="mr-2" />Add {tab === 'subjects' ? 'Subject' : 'Department'}</Button>} />

            {/* Tabs */}
            <div className="flex gap-2 mb-6 bg-slate-900 p-1 rounded-xl w-fit">
                {['subjects', 'departments'].map(t => (
                    <button key={t} onClick={() => { setTab(t); setSearch(''); }}
                        className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${tab === t ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                        {t}
                    </button>
                ))}
            </div>

            {tab === 'subjects' && (
                <>
                    <div className="glass-card p-3 rounded-2xl mb-6 flex gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                            <input type="text" placeholder="Search subjects..."
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 pl-9 pr-4 text-white text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                    </div>
                    <div className="glass-card rounded-2xl overflow-x-auto">
                        <table className="w-full text-left min-w-[600px]">
                            <thead className="border-b border-white/10 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                                <tr><th className="px-5 py-4">Code</th><th className="px-5 py-4">Subject Name</th><th className="px-5 py-4">Dept</th><th className="px-5 py-4">Sem</th><th className="px-5 py-4">Credits</th><th className="px-5 py-4">Faculty</th><th className="px-5 py-4 text-right">Actions</th></tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredSubjects.length === 0 ? (
                                    <tr><td colSpan={7}><EmptyState title="No subjects found" /></td></tr>
                                ) : filteredSubjects.map(s => (
                                    <tr key={s.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-5 py-3.5 font-mono text-primary-400 text-sm font-bold">{s.code}</td>
                                        <td className="px-5 py-3.5 font-semibold text-white">{s.name}</td>
                                        <td className="px-5 py-3.5"><Badge variant="info">{s.department}</Badge></td>
                                        <td className="px-5 py-3.5 text-slate-400">Sem {s.semester}</td>
                                        <td className="px-5 py-3.5 text-slate-400">{s.credits} cr</td>
                                        <td className="px-5 py-3.5 text-slate-300 text-sm">{s.faculty}</td>
                                        <td className="px-5 py-3.5 text-right space-x-1">
                                            <button onClick={() => openEdit(s)} className="p-1.5 text-slate-500 hover:text-primary-400 rounded-lg hover:bg-white/5"><Edit2 size={15} /></button>
                                            <button onClick={() => setDeleteId(s.id)} className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-white/5"><Trash2 size={15} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {tab === 'departments' && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {depts.map(d => (
                        <div key={d.id} className="glass-card p-6 rounded-2xl border border-white/5 hover:border-primary-500/30 transition-all group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 bg-primary-600/20 text-primary-400 rounded-xl flex items-center justify-center font-bold text-lg">{d.code}</div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openEdit(d)} className="p-1.5 text-slate-500 hover:text-primary-400 rounded-lg hover:bg-white/5"><Edit2 size={15} /></button>
                                    <button onClick={() => setDeleteId(d.id)} className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-white/5"><Trash2 size={15} /></button>
                                </div>
                            </div>
                            <h3 className="text-white font-bold mb-1">{d.name}</h3>
                            <p className="text-slate-400 text-sm mb-4">HOD: {d.hod}</p>
                            <div className="grid grid-cols-3 gap-3 border-t border-white/10 pt-4">
                                <div className="text-center"><p className="text-white font-bold">{d.students}</p><p className="text-slate-500 text-xs">Students</p></div>
                                <div className="text-center"><p className="text-white font-bold">{d.faculty}</p><p className="text-slate-500 text-xs">Faculty</p></div>
                                <div className="text-center"><p className="text-white font-bold">{d.established}</p><p className="text-slate-500 text-xs">Est.</p></div>
                            </div>
                        </div>
                    ))}
                    <button onClick={openAdd} className="glass-card rounded-2xl border border-dashed border-white/20 hover:border-primary-500/50 flex flex-col items-center justify-center gap-3 p-6 text-slate-500 hover:text-primary-400 transition-all min-h-[180px]">
                        <Plus size={28} />
                        <span className="text-sm font-medium">Add Department</span>
                    </button>
                </div>
            )}

            <Modal isOpen={modalOpen} onClose={closeModal} title={editTarget ? `Edit ${tab === 'subjects' ? 'Subject' : 'Department'}` : `Add ${tab === 'subjects' ? 'Subject' : 'Department'}`}>
                {tab === 'subjects' ? (
                    <SubjectForm form={form} setForm={setForm} onSubmit={handleSubmit} onCancel={closeModal} isEdit={!!editTarget} />
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[['code', 'Dept Code'], ['name', 'Full Name'], ['hod', 'Head of Dept'], ['established', 'Est. Year'], ['students', 'Students Count'], ['faculty', 'Faculty Count']].map(([name, label]) => (
                                <div key={name}>
                                    <label className="block text-sm text-slate-400 mb-1">{label}</label>
                                    <input name={name} value={form[name] || ''} onChange={e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))} required={['code', 'name'].includes(name)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <Button type="button" variant="glass" onClick={closeModal}>Cancel</Button>
                            <Button type="submit">{editTarget ? 'Update' : 'Add'} Department</Button>
                        </div>
                    </form>
                )}
            </Modal>
            <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Confirm Delete" size="sm">
                <p className="text-slate-300 mb-6">Are you sure you want to delete this item?</p>
                <div className="flex justify-end gap-3">
                    <Button variant="glass" onClick={() => setDeleteId(null)}>Cancel</Button>
                    <Button className="bg-red-600 hover:bg-red-700" onClick={() => {
                        tab === 'subjects' ? setSubjects(p => p.filter(s => s.id !== deleteId)) : setDepts(p => p.filter(d => d.id !== deleteId));
                        setDeleteId(null);
                    }}>Delete</Button>
                </div>
            </Modal>
        </div>
    );
};

export default AdminAcademics;
