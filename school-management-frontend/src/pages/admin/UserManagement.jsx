import React, { useState, useMemo } from 'react';
import { Shield, UserPlus, Edit2, Trash2, Search, ToggleLeft, ToggleRight } from 'lucide-react';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';
import PasswordValidator, { isPasswordValid } from '../../components/ui/PasswordValidator';

const ROLES = ['admin', 'staff', 'student'];
const ROLE_COLORS = { admin: 'danger', staff: 'purple', student: 'info' };

const PERMISSIONS = {
    admin: ['View Dashboard', 'Manage Students', 'Manage Staff', 'Manage Academics', 'Mark Attendance', 'Schedule Exams', 'View Results', 'Manage Timetable', 'Manage Calendar', 'Manage Users', 'Change Settings'],
    staff: ['View Dashboard', 'Mark Attendance', 'Upload Results', 'View Timetable', 'Upload Assignments'],
    student: ['View Dashboard', 'View Attendance', 'View Results', 'View Timetable', 'Submit Assignments', 'View Notices'],
};

const INITIAL_USERS = [
    { id: 1, name: 'Admin User', email: 'admin@college.edu', role: 'admin', status: 'Active', lastLogin: '2026-02-25 10:30' },
    { id: 2, name: 'Dr. Ramesh Gupta', email: 'ramesh@college.edu', role: 'staff', status: 'Active', lastLogin: '2026-02-24 09:00' },
    { id: 3, name: 'Riya Sharma', email: 'riya@college.edu', role: 'student', status: 'Active', lastLogin: '2026-02-25 08:15' },
    { id: 4, name: 'Prof. Anita', email: 'anita@college.edu', role: 'staff', status: 'Active', lastLogin: '2026-02-23 14:00' },
    { id: 5, name: 'Arjun Mehta', email: 'arjun@college.edu', role: 'student', status: 'Inactive', lastLogin: '2026-02-20 16:45' },
    { id: 6, name: 'Ms. Kavya Reddy', email: 'kavya@college.edu', role: 'staff', status: 'Active', lastLogin: '2026-02-25 11:00' },
];

const BLANK = { name: '', email: '', role: 'staff', status: 'Active' };

