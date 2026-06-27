import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Timetable = () => {
    const { user } = useAuth();
    const { data: timetable } = useQuery({
        queryKey: ['studentTimetable'],
        queryFn: async () => {
            const { data } = await api.get('/timetable?department=CSE&semester=1');
            return data;
        }
    });

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return (
        <div className="p-4 md:p-6 lg:p-8 min-h-screen">
            <header className="mb-8 lg:mb-10">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Class Timetable</h1>
                <p className="text-slate-400">Weekly schedule for your semester.</p>
            </header>

            <div className="grid grid-cols-1 gap-6">
                {days.map((day) => {
                    const daySchedule = timetable?.schedule.find(s => s.day === day);
                    return (
                        <div key={day} className="glass-card rounded-2xl p-6 border border-white/5">
                            <h3 className="text-lg font-bold text-primary-400 mb-4">{day}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {daySchedule?.slots.map((slot, i) => (
                                    <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-2">
                                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 tracking-widest uppercase">
                                            <div className="flex items-center gap-1">
                                                <Clock size={12} />
                                                <span>{slot.startTime} - {slot.endTime}</span>
                                            </div>
                                            <span className="px-1.5 py-0.5 bg-slate-800 rounded">{slot.type}</span>
                                        </div>
                                        <h4 className="text-white font-bold">{slot.course.name}</h4>
                                        <div className="flex items-center gap-4 text-xs text-slate-400">
                                            <div className="flex items-center gap-1">
                                                <MapPin size={12} />
                                                <span>{slot.room}</span>
                                            </div>
                                            <span>Prof. {slot.faculty.name.split(' ')[1]}</span>
                                        </div>
                                    </div>
                                ))}
                                {!daySchedule?.slots.length && <p className="text-slate-600 italic text-sm">No classes scheduled</p>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Timetable;
