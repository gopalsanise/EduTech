import React, { useState } from 'react';
import { Search, Mail, Phone, User, Loader2, BookOpen, GraduationCap } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import facultyService from '../../services/facultyService';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';
import { motion } from 'framer-motion';

const StaffStudents = () => {
    const [search, setSearch] = useState('');

    const { data: students, isLoading } = useQuery({
        queryKey: ['faculty-students-list'],
        queryFn: () => facultyService.getMyStudents()
    });

    const filtered = students?.filter(s =>
        s.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.rollNumber?.toLowerCase().includes(search.toLowerCase())
    ) || [];

    return (
        <div className="p-4 md:p-6 lg:p-10 min-h-screen">
            <PageHeader
                title="Assigned Students"
                subtitle="Students registered in your assigned semester"
                icon={GraduationCap}
                iconColor="blue"
            />

            <div className="relative mb-8 max-w-2xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                    type="text"
                    placeholder="Search by name or roll number..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-[1.2rem] py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all"
                />
            </div>

            <div className="glass-card rounded-[2.5rem] overflow-hidden border border-white/10 bg-slate-900/40 backdrop-blur-2xl transition-all">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <Loader2 className="animate-spin text-primary-500 mb-6" size={48} strokeWidth={1.5} />
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Querying Semester Roster...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.02]">
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Student Info</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Identifier</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Contact Details</th>
                                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.03]">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={4}>
                                            <EmptyState
                                                title="No Students Found"
                                                description="No students in your assigned semester match this search."
                                            />
                                        </td>
                                    </tr>
                                ) : filtered.map((s, i) => (
                                    <motion.tr
                                        key={s._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="hover:bg-white/[0.04] transition-all group"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-white/10 flex items-center justify-center text-blue-400 font-black text-lg shadow-xl shrink-0 group-hover:scale-110 transition-transform">
                                                    {(s.user?.name || 'S').charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-black text-white text-base tracking-tight uppercase leading-none mb-1">
                                                        {s.user?.name}
                                                    </p>
                                                    <p className="text-xs text-slate-500 font-medium italic">
                                                        Semester {s.semester}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-white font-bold font-mono tracking-tighter uppercase">{s.rollNumber}</span>
                                                <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest mt-0.5">Roll Number</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                                                    <Mail size={12} className="text-primary-500" />
                                                    {s.user?.email}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-slate-400 font-medium font-mono">
                                                    <Phone size={12} className="text-primary-500" />
                                                    {s.phone || 'N/A'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${s.status === 'Active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                                    'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                                }`}>
                                                {s.status}
                                            </span>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StaffStudents;
