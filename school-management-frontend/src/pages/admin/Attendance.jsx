import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, History, Filter, Search, Loader2, Calendar, Users, Eye, ArrowRight, UserCheck, ShieldCheck, Download, Edit, Save, XCircle, Activity } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import attendanceService from '../../services/attendanceService';
import branchService from '../../services/branchService';
import facultyService from '../../services/facultyService';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';

import { format, getDay, getDaysInMonth, addMonths, subMonths } from 'date-fns';
import { withErrorBoundary } from '../../components/ui/ErrorBoundary';

const AdminAttendance = () => {
    const [semester, setSemester] = useState('');
    const [branch, setBranch] = useState('');
    const [teacherId, setTeacherId] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage] = useState(15);

    const [editingRecord, setEditingRecord] = useState(null); // { sessionId, studentId, currentStatus, date, teacherName, sessionRecords }
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const queryClient = useQueryClient();

    const updateMutation = useMutation({
        mutationFn: ({ sessionId, records }) => attendanceService.update(sessionId, { records }),
        onSuccess: () => {
            alert('Attendance record updated successfully.');
            queryClient.invalidateQueries(['admin-attendance-history']);
            setIsEditModalOpen(false);
            setEditingRecord(null);
        },
        onError: (err) => {
            alert('Error updating attendance: ' + (err.response?.data?.error || err.message));
        }
    });

    const handleOpenEdit = (record) => {
        setEditingRecord(record);
        setNewStatus(record.status);
        setIsEditModalOpen(true);
    };

    const handleSaveCorrection = () => {
        if (!window.confirm('Save correction to this attendance record?')) return;
        
        // Find existing session record and update only this student's status
        const updatedRecords = editingRecord.sessionRecords.map(r => ({
            student: r.student._id,
            status: r.student._id === editingRecord.student?._id ? newStatus : r.status
        }));

        updateMutation.mutate({ 
            sessionId: editingRecord.sessionId, 
            records: updatedRecords 
        });
    };

    const { data: branches } = useQuery({
        queryKey: ['branches-list'],
        queryFn: branchService.getAll
    });

    const { data: history, isLoading, isError } = useQuery({
        queryKey: ['admin-attendance-history', semester, branch, filterDate],
        queryFn: () => attendanceService.getAll({ semester, branch, date: filterDate })
    });

    const { data: facultyMembers } = useQuery({
        queryKey: ['faculty-list'],
        queryFn: facultyService.getAll
    });

    const flattenedRecords = React.useMemo(() => {
        if (!history || !Array.isArray(history)) return [];
        return history.flatMap(session => 
            (session.records || []).map(record => ({
                ...record,
                sessionId: session._id,
                sessionDate: session.date,
                sessionSemester: session.semester,
                sessionBranch: session.branch,
                markedBy: session.markedBy,
                sessionRecords: session.records 
            }))
        );
    }, [history]);

    const filteredRecords = React.useMemo(() => {
        return flattenedRecords.filter(r => {
            const matchesSearch = !searchQuery || 
                r.student?.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.student?.rollNumber?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesTeacher = !teacherId || r.markedBy?.teacherId === teacherId;
            return matchesSearch && matchesTeacher;
        });
    }, [flattenedRecords, searchQuery, teacherId]);

    const totalPages = Math.ceil(filteredRecords.length / rowsPerPage);
    const paginatedRecords = filteredRecords.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);



    return (
        <div className="p-4 md:p-6 lg:p-10 min-h-screen">
            <PageHeader
                title="Global Attendance Audit"
                subtitle="Master oversight of all academic presence and teacher markings"
                icon={History}
                iconColor="primary"
            />

            {/* Advanced Multi-Filters */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                <div className="glass-card p-4 rounded-2xl border border-white/5 relative">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                    <select
                        value={semester}
                        onChange={(e) => { setSemester(e.target.value); setCurrentPage(1); }}
                        className="w-full bg-transparent border-none text-xs font-black uppercase tracking-widest text-white pl-10 focus:ring-0 appearance-none"
                    >
                        <option value="" className="bg-slate-950">Any Semester</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s} className="bg-slate-950">Semester {s}</option>)}
                    </select>
                </div>

                <div className="glass-card p-4 rounded-2xl border border-white/5 relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                    <select
                        value={branch}
                        onChange={(e) => { setBranch(e.target.value); setCurrentPage(1); }}
                        className="w-full bg-transparent border-none text-xs font-black uppercase tracking-widest text-white pl-10 focus:ring-0 appearance-none"
                    >
                        <option value="" className="bg-slate-950">Any Branch</option>
                        {branches?.map(b => <option key={b._id} value={b._id} className="bg-slate-950">{b.name}</option>)}
                    </select>
                </div>

                <div className="glass-card p-4 rounded-2xl border border-white/5 relative">
                    <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                    <select
                        value={teacherId}
                        onChange={(e) => { setTeacherId(e.target.value); setCurrentPage(1); }}
                        className="w-full bg-transparent border-none text-xs font-black uppercase tracking-widest text-white pl-10 focus:ring-0 appearance-none"
                    >
                        <option value="" className="bg-slate-950">Any Teacher</option>
                        {facultyMembers?.map(f => <option key={f.user?._id} value={f.user?._id} className="bg-slate-950">{f.user?.name}</option>)}
                    </select>
                </div>

                <div className="glass-card p-4 rounded-2xl border border-white/5 relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                    <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => { setFilterDate(e.target.value); setCurrentPage(1); }}
                        className="w-full bg-transparent border-none text-xs font-black uppercase tracking-widest text-white pl-10 focus:ring-0"
                    />
                </div>

                <div className="glass-card p-4 rounded-2xl border border-white/5 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                    <input
                        type="text"
                        placeholder="Search Student..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        className="w-full bg-transparent border-none text-xs font-black uppercase tracking-widest text-white pl-10 focus:ring-0"
                    />
                </div>
            </div>

                <div className="glass-card rounded-[2.5rem] overflow-hidden border border-white/10 bg-slate-900/40 backdrop-blur-2xl shadow-2xl">
                    <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                        <h3 className="text-xl font-black text-white uppercase tracking-tight">Attendance Log</h3>
                        <div className="flex items-center gap-4">
                            <Badge className="bg-primary-500/10 text-primary-400 border border-primary-500/20 py-2 px-4 rounded-xl">Review Mode</Badge>
                        </div>
                    </div>

                    {isError ? (
                        <div className="py-24 text-center">
                            <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
                            <p className="text-white font-bold uppercase tracking-widest text-xs">Error loading attendance history</p>
                        </div>
                    ) : isLoading ? (
                        <div className="py-32 flex flex-col items-center">
                            <Loader2 className="animate-spin text-primary-500 mb-6" size={56} strokeWidth={1.5} />
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest animate-pulse">Syncing Roster...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/[0.03] border-b border-white/10">
                                    <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                        <th className="px-8 py-6">Student Info</th>
                                        <th className="px-8 py-6">Roll No</th>
                                        <th className="px-8 py-6 text-center">Date</th>
                                        <th className="px-8 py-6 text-center">Status</th>
                                        <th className="px-8 py-6">Marked By</th>
                                        <th className="px-8 py-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.03]">
                                    {paginatedRecords.length > 0 ? paginatedRecords.map((r, i) => (
                                        <motion.tr
                                            key={`${r.sessionId}-${r.student?._id}`}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.02 }}
                                            className="hover:bg-white/[0.02] transition-colors group"
                                        >
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500 border border-white/5 transition-all group-hover:border-primary-500/30 group-hover:text-primary-400">
                                                        {r.student?.user?.name?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-white uppercase leading-tight tracking-tight">{r.student?.user?.name}</p>
                                                        <p className="text-[10px] text-slate-600 font-mono italic">STUDENT_ENTITY</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="text-[10px] font-mono font-black text-slate-400 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 uppercase tracking-widest tabular-nums">{r.student?.rollNumber}</span>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest tabular-nums">{r.sessionDate}</span>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <Badge variant={r.status === 'Present' ? 'emerald' : (r.status === 'Absent' ? 'danger' : 'warning')} className="px-4 py-1.5 text-[9px] font-black uppercase tracking-widest border-none">
                                                    {r.status}
                                                </Badge>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{r.markedBy?.teacherName}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button 
                                                    onClick={() => handleOpenEdit(r)}
                                                    className="p-2.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl transition-all border border-white/5 active:scale-95"
                                                >
                                                    <Edit size={14} />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="6" className="py-24 text-center">
                                                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest italic leading-relaxed">No matching attendance records detected within specified parameters.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="p-6 border-t border-white/5 bg-white/[0.01] flex items-center justify-between">
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                                Rendering {paginatedRecords.length} of {filteredRecords.length} identities
                            </p>
                            <div className="flex items-center gap-2">
                                <Button 
                                    variant="glass" 
                                    disabled={currentPage === 1} 
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                    className="px-4 py-2 text-[9px]"
                                >
                                    Previous
                                </Button>
                                <div className="flex items-center gap-1 mx-2">
                                    {Array.from({ length: totalPages }).map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={`w-8 h-8 rounded-lg text-[9px] font-black transition-all ${
                                                currentPage === i + 1 
                                                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20 shadow-primary-500/20' 
                                                : 'text-slate-500 hover:bg-white/5'
                                            }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                                <Button 
                                    variant="glass" 
                                    disabled={currentPage === totalPages} 
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                    className="px-4 py-2 text-[9px]"
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Edit Modal */}
                <Modal 
                    isOpen={isEditModalOpen} 
                    onClose={() => setIsEditModalOpen(false)} 
                    title="Correct Attendance Record"
                    size="sm"
                >
                    <div className="space-y-6">
                        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                            <div className="flex justify-between items-center group">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Student</span>
                                <span className="text-sm font-bold text-white uppercase group-hover:text-primary-400 transition-colors">{editingRecord?.student?.user?.name}</span>
                            </div>
                            <div className="h-px bg-white/5 w-full" />
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Recorded On</span>
                                <span className="text-[11px] font-black text-slate-300 uppercase tabular-nums">{editingRecord?.sessionDate}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Instructor</span>
                                <span className="text-[11px] font-black text-slate-300 uppercase italic opacity-70">{editingRecord?.markedBy?.teacherName}</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Overwrite Status</label>
                            <div className="grid grid-cols-2 gap-3">
                                {['Present', 'Absent'].map(st => (
                                    <button
                                        key={st}
                                        onClick={() => setNewStatus(st)}
                                        className={`py-4 rounded-2xl border text-[11px] font-black uppercase tracking-widest transition-all ${
                                            newStatus === st 
                                            ? (st === 'Present' ? 'bg-green-500/20 border-green-500/50 text-green-400' : 'bg-red-500/20 border-red-500/50 text-red-400')
                                            : 'bg-slate-950/40 border-white/5 text-slate-600 hover:border-white/20'
                                        }`}
                                    >
                                        {st}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <Button 
                                onClick={handleSaveCorrection} 
                                disabled={updateMutation.isLoading}
                                className="flex-1 bg-primary-600 hover:bg-primary-500 shadow-xl shadow-primary-600/20 rounded-2xl py-4 text-[11px] font-black uppercase tracking-[0.2em]"
                            >
                                {updateMutation.isLoading ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save className="mr-2" size={16} />}
                                Commit Change
                            </Button>
                            <Button variant="glass" onClick={() => setIsEditModalOpen(false)} className="rounded-2xl px-8">
                                Cancel
                            </Button>
                        </div>
                    </div>
                </Modal>
        </div>
    );
};

export default withErrorBoundary(AdminAttendance);
