import React, { useState } from 'react';
import { Clock, Plus, X } from 'lucide-react';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import PageHeader from '../../components/ui/PageHeader';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PERIODS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];
const DEPTS = ['CSE', 'ECE', 'ME', 'CE', 'IT'];
const COLORS = ['bg-primary-600', 'bg-purple-600', 'bg-blue-600', 'bg-green-600', 'bg-orange-600', 'bg-pink-600', 'bg-teal-600'];

const INITIAL_SLOTS = [
    { id: 1, day: 'Monday', period: '09:00', sessionTitle: 'Module Lecture', faculty: 'Dr. Ramesh', room: 'L-201', color: 'bg-primary-600', dept: 'CSE', sem: 3 },
    { id: 2, day: 'Monday', period: '11:00', sessionTitle: 'Theory Session', faculty: 'Prof. Anita', room: 'L-102', color: 'bg-purple-600', dept: 'CSE', sem: 5 },
    { id: 3, day: 'Tuesday', period: '09:00', sessionTitle: 'Technical Workshop', faculty: 'Dr. Ramesh', room: 'L-201', color: 'bg-blue-600', dept: 'CSE', sem: 5 },
    { id: 4, day: 'Wednesday', period: '10:00', sessionTitle: 'Academic Seminar', faculty: 'Ms. Kavya', room: 'L-301', color: 'bg-green-600', dept: 'CSE', sem: 3 },
    { id: 5, day: 'Thursday', period: '14:00', sessionTitle: 'Practical Lab', faculty: 'Mr. Dinesh', room: 'IT Lab', color: 'bg-orange-600', dept: 'CSE', sem: 3 },
    { id: 6, day: 'Friday', period: '09:00', sessionTitle: 'Digital Lab', faculty: 'Dr. Suresh', room: 'L-401', color: 'bg-teal-600', dept: 'ECE', sem: 3 },
];

const BLANK = { day: 'Monday', period: '09:00', sessionTitle: '', faculty: '', room: '', dept: 'CSE', sem: 3, color: 'bg-primary-600' };

const AdminTimetable = () => {
    const [slots, setSlots] = useState(INITIAL_SLOTS);
    const [deptFilter, setDept] = useState('CSE');
    const [semFilter, setSem] = useState('');
    const [modalOpen, setModal] = useState(false);
    const [form, setForm] = useState(BLANK);
    const [colorIdx, setColorIdx] = useState(0);

    const displayed = slots.filter(s =>
        s.dept === deptFilter && (!semFilter || String(s.sem) === String(semFilter))
    );

    const getSlot = (day, period) => displayed.find(s => s.day === day && s.period === period);

    const openAdd = (day, period) => {
        setForm({ ...BLANK, day, period, dept: deptFilter, sem: semFilter ? Number(semFilter) : 3 });
        setColorIdx(c => (c + 1) % COLORS.length);
        setModal(true);
    };

    const handleSubmit = e => {
        e.preventDefault();
        setSlots(p => [...p, { ...form, id: Date.now(), sem: Number(form.sem), color: COLORS[colorIdx] }]);
        setModal(false);
    };

    const removeSlot = id => setSlots(p => p.filter(s => s.id !== id));

    return (
        <div className="p-4 md:p-6 lg:p-8 min-h-screen">
            <PageHeader title="Timetable" subtitle="Weekly class schedule management" icon={Clock} />

            {/* Filters */}
            <div className="glass-card p-4 rounded-2xl mb-6 flex flex-wrap gap-3 items-center">
                <select value={deptFilter} onChange={e => setDept(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-primary-500 focus:outline-none">
                    {DEPTS.map(d => <option key={d}>{d}</option>)}
                </select>
                <select value={semFilter} onChange={e => setSem(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-primary-500 focus:outline-none">
                    <option value="">All Semesters</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                </select>
                <p className="text-slate-400 text-sm ml-auto">{displayed.length} slots scheduled</p>
            </div>

            {/* Grid */}
            <div className="glass-card rounded-2xl overflow-x-auto">
                <table className="w-full border-collapse min-w-[700px]">
                    <thead>
                        <tr>
                            <th className="border border-white/10 px-3 py-2.5 text-xs text-slate-500 font-bold uppercase tracking-wide text-left w-20">Time</th>
                            {DAYS.map(day => (
                                <th key={day} className="border border-white/10 px-3 py-2.5 text-xs text-slate-400 font-bold text-center">{day.slice(0, 3)}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {PERIODS.map(period => (
                            <tr key={period}>
                                <td className="border border-white/10 px-3 py-2 text-xs text-slate-500 font-mono text-center">{period}</td>
                                {DAYS.map(day => {
                                    const slot = getSlot(day, period);
                                    return (
                                        <td key={day} className="border border-white/5 p-1 h-16 align-top">
                                            {slot ? (
                                                <div className={`${slot.color}/90 rounded-lg p-2 h-full flex flex-col text-white relative group`}>
                                                    <p className="text-[11px] font-bold leading-tight truncate">{slot.sessionTitle}</p>
                                                    <p className="text-[10px] opacity-80 truncate">{slot.faculty}</p>
                                                    <p className="text-[10px] opacity-60">{slot.room}</p>
                                                    <button onClick={() => removeSlot(slot.id)}
                                                        className="absolute top-1 right-1 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity rounded text-white/70 hover:text-white">
                                                        <X size={10} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button onClick={() => openAdd(day, period)}
                                                    className="w-full h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity text-slate-600 hover:text-primary-400 rounded-lg hover:bg-white/5">
                                                    <Plus size={14} />
                                                </button>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={modalOpen} onClose={() => setModal(false)} title="Add Timetable Slot" size="sm">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Day</label>
                            <select name="day" value={form.day} onChange={e => setForm(p => ({ ...p, day: e.target.value }))}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none">
                                {DAYS.map(d => <option key={d}>{d}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Period</label>
                            <select name="period" value={form.period} onChange={e => setForm(p => ({ ...p, period: e.target.value }))}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none">
                                {PERIODS.map(p => <option key={p}>{p}</option>)}
                            </select>
                        </div>
                    </div>
                    {[['sessionTitle', 'Session Name'], ['faculty', 'Faculty Name'], ['room', 'Room / Lab']].map(([name, label]) => (
                        <div key={name}>
                            <label className="block text-sm text-slate-400 mb-1">{label} *</label>
                            <input name={name} value={form[name]} required onChange={e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                        </div>
                    ))}
                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="glass" size="sm" onClick={() => setModal(false)}>Cancel</Button>
                        <Button type="submit" size="sm">Add Slot</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default AdminTimetable;
