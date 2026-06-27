import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Branding from '../components/ui/Branding';
import { useAuth } from '../context/AuthContext';

const Welcome = () => {
    const navigate = useNavigate();
    const { user, loading } = useAuth();
    const [fade, setFade] = useState(false);

    useEffect(() => {
        setFade(true);
        if (loading) return;

        // Determine if we should skip the long delay
        const hasSeenWelcome = sessionStorage.getItem('welcome_shown');
        const delay = hasSeenWelcome ? 500 : 2500;

        const timer = setTimeout(() => {
            sessionStorage.setItem('welcome_shown', 'true');
            if (user) {
                navigate('/dashboard', { replace: true });
            } else {
                navigate('/login/student', { replace: true });
            }
        }, delay);

        return () => clearTimeout(timer);
    }, [loading, user, navigate]);

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 overflow-hidden relative">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-600/10 blur-[120px] rounded-full pointer-events-none" />

            <div className={`transition-all duration-1000 ease-out transform ${fade ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <Branding size="xl" showCollegeName={true} />
            </div>

            {/* Subtle loading indicator */}
            <div className={`mt-12 transition-opacity duration-1000 delay-500 ${fade ? 'opacity-40' : 'opacity-0'}`}>
                <div className="flex gap-1.5">
                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
            </div>
        </div>
    );
};

export default Welcome;
