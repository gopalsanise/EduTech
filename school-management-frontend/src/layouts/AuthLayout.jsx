import React from 'react';
import { BookOpen } from 'lucide-react';
import Branding from '../components/ui/Branding';
import { cn } from '../components/ui/Button';

const AuthLayout = ({ children, title, subtitle, roleIcon: Icon, iconColor = "primary", backgroundImage }) => {
    const colorMap = {
        primary: {
            bg: 'bg-primary-600/10',
            ring: 'ring-primary-500/30',
            text: 'text-primary-500'
        },
        blue: {
            bg: 'bg-blue-600/10',
            ring: 'ring-blue-500/30',
            text: 'text-blue-500'
        },
        indigo: {
            bg: 'bg-indigo-600/10',
            ring: 'ring-indigo-500/30',
            text: 'text-indigo-500'
        },
        rose: {
            bg: 'bg-rose-600/10',
            ring: 'ring-rose-500/30',
            text: 'text-rose-500'
        }
    };

    const colors = colorMap[iconColor] || colorMap.primary;

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-950 relative overflow-hidden">
            {/* Background Image/Overlay */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary-900/40 via-transparent to-secondary-900/40" />
                {backgroundImage && <img src={backgroundImage} alt="" className="w-full h-full object-cover grayscale opacity-30" />}
            </div>

            {/* Background Decorative Blurs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-600/5 blur-[120px] rounded-full z-0" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary-600/5 blur-[120px] rounded-full z-0" />

            <div className="w-full max-w-[440px] z-10 transition-all duration-1000 ease-out opacity-100 translate-y-0 scale-100">
                <div className="glass-card rounded-[2.5rem] p-8 md:p-10 border border-white/10 shadow-2xl backdrop-blur-xl overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />

                    <div className="flex flex-col items-center mb-10 text-center">
                        <Branding size="lg" showCollegeName={true} className="mb-8" />

                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ring-1", colors.bg, colors.ring)}>
                            {Icon ? <Icon size={24} className={colors.text} /> : <BookOpen size={24} className="text-white" />}
                        </div>
                        <h2 className="text-3xl font-black text-white tracking-tight">{title}</h2>
                        <p className="text-sm text-slate-400 mt-2">{subtitle}</p>
                    </div>

                    <div className="relative">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
