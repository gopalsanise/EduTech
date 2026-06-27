import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, ShieldCheck, ArrowRight } from 'lucide-react';
import AuthLayout from '../../layouts/AuthLayout';
import Button from '../../components/ui/Button';
import api from '../../services/api';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');
    
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verify = async () => {
            if (!token) {
                setStatus('error');
                setMessage('Verification token is missing.');
                return;
            }

            try {
                const response = await api.get(`/auth/verify-email/${token}`);
                setStatus('success');
                setMessage(response.data.message);
            } catch (err) {
                setStatus('error');
                setMessage(err.response?.data?.error || 'Verification failed. The link may have expired.');
            }
        };

        verify();
    }, [token]);

    return (
        <AuthLayout 
            title="Email Verification" 
            subtitle="Securing your digital identity" 
            roleIcon={ShieldCheck}
            iconColor={status === 'error' ? 'rose' : 'primary'}
        >
            <div className="text-center space-y-8 py-10">
                {status === 'verifying' && (
                    <div className="space-y-6">
                        <div className="w-20 h-20 bg-primary-500/10 rounded-full flex items-center justify-center mx-auto">
                            <Loader2 className="animate-spin text-primary-500" size={32} />
                        </div>
                        <p className="text-slate-400 text-sm animate-pulse uppercase tracking-widest font-black">Validating Token...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-6">
                        <div className="w-24 h-24 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center mx-auto border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                            <CheckCircle2 className="text-emerald-400" size={48} />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black text-white tracking-tight uppercase">Success!</h2>
                            <p className="text-slate-400 text-sm px-6 leading-relaxed italic">{message}</p>
                        </div>
                        <div className="pt-4">
                            <Link to="/login/staff">
                                <Button className="w-full py-4 rounded-2xl group flex items-center justify-center gap-2 uppercase font-black tracking-widest text-xs">
                                    Continue to Login <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-6">
                        <div className="w-24 h-24 bg-rose-500/10 rounded-[2rem] flex items-center justify-center mx-auto border border-rose-500/20">
                            <XCircle className="text-rose-400" size={48} />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black text-rose-500 tracking-tight uppercase">Verification Failed</h2>
                            <p className="text-slate-400 text-sm px-6 leading-relaxed italic">{message}</p>
                        </div>
                        <div className="pt-4 flex flex-col gap-3">
                            <Link to="/teacher/apply">
                                <Button variant="outline" className="w-full py-4 rounded-2xl uppercase font-black tracking-widest text-xs border-white/5 hover:bg-white/5">
                                    Resubmit Application
                                </Button>
                            </Link>
                             <Link to="/login/staff" className="text-[10px] text-slate-600 font-bold uppercase hover:text-white transition-colors">
                                Back to Portal
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </AuthLayout>
    );
};

export default VerifyEmail;
