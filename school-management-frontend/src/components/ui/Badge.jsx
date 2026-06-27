import React from 'react';
import { cn } from './Button';

const variants = {
    success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    danger: 'bg-red-500/15 text-red-400 border-red-500/30',
    warning: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    info: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    purple: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    glass: 'bg-white/5 text-slate-400 border-white/10 backdrop-blur-md',
    default: 'bg-slate-700/50 text-slate-300 border-slate-600/30',
};

const Badge = ({ variant = 'default', children, className }) => (
    <span className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border',
        variants[variant],
        className
    )}>
        {children}
    </span>
);

export default Badge;
