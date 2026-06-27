import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Search, ArrowRight, Loader2, KeyRound, AlertCircle, Phone, Lock, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import api from '../../services/api';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [step, setStep] = useState(1);
    
    const [email, setEmail] = useState('');
    const [userId, setUserId] = useState(null);
    const [mobile, setMobile] = useState('');
    const [otp, setOtp] = useState('');
    
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSearchUser = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await api.post('/auth/forgot-password', { email });
            if (res.data.success) {
                setUserId(res.data.userId);
                setMobile(res.data.mobile);
                setStep(2); // OTP Step
            } else {
                setError(res.data.message || 'Verification failed. Please check your email.');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Account not found or no mobile registered.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (!userId || !mobile) return;
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/send-otp', { userId, mobile });
            if (res.data.success) {
                setSuccessMsg('A new OTP has been sent.');
                setTimeout(() => setSuccessMsg(''), 3000);
            } else {
                setError(res.data.message || 'Failed to resend OTP.');
            }
        } catch (err) {
            setError('Failed to resend OTP.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }
        
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/auth/reset-password', { 
                userId, 
                otp, 
                newPassword 
            });
            if (res.data.success) {
                setSuccessMsg('Password updated successfully. Redirecting to login...');
                setTimeout(() => {
                    navigate('/login/student');
                }, 2000);
            } else {
                setError(res.data.message || 'Invalid OTP');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    const maskMobile = (num) => {
        if (!num || num.length < 10) return num;
        return `******${num.substring(6)}`;
    };

    return (
        <AuthLayout 
            title={step === 1 ? "Forgot Password" : step === 2 ? "Reset Password" : "Reset Password"} 
            subtitle={step === 1 ? "Find your account to retrieve access" : "Verify your identity and set a new password"}
            roleIcon={step === 1 ? Search : KeyRound}
            iconColor="purple"
            backgroundImage="/assets/auth/student_bg.png"
        >
            {step === 1 && (
                <form onSubmit={handleSearchUser} className="space-y-6">
                    <p className="text-slate-400 text-sm mb-4">Enter your registered email address to find your account.</p>
                    <Input
                        label="Registered Email"
                        type="email"
                        placeholder="you@college.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        icon={Mail}
                    />

                    <AnimatePresence>
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-xs font-bold"
                            >
                                <AlertCircle className="shrink-0" size={14} />
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <Button type="submit" disabled={loading || !email} className="w-full py-4 rounded-2xl group">
                        {loading ? (
                            <Loader2 className="animate-spin" size={18} />
                        ) : (
                            <div className="flex items-center justify-center gap-2">
                                Search Account <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        )}
                    </Button>
                </form>
            )}

            {step === 2 && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                    <p className="text-slate-400 text-sm mb-4">An OTP has been sent to your registered mobile number: <span className="font-bold text-white">{maskMobile(mobile)}</span></p>
                    
                    <Input
                        label="Enter OTP"
                        type="text"
                        placeholder="123456"
                        maxLength="6"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        required
                        icon={Phone}
                        className="tracking-[0.5em] font-bold text-lg text-center"
                    />

                    <Input
                         label="New Password"
                         type={showPassword ? "text" : "password"}
                         placeholder="••••••••"
                         value={newPassword}
                         onChange={(e) => setNewPassword(e.target.value)}
                         required
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

                    <Input
                        label="Repeat Password"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        icon={ShieldCheck}
                    />

                    <AnimatePresence>
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-xs font-bold"
                            >
                                <AlertCircle className="shrink-0" size={14} />
                                {error}
                            </motion.div>
                        )}
                        {successMsg && (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 text-emerald-400 text-xs font-bold"
                            >
                                <CheckCircle2 className="shrink-0" size={14} />
                                {successMsg}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <Button type="submit" disabled={loading || otp.length !== 6 || !newPassword} className="w-full py-4 rounded-2xl mt-4">
                        {loading ? <Loader2 className="animate-spin" size={18} /> : "Update Password"}
                    </Button>
                    <div className="text-center pt-2">
                        <button type="button" onClick={handleResendOTP} className="text-xs text-primary-400 font-bold hover:underline">
                            Resend Code
                        </button>
                    </div>
                </form>
            )}

            <div className="pt-6 border-t border-white/5 mt-6">
                <p className="text-center text-xs text-slate-500 tracking-wide uppercase font-black">
                    Remember your password?{' '}
                    <Link to="/login/student" className="text-primary-400 hover:text-primary-300 transition-colors ml-1">Login here</Link>
                </p>
            </div>
        </AuthLayout>
    );
};

export default ForgotPassword;
