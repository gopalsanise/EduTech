import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ShieldCheck, ArrowRight, Loader2, KeyRound, AlertCircle, CheckCircle2, Phone, Mailbox } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import api from '../../services/api';

const Signup = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState(1);
    
    // Form States
    const [formData, setFormData] = useState({
        enrollmentNumber: '',
        dob: ''
    });
    
    const [userId, setUserId] = useState(null);
    const [mobile, setMobile] = useState('');
    const [otp, setOtp] = useState('');

    const handleVerifyIdentity = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/auth/student-verify-identity', {
                enrollmentNumber: formData.enrollmentNumber,
                dob: formData.dob
            });
            
            const data = response.data;
            
            if (data.status === 'Active') {
                setError('Account already activated. Please login.');
                return;
            }

            setUserId(data.userId);
            if (data.mobile) {
                setMobile(data.mobile);
            }
            setStep(2); // Go to Mobile/OTP step
        } catch (err) {
            setError(err.response?.data?.error || 'Identity verification failed. Please check your details.');
        } finally {
            setLoading(false);
        }
    };

    const handleSendOTP = async (e) => {
        e.preventDefault();
        if (mobile.length !== 10) {
            setError('Please enter a valid 10-digit mobile number.');
            return;
        }
        setError('');
        setLoading(true);
        try {
            await api.post('/auth/send-otp', { userId, mobile });
            setStep(3); // Go to OTP verification step
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send OTP.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/auth/verify-otp', { userId, otp });
            if (res.data.success) {
                navigate('/create-password', { 
                    state: { 
                        enrollmentNumber: formData.enrollmentNumber,
                        role: 'student',
                        userId: userId,
                        mobile: mobile
                    } 
                });
            } else {
                setError(res.data.message || 'Invalid OTP');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to verify OTP.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout 
            title={step === 1 ? "Account Activation" : step === 2 ? "Mobile Verification" : "Enter OTP"} 
            subtitle={step === 1 ? "Verify your identity to secure your student portal" : "We need to verify your phone number via SMS"}
            roleIcon={step === 1 ? ShieldCheck : step === 2 ? Phone : Mailbox}
            iconColor="primary"
            backgroundImage="/assets/auth/signup_bg.png"
        >
            {step === 1 && (
                <form onSubmit={handleVerifyIdentity} className="space-y-6">
                    <p className="text-slate-400 text-sm mb-4">Enter your enrollment number and date of birth to verify your identity.</p>
                    <Input
                        label="Enrollment Number"
                        type="text"
                        placeholder="e.g. 2022CS101"
                        value={formData.enrollmentNumber}
                        onChange={(e) => setFormData({ ...formData, enrollmentNumber: e.target.value })}
                        required
                        icon={User}
                    />

                    <Input
                        label="Date of Birth"
                        type="date"
                        value={formData.dob}
                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                        required
                        icon={KeyRound}
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

                    <Button type="submit" disabled={loading} className="w-full py-4 rounded-2xl group">
                        {loading ? (
                            <Loader2 className="animate-spin" size={18} />
                        ) : (
                            <div className="flex items-center justify-center gap-2">
                                Verify Identity <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        )}
                    </Button>
                </form>
            )}

            {step === 2 && (
                <form onSubmit={handleSendOTP} className="space-y-6">
                    <p className="text-slate-400 text-sm mb-4">Confirm your 10-digit mobile number to receive a verification code.</p>
                    <Input
                        label="Mobile Number (10 Digits)"
                        type="text"
                        placeholder="9876543210"
                        maxLength="10"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                        required
                        icon={Phone}
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
                    </AnimatePresence>

                    <Button type="submit" disabled={loading || mobile.length !== 10} className="w-full py-4 rounded-2xl">
                        {loading ? <Loader2 className="animate-spin" size={18} /> : "Send OTP"}
                    </Button>
                </form>
            )}

            {step === 3 && (
                <form onSubmit={handleVerifyOTP} className="space-y-6">
                    <p className="text-slate-400 text-sm mb-4">Enter the 6-digit OTP sent to {mobile}.</p>
                    <Input
                        label="Enter OTP"
                        type="text"
                        placeholder="123456"
                        maxLength="6"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        required
                        icon={Mailbox}
                        className="text-center tracking-[0.5em] font-bold text-lg"
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
                    </AnimatePresence>

                    <Button type="submit" disabled={loading || otp.length !== 6} className="w-full py-4 rounded-2xl">
                        {loading ? <Loader2 className="animate-spin" size={18} /> : "Verify OTP"}
                    </Button>
                    <div className="text-center pt-2">
                        <button type="button" onClick={handleSendOTP} className="text-xs text-primary-400 font-bold hover:underline">
                            Resend Code
                        </button>
                    </div>
                </form>
            )}

            <div className="pt-6 border-t border-white/5 mt-6">
                <p className="text-center text-xs text-slate-500 tracking-wide uppercase font-black">
                    Already have an active account?{' '}
                    <Link to="/login/student" className="text-primary-400 hover:text-primary-300 transition-colors ml-1">Login here</Link>
                </p>
            </div>
        </AuthLayout>
    );
};

export default Signup;
