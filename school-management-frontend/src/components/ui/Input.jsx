import React from 'react';
import { cn } from './Button';

const Input = React.forwardRef(({ className, label, error, prefixText, icon: Icon, rightElement, ...props }, ref) => {
    return (
        <div className="w-full space-y-1.5 relative group/input">
            {label && <label className="text-xs font-black text-slate-500 ml-1 uppercase tracking-widest">{label}</label>}
            <div className="relative flex items-center">
                {Icon && (
                    <div className="absolute left-4 text-slate-500 group-focus-within/input:text-primary-500 transition-colors">
                        <Icon size={18} />
                    </div>
                )}
                {prefixText && (
                    <span className="absolute left-10 text-slate-400 font-medium select-none pointer-events-none">
                        {prefixText}
                    </span>
                )}
                <input
                    ref={ref}
                    className={cn(
                        "w-full px-4 py-3 bg-slate-900/50 border border-white/5 rounded-2xl text-white placeholder-slate-600",
                        "focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all",
                        "backdrop-blur-xl",
                        Icon && "pl-12",
                        prefixText && (Icon ? "pl-[4.5rem]" : "pl-14"),
                        error && "border-red-500 focus:ring-red-500",
                        className
                    )}
                    {...props}
                />
                {rightElement && (
                    <div className="absolute right-2 flex items-center">
                        {rightElement}
                    </div>
                )}
            </div>
            {error && <p className="text-[10px] font-bold text-red-500 ml-1">{error}</p>}
        </div>
    );
});

export default Input;
