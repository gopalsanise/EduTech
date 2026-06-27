import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Smartphone, ShieldCheck, Mailbox, Loader2, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import api from '../../services/api';

const ChangePassword = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [step, setStep] = useState(1); // 1: Send OTP, 2: Verify & Change
    
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSendOTP = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/send-otp', { userId: user._id });
            if (res.data.success) {
                setStep(2);
                setSuccessMsg('OTP sent to your registered mobile.');
                setTimeout(() => setSuccessMsg(''), 3000);
            } else {
                setError(res.data.message || 'Failed to send OTP.');
            }
        } catch (err) {
            setError('Failed to send verification code.');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/reset-password', {
                userId: user._id,
                otp,
                newPassword
            });
            if (res.data.success) {
                setSuccessMsg('Password changed successfully!');
                setOtp('');
                setNewPassword('');
                setConfirmPassword('');
                setStep(1); // Reset to start or could redirect
            } else {
                setError(res.data.message || 'Verification failed');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update password.');
        } finally {
            setLoading(false);
        }
    };

    const maskMobile = (num) => {
        if (!num || num.length < 10) return "*******";
        return `******${num.substring(6)}`;
    };

    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-2xl mx-auto min-h-screen flex items-center justify-center">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden"
            >
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/10 rounded-full blur-[100px] -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[100px] -ml-32 -mb-32" />

                <div className="relative z-10 text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-primary-600/20">
                        <Lock size={32} />
                    </div>
                    <h1 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Security Hub</h1>
                    <p className="text-slate-400 text-sm font-medium italic">"Update your credentials using two-factor authentication"</p>
                </div>

                {step === 1 ? (
                    <div className="space-y-6 text-center">
                        <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                            <Smartphone className="mx-auto text-primary-400 mb-4" size={32} />
                            <p className="text-slate-300 text-sm mb-2 font-bold">Two-Step Verification Required</p>
                            <p className="text-slate-500 text-xs leading-relaxed capitalize">
                                To ensure account integrity, we will send an OTP to your registered phone number:
                                <span className="block text-white font-mono mt-2 tracking-widest">{maskMobile(user?.mobile)}</span>
                            </p>
                        </div>

                        <AnimatePresence>
                            {error && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-[11px] font-black uppercase tracking-widest">
                                    {error}
                                </motion.div>
                            )}
                             {successMsg && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-[11px] font-black uppercase tracking-widest">
                                    {successMsg}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <Button onClick={handleSendOTP} disabled={loading} className="w-full py-4 rounded-2xl group">
                            {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                <div className="flex items-center justify-center gap-2 uppercase font-black tracking-widest text-xs">
                                    Initiate Verification <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </div>
                            )}
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleChangePassword} className="space-y-5">
                        <Input
                            label="Verification Code (OTP)"
                            type="text"
                            placeholder="123456"
                            maxLength="6"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                            required
                            icon={Mailbox}
                            className="text-center tracking-[0.5em] font-bold text-lg"
                        />

                        <Input
                            label="New Robust Password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            icon={ShieldCheck}
                            rightElement={
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="p-2 text-slate-500">
                                    {showPassword ? <Lock size={18} /> : <Smartphone size={18} />}
                                </button>
                            }
                        />

                        <Input
                            label="Re-type Password"
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            icon={Lock}
                        />

                        <AnimatePresence>
                             {error && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-[11px] font-black uppercase tracking-widest text-center">
                                    {error}
                                </motion.div>
                            )}
                            {successMsg && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-[11px] font-black uppercase tracking-widest text-center">
                                    {successMsg}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex gap-3 pt-2">
                             <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1 py-4 rounded-2xl uppercase font-black tracking-widest text-[10px]">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading || otp.length !== 6 || !newPassword} className="flex-[2] py-4 rounded-2xl">
                                {loading ? <Loader2 className="animate-spin" size={20} /> : "Update Credentials"}
                            </Button>
                        </div>
                        <div className="text-center pt-2">
                            <button type="button" onClick={handleSendOTP} className="text-xs text-primary-400 font-bold hover:underline">
                                Resend Verification Code
                            </button>
                        </div>
                    </form>
                )}
            </motion.div>
        </div>
    );
};

export default ChangePassword;
