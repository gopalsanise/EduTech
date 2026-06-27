import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Building2, GraduationCap, ArrowRight, Loader2, ClipboardCheck, CheckCircle2, Calendar, BookOpen, Heart, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import api from '../../services/api';

const TeacherApply = () => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        department: '',
        qualification: '',
        education: '',
        fatherName: '',
        motherName: '',
        dob: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/auth/apply-teacher', formData);
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.error || 'Application submission failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <AuthLayout title="Application Submitted" subtitle="Awaiting Administrative Review" roleIcon={ClipboardCheck} iconColor="indigo">
                <div className="text-center space-y-6 py-10">
                    <div className="w-20 h-20 bg-green-500/10 rounded-3xl flex items-center justify-center mx-auto border border-green-500/20">
                        <CheckCircle2 className="text-green-400" size={40} />
                    </div>
                    <div className="space-y-3">
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight">Success!</h2>
                        <p className="text-slate-400 text-sm px-6 leading-relaxed">
                            Your faculty application has been securely submitted. You can check your application status using your email on the tracking portal.
                        </p>
                    </div>
                    <div className="pt-6 flex flex-col gap-3">
                         <Link to="/status/teacher">
                            <Button className="w-full py-4 rounded-2xl text-[10px] uppercase font-black tracking-widest bg-indigo-600">
                                Track Application Status
                            </Button>
                         </Link>
                         <Link to="/login/staff" className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors">
                             Back to Faculty Login
                         </Link>
                    </div>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout 
            title="Faculty Onboarding" 
            subtitle="Join our prestigious academic community" 
            roleIcon={GraduationCap}
            iconColor="indigo"
        >
            <motion.form 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSubmit} 
                className="space-y-5"
            >
                <div className="grid grid-cols-1 gap-4">
                    <Input
                        label="Full Name"
                        type="text"
                        placeholder="Dr. Sarah Johnson"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        icon={User}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="sarah.j@college.edu"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            icon={Mail}
                        />
                        <Input
                            label="Phone Number"
                            type="tel"
                            placeholder="0000000000"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                            required
                            icon={Phone}
                            prefixText="+91"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Department"
                            type="text"
                            placeholder="Computer Science"
                            value={formData.department}
                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                            required
                            icon={Building2}
                        />
                        <Input
                            label="Qualification"
                            type="text"
                            placeholder="Ph.D. / M.Tech"
                            value={formData.qualification}
                            onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                            required
                            icon={GraduationCap}
                        />
                    </div>

                    <Input
                        label="Detailed Education"
                        type="text"
                        placeholder="Graduate from Stanford University, 2018"
                        value={formData.education}
                        onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                        required
                        icon={BookOpen}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Father's Name"
                            type="text"
                            placeholder="John Doe"
                            value={formData.fatherName}
                            onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                            required
                            icon={Users}
                        />
                        <Input
                            label="Mother's Name"
                            type="text"
                            placeholder="Jane Doe"
                            value={formData.motherName}
                            onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                            required
                            icon={Heart}
                        />
                    </div>

                    <Input
                        label="Date of Birth"
                        type="date"
                        value={formData.dob}
                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                        required
                        icon={Calendar}
                    />
                </div>

                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-[10px] font-black text-red-400 uppercase tracking-widest text-center">
                        {error}
                    </div>
                )}

                <Button type="submit" disabled={loading} className="w-full py-4 rounded-2xl group shadow-2xl bg-indigo-600 hover:bg-indigo-500">
                    {loading ? <Loader2 className="animate-spin" size={18} /> : (
                        <div className="flex items-center justify-center gap-2 uppercase font-black tracking-widest text-xs">
                            Submit Application <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    )}
                </Button>
            </motion.form>

            <div className="pt-8 border-t border-white/5 mt-8">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-600 px-2">
                    <Link to="/login/staff" className="hover:text-white transition-colors">Staff Login</Link>
                    <Link to="/status/teacher" className="hover:text-white transition-colors">Track Status</Link>
                </div>
            </div>
        </AuthLayout>
    );
};

export default TeacherApply;
