import React from 'react';
import { motion } from 'framer-motion';

const PageHeader = ({ title, subtitle, icon: Icon, iconColor = 'primary', action }) => {
    const colorMap = {
        primary: 'bg-primary-500/15 text-primary-400 ring-primary-500/20',
        secondary: 'bg-secondary-500/15 text-secondary-400 ring-secondary-500/20',
        emerald: 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/20',
        amber: 'bg-amber-500/15 text-amber-400 ring-amber-500/20',
        purple: 'bg-purple-500/15 text-purple-400 ring-purple-500/20',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10"
        >
            <div className="flex items-center gap-5">
                {Icon && (
                    <div className={`shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center ring-1 ${colorMap[iconColor] || colorMap.primary}`}>
                        <Icon size={28} strokeWidth={2} />
                    </div>
                )}
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">{title}</h1>
                    {subtitle && <p className="text-slate-400 text-sm font-medium mt-1 uppercase tracking-wider">{subtitle}</p>}
                </div>
            </div>
            {action && (
                <div className="shrink-0 animate-in fade-in slide-in-from-right-4 duration-700">
                    {action}
                </div>
            )}
        </motion.div>
    );
};

export default PageHeader;
