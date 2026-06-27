import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Shield, Users, Building2, Loader2 } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import branchService from '../../services/branchService';
import studentService from '../../services/studentService';

const Semesters = () => {
    const [loading, setLoading] = useState(true);
    const [branches, setBranches] = useState([]);
    const [students, setStudents] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [b, s] = await Promise.all([
                branchService.getAll(),
                studentService.getAll()
            ]);
            setBranches(b);
            setStudents(s);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const matrix = useMemo(() => {
        const m = {};
        branches.forEach(b => {
            m[b._id] = { name: b.name, code: b.code, sems: {} };
            for (let i = 1; i <= 8; i++) m[b._id].sems[i] = 0;
        });

        students.forEach(s => {
            if (s.branch?._id && m[s.branch._id]) {
                m[s.branch._id].sems[s.semester] = (m[s.branch._id].sems[s.semester] || 0) + 1;
            }
        });
        return Object.values(m);
    }, [branches, students]);

    return (
        <div className="p-4 md:p-6 lg:p-10 min-h-screen">
            <PageHeader
                title="Academic Structure"
                subtitle="Year & Semester management across institutional branches"
                icon={Calendar}
            />

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32">
                    <Loader2 className="animate-spin text-primary-500 mb-6" size={48} strokeWidth={1.5} />
                    <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Mapping Academic Matrix...</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Summary Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="glass-card p-6 rounded-3xl border border-white/10 bg-gradient-to-br from-primary-500/10 to-transparent">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-2 bg-primary-500/20 rounded-lg text-primary-400"><Shield size={20} /></div>
                                <h4 className="text-white font-bold">Active Session</h4>
                            </div>
                            <p className="text-2xl font-black text-white px-1">2024-2025</p>
                        </div>
                        <div className="glass-card p-6 rounded-3xl border border-white/10">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400"><Users size={20} /></div>
                                <h4 className="text-white font-bold">Total Students</h4>
                            </div>
                            <p className="text-2xl font-black text-white px-1">{students.length}</p>
                        </div>
                        <div className="glass-card p-6 rounded-3xl border border-white/10">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400"><Building2 size={20} /></div>
                                <h4 className="text-white font-bold">Departments</h4>
                            </div>
                            <p className="text-2xl font-black text-white px-1">{branches.length}</p>
                        </div>
                    </div>

                    {/* Branch-Semester Matrix */}
                    <div className="glass-card rounded-[2.5rem] overflow-hidden border border-white/10 bg-slate-900/40 backdrop-blur-3xl">
                        <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center">
                            <h3 className="text-white font-black text-xl tracking-tight uppercase">Registry Matrix</h3>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">Automated Mapping</span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white/[0.02]">
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest border-r border-white/5">Branch / Semester</th>
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                                            <th key={s} className="px-4 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center min-w-[80px]">SEM {s}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.03]">
                                    {matrix.map(row => (
                                        <tr key={row.code} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-8 py-5 border-r border-white/5">
                                                <p className="text-white font-black text-sm uppercase tracking-tight group-hover:text-primary-400 transition-colors">{row.name}</p>
                                                <p className="text-[9px] text-slate-600 font-bold">{row.code} Core</p>
                                            </td>
                                            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                                                <td key={s} className="px-4 py-5 text-center">
                                                    <div className={`inline-flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${row.sems[s] > 0
                                                        ? 'bg-primary-500/10 border-primary-500/30 text-primary-400'
                                                        : 'bg-slate-950/30 border-white/5 text-slate-800'}`}>
                                                        <span className="text-sm font-black leading-none">{row.sems[s]}</span>
                                                        <span className="text-[8px] font-bold mt-0.5 uppercase opacity-60">Students</span>
                                                    </div>
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Semesters;