const UserForm = ({ form, setForm, onSubmit, onCancel, isEdit }) => {
    const h = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm text-slate-400 mb-1">Full Name *</label>
                    <input name="name" value={form.name} onChange={h} required
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                </div>
                <div>
                    <label className="block text-sm text-slate-400 mb-1">Email *</label>
                    <input name="email" type="email" value={form.email} onChange={h} required
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                </div>
                <div>
                    <label className="block text-sm text-slate-400 mb-1">Role</label>
                    <select name="role" value={form.role} onChange={h}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-primary-500 focus:outline-none">
                        {ROLES.map(r => <option key={r} className="capitalize">{r}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm text-slate-400 mb-1">Status</label>
                    <select name="status" value={form.status} onChange={h}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-primary-500 focus:outline-none">
                        <option>Active</option><option>Inactive</option>
                    </select>
                </div>
                {!isEdit && (
                    <div className="sm:col-span-2 space-y-2">
                        <label className="block text-sm text-slate-400 mb-1">Password *</label>
                        <input name="password" type="password" required placeholder="Temporary password"
                            value={form.password || ''} onChange={h}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                        <PasswordValidator password={form.password} />
                    </div>
                )}
            </div>
            <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="glass" onClick={onCancel}>Cancel</Button>
                <Button type="submit" disabled={!isEdit && !isPasswordValid(form.password)}>
                    {isEdit ? 'Update User' : 'Create User'}
                </Button>
            </div>
        </form>
    );
};

const AdminUserManagement = () => {
    const [users, setUsers] = useState(INITIAL_USERS);
    const [search, setSearch] = useState('');
    const [roleFilter, setRole] = useState('');
    const [modalOpen, setModal] = useState(false);
    const [permRole, setPermRole] = useState('admin');
    const [deleteId, setDeleteId] = useState(null);
    const [editTarget, setEdit] = useState(null);
    const [form, setForm] = useState(BLANK);
    const [activeTab, setTab] = useState('users');

    const filtered = useMemo(() => users.filter(u =>
        (!search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())) &&
        (!roleFilter || u.role === roleFilter)
    ), [users, search, roleFilter]);

    const openAdd = () => { setEdit(null); setForm(BLANK); setModal(true); };
    const openEdit = u => { setEdit(u.id); setForm({ ...u }); setModal(true); };
    const closeModal = () => { setModal(false); setEdit(null); };

    const handleSubmit = e => {
        e.preventDefault();
        editTarget ? setUsers(p => p.map(u => u.id === editTarget ? { ...form, id: editTarget, lastLogin: u.lastLogin } : u))
            : setUsers(p => [...p, { ...form, id: Date.now(), lastLogin: 'Never' }]);
        closeModal();
    };

    const toggleStatus = id => setUsers(p => p.map(u => u.id === id ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u));

    return (
        <div className="p-4 md:p-6 lg:p-8 min-h-screen">
            <PageHeader title="User Management" subtitle="Manage user accounts and permissions" icon={Shield}
                action={<Button onClick={openAdd}><UserPlus size={16} className="mr-2" />Add User</Button>} />

            {/* Tabs */}
            <div className="flex gap-2 mb-6 bg-slate-900 p-1 rounded-xl w-fit">
                {['users', 'permissions'].map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${activeTab === t ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                        {t}
                    </button>
                ))}
            </div>

            {activeTab === 'users' && (
                <>
                    {/* Filters */}
                    <div className="glass-card p-4 rounded-2xl mb-6 flex flex-wrap gap-3">
                        <div className="flex-1 min-w-[160px] relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                            <input type="text" placeholder="Search by name or email..."
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 pl-9 pr-4 text-white text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        <select value={roleFilter} onChange={e => setRole(e.target.value)}
                            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-primary-500 focus:outline-none capitalize">
                            <option value="">All Roles</option>{ROLES.map(r => <option key={r}>{r}</option>)}
                        </select>
                    </div>

                    {/* Table */}
                    <div className="glass-card rounded-2xl overflow-x-auto">
                        <table className="w-full text-left min-w-[640px]">
                            <thead className="border-b border-white/10 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                                <tr>
                                    <th className="px-5 py-4">User</th>
                                    <th className="px-5 py-4">Role</th>
                                    <th className="px-5 py-4">Status</th>
                                    <th className="px-5 py-4">Last Login</th>
                                    <th className="px-5 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filtered.length === 0 ? (
                                    <tr><td colSpan={5}><EmptyState title="No users found" /></td></tr>
                                ) : filtered.map(u => (
                                    <tr key={u.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-5 py-3.5">
                                            <p className="font-semibold text-white">{u.name}</p>
                                            <p className="text-xs text-slate-500">{u.email}</p>
                                        </td>
                                        <td className="px-5 py-3.5 capitalize">
                                            <Badge variant={ROLE_COLORS[u.role] || 'default'}>{u.role}</Badge>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <button onClick={() => toggleStatus(u.id)} className="flex items-center gap-2 text-sm">
                                                {u.status === 'Active'
                                                    ? <ToggleRight size={20} className="text-green-400" />
                                                    : <ToggleLeft size={20} className="text-slate-600" />}
                                                <span className={u.status === 'Active' ? 'text-green-400' : 'text-slate-500'}>{u.status}</span>
                                            </button>
                                        </td>
                                        <td className="px-5 py-3.5 text-slate-400 text-sm">{u.lastLogin}</td>
                                        <td className="px-5 py-3.5 text-right space-x-1">
                                            <button onClick={() => openEdit(u)} className="p-1.5 text-slate-500 hover:text-primary-400 rounded-lg hover:bg-white/5"><Edit2 size={15} /></button>
                                            <button onClick={() => setDeleteId(u.id)} className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-white/5"><Trash2 size={15} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {activeTab === 'permissions' && (
                <div className="glass-card rounded-2xl p-6">
                    <div className="flex gap-3 mb-6 flex-wrap">
                        {ROLES.map(r => (
                            <button key={r} onClick={() => setPermRole(r)}
                                className={`px-5 py-2 rounded-xl text-sm font-semibold border capitalize transition-all ${permRole === r ? 'bg-primary-600/20 border-primary-500/40 text-primary-400' : 'border-white/10 text-slate-400 hover:text-white'}`}>
                                {r}
                            </button>
                        ))}
                    </div>
                    <h3 className="text-white font-semibold mb-4 capitalize">{permRole} Permissions</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {PERMISSIONS.admin.map(perm => {
                            const hasIt = PERMISSIONS[permRole].includes(perm);
                            return (
                                <div key={perm} className={`flex items-center gap-3 p-3 rounded-xl border ${hasIt ? 'bg-green-500/10 border-green-500/20' : 'bg-slate-800/50 border-slate-700/50'}`}>
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${hasIt ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-600'}`}>
                                        {hasIt ? '✓' : '–'}
                                    </div>
                                    <span className={`text-sm ${hasIt ? 'text-white' : 'text-slate-500'}`}>{perm}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <Modal isOpen={modalOpen} onClose={closeModal} title={editTarget ? 'Edit User' : 'Create New User'} size="sm">
                <UserForm form={form} setForm={setForm} onSubmit={handleSubmit} onCancel={closeModal} isEdit={!!editTarget} />
            </Modal>
            <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete User" size="sm">
                <p className="text-slate-300 mb-6">This will permanently remove the user account.</p>
                <div className="flex justify-end gap-3">
                    <Button variant="glass" onClick={() => setDeleteId(null)}>Cancel</Button>
                    <Button className="bg-red-600 hover:bg-red-700" onClick={() => { setUsers(p => p.filter(u => u.id !== deleteId)); setDeleteId(null); }}>Delete</Button>
                </div>
            </Modal>
        </div>
    );
};

export default AdminUserManagement;
