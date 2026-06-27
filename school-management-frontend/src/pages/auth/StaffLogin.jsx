import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Users, Briefcase, KeyRound, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../layouts/AuthLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const StaffLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const [redirectUrl, setRedirectUrl] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setRedirectUrl('');
        setLoading(true);
        try {
            await login(email, password, null, 'teacher');
            navigate('/dashboard');
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Authentication failure. Please verify your staff credentials.';
            setError(errorMsg);
            if (err.response?.data?.redirect) {
                setRedirectUrl(err.response.data.redirect);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Faculty Hub"
            subtitle="Manage your classes, attendance and results"
            roleIcon={Users}
            iconColor="primary"
            backgroundImage="/assets/auth/staff_bg.png"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                    label="Official Email"
                    type="email"
                    placeholder="e.g. john@college.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    icon={Briefcase}
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
                        Enterprise Grade Security
                    </p>
                    <Link to="/forgot-password" className="text-[10px] font-black text-primary-400 hover:underline uppercase tracking-widest">
                        Forgot Password?
                    </Link>
                </div>
                
                {error && (
                    <div className="space-y-4">
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-[11px] font-black text-red-400 uppercase tracking-widest text-center animate-shake">
                            {error}
                        </div>
                        {redirectUrl && (
                            <Link to={redirectUrl} className="block">
                                <Button className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-[10px] uppercase font-black tracking-widest">
                                    Finalize Account & Create Password
                                </Button>
                            </Link>
                        )}
                    </div>
                )}

                <Button type="submit" disabled={loading} className="w-full py-4 rounded-2xl group relative overflow-hidden shadow-2xl transition-transform active:scale-95">
                     <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {loading ? (
                        <Loader2 className="animate-spin relative z-10" size={20} />
                    ) : (
                        <div className="flex items-center justify-center gap-2 relative z-10 uppercase font-black tracking-widest text-xs">
                             Secure Login <LogIn size={18} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    )}
                </Button>
            </form>

            <div className="pt-6 border-t border-white/5 space-y-4">
                <p className="text-center text-xs text-slate-500 font-bold uppercase tracking-wider">
                    Administrative Onboarding status: <Link to="/status/teacher" className="text-amber-400 hover:text-amber-300 hover:underline">Check Application</Link>
                </p>
                <p className="text-center text-xs text-slate-500 font-bold uppercase tracking-wider">
                    New Faculty Member? <Link to="/teacher/apply" className="text-blue-400 hover:text-blue-300 hover:underline">Apply for Access</Link>
                </p>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 px-2 pt-4">
                    <Link to="/login/student" className="hover:text-white transition-colors">Student Access</Link>
                    <Link to="/login/admin" className="hover:text-white transition-colors">Admin Core</Link>
                </div>
            </div>
        </AuthLayout>
    );
};

export default StaffLogin;
