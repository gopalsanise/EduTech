import React, { useState } from 'react';
import { Settings, Save, RotateCcw } from 'lucide-react';
import Button from '../../components/ui/Button';
import PageHeader from '../../components/ui/PageHeader';

const TABS = ['General', 'Notifications', 'Security'];

const DEFAULTS = {
    general: {
        adminName: 'MOHINI INGLE',
        role: 'System Admin',
        collegeName: 'Thakur Shivkumar Singh Groups of Institution', // Updated name as per previous request
        address: 'Burhanpur, Madhya Pradesh',
        phone: '+91 00000 00000',
        email: 'admin@tssgi.edu.in',
        website: 'www.tssgi.edu.in',
    },
    notifications: {
        emailOnAdmission: true,
        emailOnExam: true,
        emailOnResult: true,
        smsOnAttendance: false,
        smsOnExam: true,
        smsOnResult: false,
        pushNotifications: true,
    },
    security: {
        passwordMinLength: '8',
        passwordExpiry: '90',
        sessionTimeout: '30',
        mfaEnabled: false,
        loginAttempts: '5',
        lockDuration: '15',
    },
};

const Toggle = ({ value, onChange }) => (
    <button type="button" onClick={() => onChange(!value)}
        className={`w-12 h-6 rounded-full relative transition-colors ${value ? 'bg-primary-600' : 'bg-slate-700'}`}>
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${value ? 'left-6.5 translate-x-0.5' : 'left-0.5'}`} />
    </button>
);

const AdminSettings = () => {
    const [tab, setTab] = useState('General');
    const [config, setConfig] = useState(DEFAULTS);
    const [saved, setSaved] = useState(false);

    const update = (section, key, val) => {
        setConfig(p => ({ ...p, [section]: { ...p[section], [key]: val } }));
        setSaved(false);
    };

    const handleSave = () => setSaved(true);
    const handleReset = () => { setConfig(DEFAULTS); setSaved(false); };

    const fieldClass = "w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none";
    const labelClass = "block text-sm text-slate-400 mb-1.5";

    return (
        <div className="p-4 md:p-6 lg:p-8 min-h-screen">
            <PageHeader title="System Settings" subtitle="Configure system-wide preferences and policies" icon={Settings} />

            <div className="flex gap-2 mb-6 bg-slate-900 p-1 rounded-xl w-fit flex-wrap">
                {TABS.map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                        {t}
                    </button>
                ))}
            </div>

            <div className="glass-card rounded-2xl p-6 max-w-3xl">
                {tab === 'General' && (
                    <div className="space-y-6">
                        <div className="p-4 bg-primary-500/10 border border-primary-500/20 rounded-2xl mb-6 flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center font-black text-white text-xl">MI</div>
                            <div>
                                <h4 className="text-white font-black leading-none">{config.general.adminName}</h4>
                                <p className="text-[10px] text-primary-400 font-bold uppercase tracking-widest mt-1">{config.general.role}</p>
                            </div>
                        </div>

                        <h3 className="text-white font-black text-sm uppercase tracking-widest mb-4">College Information</h3>
                        {[
                            ['adminName', 'Administrator Name'],
                            ['collegeName', 'Institution Name'],
                            ['address', 'Campus Address'],
                            ['phone', 'Primary Contact'],
                            ['email', 'Official Email'],
                            ['website', 'Web Domain'],
                        ].map(([key, label]) => (
                            <div key={key}>
                                <label className={labelClass}>{label}</label>
                                <input value={config.general[key]} onChange={e => update('general', key, e.target.value)} className={fieldClass} />
                            </div>
                        ))}
                    </div>
                )}


                {tab === 'Notifications' && (
                    <div className="space-y-4">
                        <h3 className="text-white font-semibold mb-2">Email Notifications</h3>
                        {[
                            ['emailOnAdmission', 'Send email on new student admission'],
                            ['emailOnExam', 'Send exam schedule notifications via email'],
                            ['emailOnResult', 'Send result notifications via email'],
                        ].map(([key, label]) => (
                            <div key={key} className="flex items-center justify-between py-3 border-b border-white/5">
                                <span className="text-slate-300 text-sm">{label}</span>
                                <Toggle value={config.notifications[key]} onChange={v => update('notifications', key, v)} />
                            </div>
                        ))}
                        <h3 className="text-white font-semibold mt-6 mb-2">SMS Notifications</h3>
                        {[
                            ['smsOnAttendance', 'Send SMS alert on low attendance'],
                            ['smsOnExam', 'Send exam reminders via SMS'],
                            ['smsOnResult', 'Send result SMS to students'],
                        ].map(([key, label]) => (
                            <div key={key} className="flex items-center justify-between py-3 border-b border-white/5">
                                <span className="text-slate-300 text-sm">{label}</span>
                                <Toggle value={config.notifications[key]} onChange={v => update('notifications', key, v)} />
                            </div>
                        ))}
                        <div className="flex items-center justify-between py-3">
                            <span className="text-slate-300 text-sm">Enable push notifications</span>
                            <Toggle value={config.notifications.pushNotifications} onChange={v => update('notifications', 'pushNotifications', v)} />
                        </div>
                    </div>
                )}

                {tab === 'Security' && (
                    <div className="space-y-5">
                        <h3 className="text-white font-semibold mb-4">Security & Authentication</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {[
                                ['passwordMinLength', 'Minimum Password Length'],
                                ['passwordExpiry', 'Password Expiry (days)'],
                                ['sessionTimeout', 'Session Timeout (minutes)'],
                                ['loginAttempts', 'Max Login Attempts'],
                                ['lockDuration', 'Account Lock Duration (minutes)'],
                            ].map(([key, label]) => (
                                <div key={key}>
                                    <label className={labelClass}>{label}</label>
                                    <input type="number" value={config.security[key]} onChange={e => update('security', key, e.target.value)} className={fieldClass} />
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center justify-between py-3 border-t border-white/10 mt-2">
                            <div>
                                <p className="text-slate-300 text-sm font-medium">Multi-Factor Authentication</p>
                                <p className="text-slate-500 text-xs mt-0.5">Require MFA for admin accounts</p>
                            </div>
                            <Toggle value={config.security.mfaEnabled} onChange={v => update('security', 'mfaEnabled', v)} />
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="mt-8 pt-5 border-t border-white/10 flex items-center justify-between">
                    {saved
                        ? <p className="text-green-400 text-sm font-medium flex items-center gap-1.5"><span>✓</span> Settings saved successfully</p>
                        : <span />
                    }
                    <div className="flex gap-3">
                        <Button variant="glass" size="sm" onClick={handleReset}><RotateCcw size={14} className="mr-1.5" /> Reset</Button>
                        <Button size="sm" onClick={handleSave}><Save size={14} className="mr-1.5" /> Save Settings</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
