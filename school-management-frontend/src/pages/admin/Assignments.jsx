import React, { useState, useEffect } from 'react';
import { UserCheck, BookOpen, Plus, Search, Loader2, CheckCircle2, ChevronRight } from 'lucide-react';
import facultyService from '../../services/facultyService';
import subjectService from '../../services/subjectService';
import Button from '../../components/ui/Button';
import PageHeader from '../../components/ui/PageHeader';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { motion, AnimatePresence } from 'framer-motion';

const SubjectAssignments = () => {
    const [faculty, setFaculty] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedFaculty, setSelectedFaculty] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [selectedSubjects, setSelectedSubjects] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [f, s] = await Promise.all([
                facultyService.getAll(),
                subjectService.getAll()
            ]);
            setFaculty(f);
            setSubjects(s);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAssign = (f) => {
        setSelectedFaculty(f);
        setSelectedSubjects(f.subjects?.map(s => s._id) || []);
        setModalOpen(true);
    };

    const toggleSubject = (id) => {
        setSelectedSubjects(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const handleSave = async () => {
        setSubmitting(true);
        try {
            await facultyService.update(selectedFaculty._id, {
                subjects: selectedSubjects
            });
            await fetchData();
            setModalOpen(false);
        } catch (err) {
            alert('Save failed');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredFaculty = faculty.filter(f =>
        f.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        f.employeeId?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-4 md:p-6 lg:p-10 min-h-screen">
            <PageHeader
                title="Academic Allocations"
                subtitle="Map expert faculty members to curriculum subjects"
                icon={UserCheck}
                iconColor="indigo"
            />

            <div className="relative mb-8 max-w-2xl mt-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                    type="text"
                    placeholder="Search faculty by name or employee ID..."
                    className="w-full bg-slate-900 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:ring-2 focus:ring-primary-500 transition-all"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24">
                    <Loader2 className="animate-spin text-primary-500 mb-4" size={48} />
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Synchronizing Registry...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {filteredFaculty.map((f, idx) => (
                            <motion.div
                                key={f._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="glass-card p-6 rounded-[2rem] border border-white/10 hover:border-primary-500/50 transition-all group bg-slate-900/40 backdrop-blur-2xl"
                            >
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600/20 to-purple-600/20 flex items-center justify-center text-indigo-400 font-black text-xl border border-white/10 group-hover:scale-110 transition-transform">
                                        {f.user?.name?.charAt(0) || 'F'}
                                    </div>
                                    <div className="overflow-hidden">
                                        <h3 className="text-white font-black uppercase tracking-tight truncate leading-tight mb-1">{f.user?.name}</h3>
                                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{f.designation} • {f.employeeId}</p>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-8">
                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                        <BookOpen size={10} /> Assigned Subjects ({f.subjects?.length || 0})
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {f.subjects?.length > 0 ? f.subjects.map(s => (
                                            <Badge key={s._id} variant="glass" className="text-[9px] border-white/10 text-slate-400 uppercase font-black">
                                                {s.code}
                                            </Badge>
                                        )) : <span className="text-xs text-slate-600 italic">No subjects assigned</span>}
                                    </div>
                                </div>

                                <Button
                                    onClick={() => handleOpenAssign(f)}
                                    className="w-full rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] text-primary-400 border border-white/5 hover:border-primary-500/30 font-black uppercase tracking-widest text-[10px] py-4"
                                >
                                    Modify Workload
                                </Button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title="Curriculum Allocation"
                size="md"
            >
                {selectedFaculty && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-primary-600/20 flex items-center justify-center text-primary-400 font-bold">
                                {selectedFaculty.user?.name?.charAt(0)}
                            </div>
                            <div>
                                <p className="text-white font-black uppercase tracking-tight text-sm">{selectedFaculty.user?.name}</p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase">{selectedFaculty.designation}</p>
                            </div>
                        </div>

                        <div className="max-h-[400px] overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-white/10">
                            {subjects.map(s => {
                                const isSelected = selectedSubjects.includes(s._id);
                                return (
                                    <button
                                        key={s._id}
                                        onClick={() => toggleSubject(s._id)}
                                        className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${isSelected
                                                ? 'bg-primary-600/10 border-primary-500/50 text-white shadow-[0_0_20px_rgba(2,132,199,0.1)]'
                                                : 'bg-slate-900/50 border-white/5 text-slate-400 hover:border-white/20'
                                            }`}
                                    >
                                        <div className="text-left">
                                            <p className={`text-xs font-black uppercase tracking-tight mb-0.5 ${isSelected ? 'text-primary-400' : ''}`}>{s.name}</p>
                                            <p className="text-[9px] font-bold uppercase tracking-[0.15em] opacity-60 font-mono">{s.code} • Sem {s.semester}</p>
                                        </div>
                                        {isSelected && <CheckCircle2 size={18} className="text-primary-400" />}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="flex gap-3 pt-6 border-t border-white/10">
                            <Button variant="glass" onClick={() => setModalOpen(false)} className="flex-1 rounded-2xl">Cancel</Button>
                            <Button
                                onClick={handleSave}
                                disabled={submitting}
                                className="flex-1 rounded-2xl shadow-[0_0_20px_rgba(2,132,199,0.3)]"
                            >
                                {submitting ? <Loader2 className="animate-spin" size={20} /> : 'Save Allocation'}
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default SubjectAssignments;
