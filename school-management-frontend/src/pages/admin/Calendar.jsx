import React, { useState } from 'react';
import { Calendar, Plus, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import PageHeader from '../../components/ui/PageHeader';

const EVENT_TYPES = ['Holiday', 'Exam', 'Event', 'Meeting', 'Deadline'];
const TYPE_COLORS = {
    Holiday: { badge: 'danger', dot: 'bg-red-500' },
    Exam: { badge: 'warning', dot: 'bg-yellow-500' },
    Event: { badge: 'success', dot: 'bg-green-500' },
    Meeting: { badge: 'info', dot: 'bg-blue-500' },
    Deadline: { badge: 'purple', dot: 'bg-purple-500' },
};

const today = new Date();
const INITIAL_EVENTS = [
    { id: 1, title: 'Republic Day Holiday', date: '2026-01-26', type: 'Holiday', desc: 'National Holiday' },
    { id: 2, title: 'Mid-Semester Exams Begin', date: new Date(today.getFullYear(), today.getMonth(), 15).toISOString().split('T')[0], type: 'Exam', desc: 'Internal exams for all depts' },
    { id: 3, title: 'Annual Tech Fest', date: new Date(today.getFullYear(), today.getMonth(), 20).toISOString().split('T')[0], type: 'Event', desc: 'TechFest 2026 celebration' },
    { id: 4, title: 'Faculty Meeting', date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2).toISOString().split('T')[0], type: 'Meeting', desc: 'Monthly review meeting' },
    { id: 5, title: 'Assignment Submission', date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5).toISOString().split('T')[0], type: 'Deadline', desc: 'CSE Sem 3 - All subjects' },
];

const BLANK = { title: '', date: '', type: 'Event', desc: '' };

const AdminCalendar = () => {
    const [events, setEvents] = useState(INITIAL_EVENTS);
    const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
    const [selected, setSelected] = useState(today.toISOString().split('T')[0]);
    const [modalOpen, setModal] = useState(false);
    const [form, setForm] = useState(BLANK);

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
    const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

    const getEventsForDay = (day) => {
        const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return events.filter(e => e.date === iso);
    };

    const selectedEvents = events.filter(e => e.date === selected);

    const handleSubmit = e => {
        e.preventDefault();
        setEvents(p => [...p, { ...form, id: Date.now() }]);
        setModal(false);
        setForm(BLANK);
    };

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const todayStr = today.toISOString().split('T')[0];

    return (
        <div className="p-4 md:p-6 lg:p-8 min-h-screen">
            <PageHeader title="Academic Calendar" subtitle="Manage events, holidays, and important dates" icon={Calendar}
                action={<Button onClick={() => { setModal(true); setForm({ ...BLANK, date: selected }); }}><Plus size={16} className="mr-2" />Add Event</Button>} />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Calendar Grid */}
                <div className="xl:col-span-2 glass-card rounded-2xl p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-white font-bold text-xl">{monthNames[month]} {year}</h2>
                        <div className="flex gap-2">
                            <button onClick={prevMonth} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"><ChevronLeft size={18} /></button>
                            <button onClick={() => setViewDate(new Date(today.getFullYear(), today.getMonth(), 1))} className="px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors font-medium">Today</button>
                            <button onClick={nextMonth} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"><ChevronRight size={18} /></button>
                        </div>
                    </div>
                    {/* Day Names */}
                    <div className="grid grid-cols-7 mb-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                            <div key={d} className="text-center text-xs font-bold text-slate-500 uppercase py-2">{d}</div>
                        ))}
                    </div>
                    {/* Day Cells */}
                    <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
                        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                            const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            const dayEvents = getEventsForDay(day);
                            const isToday = iso === todayStr;
                            const isSelected = iso === selected;
                            return (
                                <button key={day} onClick={() => setSelected(iso)}
                                    className={`
                                        relative rounded-xl p-1.5 min-h-[60px] text-left transition-all
                                        ${isSelected ? 'bg-primary-600/30 border border-primary-500/50' : 'hover:bg-white/5'}
                                    `}>
                                    <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-primary-600 text-white' : isSelected ? 'text-primary-400' : 'text-slate-400'}`}>
                                        {day}
                                    </span>
                                    <div className="mt-1 space-y-0.5">
                                        {dayEvents.slice(0, 2).map(ev => (
                                            <div key={ev.id} className={`w-full h-1 rounded-full ${TYPE_COLORS[ev.type]?.dot || 'bg-slate-500'}`} title={ev.title} />
                                        ))}
                                        {dayEvents.length > 2 && <p className="text-[9px] text-slate-500 pl-0.5">+{dayEvents.length - 2}</p>}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-white/10">
                        {EVENT_TYPES.map(type => (
                            <div key={type} className="flex items-center gap-1.5">
                                <div className={`w-2.5 h-2.5 rounded-full ${TYPE_COLORS[type]?.dot}`} />
                                <span className="text-xs text-slate-400">{type}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Events Sidebar */}
                <div className="glass-card rounded-2xl p-5 flex flex-col">
                    <h3 className="text-white font-semibold mb-4 text-sm">
                        {new Date(selected + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </h3>
                    {selectedEvents.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
                            <Calendar size={28} className="text-slate-700 mb-3" />
                            <p className="text-slate-500 text-sm">No events on this day</p>
                        </div>
                    ) : (
                        <div className="space-y-3 flex-1 overflow-y-auto">
                            {selectedEvents.map(ev => (
                                <div key={ev.id} className="p-3 bg-white/5 border border-white/10 rounded-xl group">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <Badge variant={TYPE_COLORS[ev.type]?.badge || 'default'} className="mb-1.5">{ev.type}</Badge>
                                            <p className="text-white font-medium text-sm">{ev.title}</p>
                                            {ev.desc && <p className="text-slate-500 text-xs mt-0.5">{ev.desc}</p>}
                                        </div>
                                        <button onClick={() => setEvents(p => p.filter(e => e.id !== ev.id))}
                                            className="p-1 text-slate-600 hover:text-red-400 rounded opacity-0 group-hover:opacity-100 transition-all shrink-0">
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <Button className="mt-4 w-full" variant="glass" size="sm" onClick={() => { setModal(true); setForm({ ...BLANK, date: selected }); }}>
                        <Plus size={14} className="mr-1.5" /> Add Event for this Day
                    </Button>
                </div>
            </div>

            <Modal isOpen={modalOpen} onClose={() => setModal(false)} title="Add Calendar Event" size="sm">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Event Title *</label>
                        <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Date *</label>
                            <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} required
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Type</label>
                            <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-primary-500 focus:outline-none">
                                {EVENT_TYPES.map(t => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Description</label>
                        <textarea value={form.desc} onChange={e => setForm(p => ({ ...p, desc: e.target.value }))} rows={3}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none" />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="glass" size="sm" onClick={() => setModal(false)}>Cancel</Button>
                        <Button type="submit" size="sm">Add Event</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default AdminCalendar;
