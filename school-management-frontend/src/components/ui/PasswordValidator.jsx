import React from 'react';
import { Check, X } from 'lucide-react';

export const validatePasswordRules = (password) => {
    return {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#\$%\^&\*\(\),\.\?":\{\}\|<>_]/.test(password),
    };
};

export const isPasswordValid = (password) => {
    if (!password) return false;
    const rules = validatePasswordRules(password);
    return Object.values(rules).every(Boolean);
};

export const PasswordValidator = ({ password }) => {
    if (!password) return null;

    const rules = validatePasswordRules(password);

    const RuleItem = ({ met, text }) => (
        <div className={`flex items-center gap-2 text-xs ${met ? 'text-green-500' : 'text-slate-400'}`}>
            {met ? <Check size={14} className="shrink-0" /> : <X size={14} className="shrink-0 text-slate-500" />}
            <span className={met ? 'opacity-100 font-medium' : 'opacity-80'}>{text}</span>
        </div>
    );

    return (
        <div className="mt-2 p-3 bg-slate-900/50 rounded-xl border border-white/10">
            <p className="text-xs font-semibold text-slate-300 mb-2">Password Requirements:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <RuleItem met={rules.length} text="At least 8 characters" />
                <RuleItem met={rules.uppercase} text="One uppercase letter (A-Z)" />
                <RuleItem met={rules.lowercase} text="One lowercase letter (a-z)" />
                <RuleItem met={rules.number} text="One number (0-9)" />
                <RuleItem met={rules.special} text="One special character (@, #, $ etc.)" />
            </div>
        </div>
    );
};

export default PasswordValidator;
