import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, FileText, Upload, Save, Loader2, BookOpen, User, AlertCircle, TrendingUp } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import facultyService from '../../services/facultyService';
import resultService from '../../services/resultService';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

const StaffResults = () => {
    const queryClient = useQueryClient();
    const [selectedSemester, setSelectedSemester] = useState(null);
    const [marksData, setMarksData] = useState({}); // studentId -> { internal, sessional, practical }

    const { data: profile } = useQuery({
        queryKey: ['faculty-me'],
        queryFn: () => facultyService.getMe()
    });

    useEffect(() => {
        if (profile?.assignedSemesters?.length > 0 && !selectedSemester) {
            setSelectedSemester(profile.assignedSemesters[0]);
        }
    }, [profile, selectedSemester]);

    const { data: students, isLoading: studentsLoading } = useQuery({
        queryKey: ['faculty-students-list', selectedSemester],
        queryFn: () => facultyService.getMyStudents({ semester: selectedSemester }),
        enabled: !!selectedSemester
    });

    useEffect(() => {
        if (students) {
            const initial = {};
            students.forEach(s => initial[s._id] = { internal: 0, sessional: 0, practical: 0 });
            setMarksData(initial);
        }
    }, [students]);

    const handleMarkChange = (studentId, field, value) => {
        setMarksData(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [field]: Number(value)
            }
        }));
    };

    const saveMutation = useMutation({
        mutationFn: (payload) => resultService.bulkCreate(payload),
        onSuccess: () => {
            alert('Marks uploaded successfully!');
            queryClient.invalidateQueries(['results']);
        },
        onError: (err) => alert('Failed to upload marks: ' + err.message)
    });

    const handleSave = () => {
        if (!selectedSemester) return alert('Please select a semester');

        const payload = Object.entries(marksData).map(([studentId, marks]) => ({
            student: studentId,
            semester: selectedSemester,
            internalMarks: marks.internal,
            sessionalMarks: marks.sessional,
            practicalMarks: marks.practical
        }));

        saveMutation.mutate(payload);
    };

    return (
        <div className="p-4 md:p-6 lg:p-10 min-h-screen">
            <PageHeader
                title="Performance Hub"
                subtitle="Upload and manage results for your assigned semester"
                icon={Trophy}
                iconColor="amber"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2 glass-card p-8 rounded-3xl border border-white/10 flex flex-col justify-center">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Target Semester</label>
                    <div className="grid grid-cols-4 gap-3">
                        {(profile?.assignedSemesters || []).map(sem => (
                            <button
                                key={sem}
                                onClick={() => setSelectedSemester(sem)}
                                className={`py-4 rounded-2xl border text-sm font-black transition-all ${selectedSemester === sem ? 'bg-primary-500/10 border-primary-500/50 text-primary-400' : 'bg-slate-950 border-white/5 text-slate-500 hover:border-white/20'}`}
                            >
                                SEM {sem}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="glass-card p-8 rounded-3xl border border-white/10 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-2">
                        <TrendingUp size={20} className="text-primary-400" />
                        <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Active Scope</span>
                    </div>
                    <p className="text-3xl font-black text-white tracking-tighter uppercase leading-none">Semester {selectedSemester || '?'}</p>
                    <p className="text-xs text-slate-500 mt-2 font-medium italic">{profile?.branch?.name}</p>
                </div>
            </div>

            <div className="glass-card rounded-[2.5rem] overflow-hidden border border-white/10 bg-slate-900/40 backdrop-blur-2xl">
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                            <FileText size={20} />
                        </div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tight">Marksheet Entry</h3>
                    </div>
                    <Badge className="bg-primary-500/20 text-primary-400 font-black uppercase tracking-widest text-[10px] px-4 py-1.5 rounded-lg border border-primary-500/20">
                        {students?.length || 0} Students in Roster
                    </Badge>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/[0.02]">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest w-1/3">Student Details</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Internal (20)</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Sessional (30)</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Practical (50)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                            {studentsLoading ? (
                                <tr>
                                    <td colSpan={4} className="py-20 text-center">
                                        <Loader2 className="animate-spin text-primary-500 mx-auto mb-4" size={32} />
                                        <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Fetching Semester Data...</p>
                                    </td>
                                </tr>
                            ) : students?.map(s => (
                                <tr key={s._id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-primary-400 transition-colors">
                                                <User size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-white uppercase tracking-tight leading-none mb-1">{s.user?.name}</p>
                                                <p className="text-[10px] text-slate-600 font-mono uppercase tracking-widest">{s.rollNumber}</p>
                                            </div>
                                        </div>
                                    </td>
                                    {['internal', 'sessional', 'practical'].map(field => (
                                        <td key={field} className="px-8 py-6">
                                            <div className="flex justify-center">
                                                <input
                                                    type="number"
                                                    value={marksData[s._id]?.[field] || 0}
                                                    onChange={(e) => handleMarkChange(s._id, field, e.target.value)}
                                                    max={field === 'internal' ? 20 : field === 'sessional' ? 30 : 50}
                                                    min={0}
                                                    className="w-20 bg-slate-950 border border-white/10 rounded-xl py-2 px-3 text-center text-white font-bold focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all group-hover:border-primary-500/30"
                                                />
                                            </div>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-8 bg-black/20 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500 shrink-0">
                            <AlertCircle size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-black text-white uppercase tracking-tight">Final Authorization</p>
                            <p className="text-xs text-slate-500 font-medium max-w-md">By clicking upload, you confirm that these marks are verified and follow the institutional grading guidelines for Semester {selectedSemester}.</p>
                        </div>
                    </div>
                    <Button
                        disabled={saveMutation.isLoading || !students?.length}
                        onClick={handleSave}
                        className="w-full md:w-auto px-10 py-5 bg-gradient-to-r from-primary-600 to-indigo-600 hover:shadow-[0_0_40px_rgba(59,130,246,0.4)] transition-all rounded-2xl font-black uppercase tracking-widest text-sm"
                    >
                        {saveMutation.isLoading ? <Loader2 className="animate-spin mr-3" /> : <Upload size={20} className="mr-3" />}
                        Upload Marksheet
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default StaffResults;
