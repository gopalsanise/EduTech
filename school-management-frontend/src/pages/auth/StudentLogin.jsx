import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, GraduationCap, KeyRound, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../layouts/AuthLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const StudentLogin = () => {
    const [enrollmentNumber, setEnrollmentNumber] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const { login, verifyOtp } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(null, password, enrollmentNumber, 'student');
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Student Portal"
            subtitle="Access your results, timetable and AI insights"
            roleIcon={GraduationCap}
            iconColor="blue"
            backgroundImage="/assets/auth/student_bg.png"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                    label="Enrollment No."
                    type="text"
                    placeholder="2022CSxxx"
                    value={enrollmentNumber}
                    onChange={(e) => setEnrollmentNumber(e.target.value)}
                    required
                />
                <Input
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    icon={KeyRound}
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
                
                <div className="flex justify-between items-center px-1">
                     <p className="text-[10px] text-slate-500 font-medium italic">
                        Secured with AES-256 Encryption
                    </p>
                    <Link to="/forgot-password" className="text-[10px] font-black text-primary-400 hover:underline uppercase tracking-widest">
                        Forgot Password?
                    </Link>
                </div>

                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-[11px] font-black text-red-400 uppercase tracking-widest text-center animate-shake">
                        {error}
                        {error.includes("activated") && (
                            <div className="mt-2 pt-2 border-t border-red-500/10">
                                <Link to="/signup" className="text-blue-400 hover:underline">Activate Now →</Link>
                            </div>
                        )}
                    </div>
                )}

                <Button type="submit" disabled={loading} className="w-full py-4 rounded-2xl group relative overflow-hidden shadow-2xl transition-transform active:scale-95">
                     <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {loading ? (
                        <Loader2 className="animate-spin relative z-10" size={20} />
                    ) : (
                        <div className="flex items-center justify-center gap-2 relative z-10 uppercase font-black tracking-widest text-xs">
                             Enter Portal <LogIn size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                    )}
                </Button>
            </form>

            <div className="pt-6 border-t border-white/5 space-y-4">
                <p className="text-center text-xs text-slate-500 font-bold uppercase tracking-wider">
                    New to the Institution? <Link to="/signup" className="text-blue-400 hover:text-blue-300 hover:underline">Initialize Account</Link>
                </p>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 px-2 pt-4">
                    <Link to="/login/staff" className="hover:text-white transition-colors">Faculty Access</Link>
                    <Link to="/login/admin" className="hover:text-white transition-colors">Admin Core</Link>
                </div>
            </div>
        </AuthLayout>
    );
};

export default StudentLogin;
