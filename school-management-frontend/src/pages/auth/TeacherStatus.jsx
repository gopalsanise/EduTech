import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Loader2, ArrowRight, CheckCircle2, XCircle, Clock } from 'lucide-react';
import api from '../../services/api';
import AuthLayout from '../../layouts/AuthLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const TeacherStatus = () => {
    const [email, setEmail] = useState('');
    const [statusData, setStatusData] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleCheckStatus = async (e) => {
        e.preventDefault();
        setError('');
        setStatusData(null);
        setLoading(true);
        try {
            const { data } = await api.post('/auth/teacher-status', { email });
            setStatusData(data);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to retrieve application status.');
        } finally {
            setLoading(false);
        }
    };

    const renderStatusUI = () => {
        if (!statusData) return null;

        const { status, message, redirect } = statusData;

        return (
            <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className={`p-8 rounded-[2rem] border backdrop-blur-xl ${
                    status === 'Approved' ? 'bg-emerald-500/10 border-emerald-500/20' :
                    status === 'Rejected' ? 'bg-rose-500/10 border-rose-500/20' :
                    'bg-amber-500/10 border-amber-500/20'
                }`}>
                    <div className="flex flex-col items-center text-center gap-4">
                        <div className={`p-4 rounded-2xl ${
                            status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400' :
                            status === 'Rejected' ? 'bg-rose-500/20 text-rose-400' :
                            'bg-amber-500/20 text-amber-400'
                        }`}>
                            {status === 'Approved' ? <CheckCircle2 size={40} /> :
                             status === 'Rejected' ? <XCircle size={40} /> :
                             <Clock size={40} className="animate-pulse" />}
                        </div>
                        
                        <div>
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2">
                                {status === 'Pending' ? 'In Review' : `Application ${status}`}
                            </h3>
                            <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-xs">
                                {message}
                            </p>
                        </div>
                    </div>

                    {status === 'Approved' && (
                        <Button 
                            onClick={() => navigate(redirect || '/create-password', { state: { email, role: 'teacher', userId: statusData.userId, mobile: statusData.mobile } })}
                            className="w-full mt-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)] group"
                        >
                            <span className="uppercase font-black tracking-widest text-xs flex items-center justify-center gap-2">
                                Create My Password <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </span>
                        </Button>
                    )}
                </div>

                <button 
                    onClick={() => setStatusData(null)}
                    className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                >
                    Check another email
                </button>
            </div>
        );
    };

    return (
        <AuthLayout
            title="Application Tracker"
            subtitle="Monitor your institutional onboarding status"
            roleIcon={Search}
            iconColor="amber"
            backgroundImage="/assets/auth/staff_bg.png"
        >
            {!statusData ? (
                <form onSubmit={handleCheckStatus} className="space-y-6">
                    <p className="text-xs text-slate-500 font-medium leading-relaxed italic text-center px-4">
                        "Enter the email address used in your application to retrieve your current status."
                    </p>
                    
                    <Input
                        label="Registered Email"
                        type="email"
                        placeholder="e.g. professor@college.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        icon={Search}
                    />

                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-[11px] font-black text-red-400 uppercase tracking-widest text-center">
                            {error}
                        </div>
                    )}

                    <Button type="submit" disabled={loading} className="w-full py-4 rounded-2xl group shadow-2xl">
                        {loading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <span className="uppercase font-black tracking-widest text-xs flex items-center justify-center gap-2">
                                Check Status <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </span>
                        )}
                    </Button>
                </form>
            ) : renderStatusUI()}

            <div className="pt-8 mt-8 border-t border-white/5 space-y-4">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-600 px-2">
                    <Link to="/login/staff" className="hover:text-white transition-colors">Faculty Login</Link>
                    <Link to="/teacher/apply" className="hover:text-white transition-colors">New Application</Link>
                </div>
            </div>
        </AuthLayout>
    );
};

export default TeacherStatus;
