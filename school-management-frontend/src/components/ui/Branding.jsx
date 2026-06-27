import React from 'react';

const Branding = ({ size = 'md', showCollegeName = false, className = "" }) => {
    const [imgError, setImgError] = React.useState(false);

    const iconSizes = {
        sm: 'w-6 h-6',
        md: 'w-10 h-10',
        lg: 'w-20 h-20',
        xl: 'w-32 h-32'
    };

    const textSizes = {
        sm: 'text-sm',
        md: 'text-xl',
        lg: 'text-3xl',
        xl: 'text-5xl'
    };

    const subtitleSizes = {
        sm: 'text-[8px]',
        md: 'text-[10px]',
        lg: 'text-sm',
        xl: 'text-lg'
    };

    return (
        <div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
            <div className="flex items-center gap-3">
                <div className={`${iconSizes[size]} bg-primary-600 rounded-xl flex items-center justify-center shadow-lg ring-1 ring-white/10 overflow-hidden`}>
                    {!imgError ? (
                        <img
                            src="/logo.png"
                            alt="EduTech Logo"
                            className="w-full h-full object-cover"
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <span className="flex w-full h-full items-center justify-center text-white font-bold text-center leading-none">
                            {size === 'sm' ? 'E' : 'Edu'}
                        </span>
                    )}
                </div>
                <h1 className={`${textSizes[size]} font-black text-white tracking-tighter`}>
                    Edu<span className="text-primary-500">Tech</span>
                </h1>
            </div>
            {showCollegeName && (
                <p className={`${subtitleSizes[size]} font-bold text-slate-500 uppercase tracking-[0.2em] text-center max-w-xs leading-relaxed`}>
                    Thakur Shivkumar Singh Groups of Institution
                </p>
            )}
        </div>
    );
};

export default Branding;
