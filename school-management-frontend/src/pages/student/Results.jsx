import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, FileText, Download, Loader2, BookOpen, AlertCircle, TrendingUp, BarChart3 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import resultService from '../../services/resultService';
import PageHeader from '../../components/ui/PageHeader';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

const StudentResults = () => {
    const [selectedSemester, setSelectedSemester] = useState(null);

    const { data: results, isLoading } = useQuery({
        queryKey: ['my-results'],
        queryFn: () => resultService.getAll()
    });

    const avgGpa = results?.length > 0
        ? (results.reduce((acc, r) => acc + (r.totalMarks / 10), 0) / results.length).toFixed(2)
        : '0.00';

    const filteredResults = selectedSemester
        ? results?.filter(r => r.semester === selectedSemester)
        : results;

    const totalCredits = results?.length > 0
        ? results.length * 20 // Assuming 20 credits per semester now
        : 0;

    return (
        <div className="p-4 md:p-6 lg:p-10 min-h-screen">
            <PageHeader
                title="My Academic Performance"
                subtitle="Detailed breakdown of your grades and credits"
                icon={Trophy}
                iconColor="amber"
            />

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-32">
                    <Loader2 className="animate-spin text-primary-500 mb-6" size={48} strokeWidth={1.5} />
                    <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Loading Grades...</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-8 rounded-[2rem] border border-primary-500/10 flex items-center justify-between group">
                            <div>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Cumulative SGPA</p>
                                <h4 className="text-4xl font-black text-white tracking-tighter">{avgGpa} <span className="text-sm text-slate-600 font-bold uppercase">/ 10</span></h4>
                            </div>
                            <div className="w-14 h-14 bg-primary-500/10 text-primary-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <TrendingUp size={28} />
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="glass-card p-8 rounded-[2rem] border border-blue-500/10 flex items-center justify-between group">
                            <div>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Total Credits</p>
                                <h4 className="text-4xl font-black text-white tracking-tighter">{totalCredits} Earned</h4>
                            </div>
                            <div className="w-14 h-14 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <BarChart3 size={28} />
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="glass-card p-8 rounded-[2rem] border border-green-500/10 flex items-center justify-between group">
                            <div>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Academic Status</p>
                                <h4 className="text-4xl font-black text-green-400 tracking-tighter uppercase">Pass</h4>
                            </div>
                            <div className="w-14 h-14 bg-green-500/10 text-green-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Trophy size={28} />
                            </div>
                        </motion.div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8">
                        <div className="flex-1 glass-card rounded-[2.5rem] overflow-hidden border border-white/10 bg-slate-900/40 backdrop-blur-2xl">
                            <div className="p-8 border-b border-white/5 flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                                        <FileText size={20} />
                                    </div>
                                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Grade Roster</h3>
                                </div>
                                <div className="flex gap-2">
                                    <select
                                        onChange={(e) => setSelectedSemester(e.target.value ? Number(e.target.value) : null)}
                                        className="bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                    >
                                        <option value="">All Semesters</option>
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                                    </select>
                                    <Button variant="glass" className="text-[10px] px-4 py-2 font-black uppercase tracking-widest">
                                        <Download size={14} className="mr-2" /> Export PDF
                                    </Button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-white/[0.02]">
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Academic Period</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Internal Marks</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Sessional Marks</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Practical Marks</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-primary-500 uppercase tracking-widest text-center">Semester Total</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Final Grade</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/[0.03]">
                                        {filteredResults?.length > 0 ? filteredResults.map((res, i) => (
                                            <motion.tr
                                                key={res._id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                className="hover:bg-white/[0.02] transition-colors group"
                                            >
                                                <td className="px-8 py-6">
                                                    <div>
                                                        <p className="font-bold text-white uppercase tracking-tight">Semester {res.semester}</p>
                                                        <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase">Exam Session: {new Date(res.publishedAt).toLocaleDateString()}</p>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-center text-slate-400 font-bold">{res.internalMarks}</td>
                                                <td className="px-8 py-6 text-center text-slate-400 font-bold">{res.sessionalMarks}</td>
                                                <td className="px-8 py-6 text-center text-slate-400 font-bold">{res.practicalMarks}</td>
                                                <td className="px-8 py-6 text-center">
                                                    <span className="text-lg font-black text-primary-400 tracking-tighter">{res.totalMarks}</span>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <Badge className={`${res.grade.includes('A') ? 'bg-green-500/20 text-green-400' : 'bg-primary-500/20 text-primary-400'} font-black px-4`}>
                                                        {res.grade}
                                                    </Badge>
                                                </td>
                                            </motion.tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={6} className="py-20 text-center text-slate-600 italic">No academic records found for the selected criteria.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default StudentResults;
