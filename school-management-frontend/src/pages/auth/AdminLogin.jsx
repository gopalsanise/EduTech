import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, ShieldCheck, User, KeyRound, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../layouts/AuthLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // We'll pass adminId as the email to the backend as the current login logic uses email
            // In a real scenario, the backend would distinguish based on the input format or a flag
            await login(email, password, null, 'admin');
            navigate('/dashboard');
        } catch (err) {
            setError('Access Denied. Invalid Admin ID or Password.');
        }
    };

    return (
        <AuthLayout
            title="Command Center"
            subtitle="Restricted access for system administrators"
            roleIcon={ShieldCheck}
            iconColor="primary"
            backgroundImage="/assets/auth/admin_bg.png"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                    label="Admin Email"
                    type="email"
                    placeholder="admin@college.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    icon={User}
                />
                <Input
                    label="Secure Password"
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

                {error && <p className="text-sm text-red-500 mt-2">{error}</p>}

                <Button type="submit" className="w-full group">
                    Authorize Entry
                    <LogIn size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
            </form>

            <div className="pt-6 border-t border-white/5 space-y-4">
                <div className="flex justify-between text-xs text-slate-500 px-2">
                    <Link to="/login/student" className="hover:text-slate-300">Student Portal</Link>
                    <Link to="/login/staff" className="hover:text-slate-300">Staff Hub</Link>
                </div>
            </div>
        </AuthLayout>
    );
};

export default AdminLogin;
