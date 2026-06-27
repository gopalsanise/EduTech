import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff, Check, X, Lock, ArrowRight, Loader2, Sparkles, Mail, User } from 'lucide-react';
import AuthLayout from '../../layouts/AuthLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import api from '../../services/api';

const CreatePassword = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Data can come from location state (Student flow) or we might need email (Teacher flow)
    const { enrollmentNumber, role, email: initialEmail, userId } = location.state || {};
    
    const [email, setEmail] = useState(initialEmail || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Validation Rules
    const rules = [
        { label: 'Minimum 8 characters', test: (p) => p.length >= 8 },
        { label: 'At least one uppercase letter (A-Z)', test: (p) => /[A-Z]/.test(p) },
        { label: 'At least one lowercase letter (a-z)', test: (p) => /[a-z]/.test(p) },
        { label: 'At least one number (0-9)', test: (p) => /[0-9]/.test(p) },
        { label: 'At least one special character (!@#$%^&*)', test: (p) => /[!@#$%^&*]/.test(p) },
    ];

    const metRulesCount = rules.filter(r => r.test(password)).length;
    const isPasswordValid = metRulesCount === rules.length;
    const passwordsMatch = password === confirmPassword && password !== '';

    const getStrengthLevel = () => {
        if (metRulesCount <= 2) return { label: 'Weak', color: 'bg-red-500', text: 'text-red-400' };
        if (metRulesCount <= 4) return { label: 'Medium', color: 'bg-yellow-500', text: 'text-yellow-400' };
        return { label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-400' };
    };

    const strength = getStrengthLevel();

    useEffect(() => {
        // If no identifying info is present, redirect to appropriate signup/apply page
        if (!userId) {
            navigate('/signup');
        }
    }, [userId, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isPasswordValid || !passwordsMatch) return;

        setLoading(true);
        setError('');
        try {
            await api.post('/auth/create-password', {
                userId,
                password
            });
            setSuccess(true);
            setTimeout(() => {
                navigate(role === 'student' ? '/login/student' : '/login/staff');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to set password. Please check your data.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <AuthLayout title="Account Secured!" subtitle="Your password has been successfully updated." roleIcon={ShieldCheck}>
                <div className="text-center space-y-6 py-12">
                    <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                        <ShieldCheck className="text-emerald-400" size={48} />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight">Access Granted</h2>
                        <p className="text-slate-400 text-sm px-8 leading-relaxed">Login logic synchronized. Redirecting you to the authentication portal...</p>
                    </div>
                    <div className="flex justify-center pt-4">
                        <Loader2 className="text-primary-500 animate-spin" size={24} />
                    </div>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout 
            title={role === 'teacher' ? "Staff Activation" : "Secure Portal"} 
            subtitle="Finalize your identity with a robust password" 
            roleIcon={Lock}
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    {/* Role Identifier Badge */}
                    <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-400 border border-primary-500/20">
                            {role === 'teacher' ? <Mail size={20} /> : <User size={20} />}
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-none mb-1">Authenticated via</p>
                            <p className="text-sm font-bold text-white uppercase tracking-tight">{enrollmentNumber || email}</p>
                        </div>
                    </div>

                    <Input
                        label="Account Password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        icon={Lock}
                        rightElement={
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="p-2 text-slate-500 hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        }
                    />

                    {/* Strength visualizer */}
                    {password && (
                        <div className="space-y-2 px-1">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                <span className={strength.text}>Entropy: {strength.label}</span>
                                <span className="text-slate-600">{metRulesCount}/5 rules</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex gap-1 shadow-inner">
                                {[1, 2, 3, 4, 5].map((idx) => (
                                    <div 
                                        key={idx} 
                                        className={`h-full flex-1 transition-all duration-700 ${idx <= metRulesCount ? strength.color : 'bg-transparent'}`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    <Input
                        label="Repeat Password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        icon={ShieldCheck}
                    />
                </div>

                {/* Requirements Checklist */}
                <div className="glass-card bg-slate-900/40 border border-white/5 rounded-[1.5rem] p-6 space-y-3 shadow-xl">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Sparkles size={12} className="text-primary-500" /> Security Protocol
                    </p>
                    <div className="grid grid-cols-1 gap-2.5">
                        {rules.map((rule, index) => {
                            const isMet = rule.test(password);
                            return (
                                <div key={index} className="flex items-center gap-3 group">
                                    <div className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all duration-300 ${isMet ? 'bg-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]' : 'bg-white/5 group-hover:bg-white/10'}`}>
                                        {isMet ? <Check className="text-emerald-500" size={12} strokeWidth={4} /> : <X className="text-slate-700" size={10} />}
                                    </div>
                                    <span className={`text-[11px] font-bold uppercase tracking-tight transition-colors ${isMet ? 'text-slate-300' : 'text-slate-500'}`}>{rule.label}</span>
                                </div>
                            );
                        })}
                        <div className="pt-3 mt-1 border-t border-white/5">
                             <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all duration-300 ${passwordsMatch ? 'bg-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]' : 'bg-white/5'}`}>
                                    {passwordsMatch ? <Check className="text-emerald-500" size={12} strokeWidth={4} /> : <X className="text-slate-700" size={10} />}
                                </div>
                                <span className={`text-[11px] font-bold uppercase tracking-tight transition-colors ${passwordsMatch ? 'text-slate-300' : 'text-slate-500'}`}>Consistency Check</span>
                            </div>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-[11px] font-black text-red-400 uppercase tracking-widest text-center animate-shake">
                        {error}
                    </div>
                )}

                <Button 
                    type="submit" 
                    disabled={loading || !isPasswordValid || !passwordsMatch} 
                    className="w-full py-4.5 rounded-[1.25rem] group relative overflow-hidden shadow-2xl transition-transform active:scale-95"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {loading ? (
                        <Loader2 className="animate-spin relative z-10" size={20} />
                    ) : (
                        <div className="flex items-center justify-center gap-2 relative z-10 uppercase font-black tracking-widest text-xs">
                            Finalize Credentials <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    )}
                </Button>

                <p className="text-center text-[10px] text-slate-600 font-black uppercase tracking-widest px-4 opacity-50">
                    System Node Activated & Secure
                </p>
            </form>
        </AuthLayout>
    );
};

export default CreatePassword;
