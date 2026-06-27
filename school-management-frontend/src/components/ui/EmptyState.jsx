import React from 'react';
import { Inbox } from 'lucide-react';

const EmptyState = ({ title = 'No records found', description = 'Get started by adding the first entry.', icon: Icon = Inbox, action }) => (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
            <Icon size={28} className="text-slate-600" />
        </div>
        <h3 className="text-white font-semibold text-lg mb-1">{title}</h3>
        <p className="text-slate-500 text-sm max-w-xs">{description}</p>
        {action && <div className="mt-6">{action}</div>}
    </div>
);

export default EmptyState;
