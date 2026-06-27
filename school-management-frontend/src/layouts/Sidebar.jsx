import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Users, UserCheck, BookOpen,
    Calendar, CheckSquare, ClipboardList, Bell,
    Settings, LogOut, TrendingUp, Clock, FileText, Shield, X, ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../components/ui/Button';
import Branding from '../components/ui/Branding';
import { Sun, Moon } from 'lucide-react';

const menuItems = {
    admin: [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        {
            icon: Users,
            label: 'Students',
            children: [
                { label: 'Add Student', path: '/admin/students/add' },
                { label: 'Student List', path: '/admin/students' },
                { label: 'Branch Management', path: '/admin/branches' },
                { label: 'Semester Management', path: '/admin/semesters' },
            ]
        },
        {
            icon: UserCheck,
            label: 'Teachers',
            children: [
                { label: 'Add Teacher', path: '/admin/staff/add' },
                { label: 'Teacher List', path: '/admin/staff' },
            ]
        },
        {
            icon: CheckSquare,
            label: 'Attendance',
            children: [
                { label: 'Mark Attendance', path: '/admin/attendance/mark' },
                { label: 'View Attendance', path: '/admin/attendance/view' },
                { label: 'Attendance Report', path: '/admin/attendance/reports' },
            ]
        },
        {
            icon: ClipboardList,
            label: 'Performance',
            children: [
                { label: 'Enter Marks', path: '/admin/results/internal' },
                { label: 'Result View', path: '/admin/results' },
                { label: 'Performance Analytics', path: '/admin/results/analytics' },
            ]
        },
        { icon: Settings, label: 'Settings', path: '/admin/settings' },
    ],
    staff: [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: Users, label: 'Students', path: '/staff/students' },
        { icon: CheckSquare, label: 'Attendance', path: '/staff/attendance' },
        { icon: ClipboardList, label: 'Results', path: '/staff/results' },
    ],
    student: [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: CheckSquare, label: 'Attendance', path: '/student/attendance' },
        { icon: ClipboardList, label: 'Results', path: '/student/results' },
    ],
};
menuItems.teacher = menuItems.staff; // Alias for safety

const NavItem = ({ item, close }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const location = useLocation();
    const hasChildren = item.children && item.children.length > 0;

    const isChildActive = (childPath) => {
        if (childPath === '/dashboard') return location.pathname === '/dashboard';
        return location.pathname.startsWith(childPath);
    };

    const isAnyChildActive = hasChildren && item.children.some(child => isChildActive(child.path));

    React.useEffect(() => {
        if (isAnyChildActive) setIsOpen(true);
    }, [isAnyChildActive]);

    if (!hasChildren) {
        return (
            <NavLink
                key={item.label}
                to={item.path}
                end={item.path === '/dashboard'}
                onClick={close}
                className={({ isActive }) => cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all group',
                    isActive
                        ? 'bg-primary-600/20 text-primary-400 border border-primary-600/30 shadow-[0_0_15px_rgba(2,132,199,0.1)]'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                )}
            >
                <item.icon size={18} className={cn('shrink-0 transition-transform group-hover:scale-110', location.pathname === item.path ? 'text-primary-400' : 'text-slate-500')} />
                <span className="truncate tracking-tight">{item.label}</span>
            </NavLink>
        );
    }

    return (
        <div className="space-y-1">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-all',
                    isAnyChildActive ? 'bg-white/5 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                )}
            >
                <div className="flex items-center gap-3">
                    <item.icon size={18} className={cn('shrink-0', isAnyChildActive ? 'text-primary-400' : 'text-slate-500')} />
                    <span className="truncate tracking-tight">{item.label}</span>
                </div>
                <ChevronDown size={14} className={cn('transition-transform duration-300 opacity-50', isOpen && 'rotate-180')} />
            </button>

            {isOpen && (
                <div className="pl-9 pr-2 py-1 space-y-1">
                    {item.children.map((child) => (
                        <NavLink
                            key={child.label}
                            to={child.path}
                            onClick={close}
                            className={({ isActive }) => cn(
                                'block py-2 px-3 text-[11px] font-black uppercase tracking-[0.1em] rounded-lg transition-all',
                                isActive
                                    ? 'text-primary-400 bg-primary-500/10'
                                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                            )}
                        >
                            {child.label}
                        </NavLink>
                    ))}
                </div>
            )}
        </div>
    );
};

const Sidebar = ({ isOpen, setIsOpen }) => {
    const { user, logout } = useAuth();
    const items = menuItems[user?.role] || [];
    const close = () => setIsOpen?.(false);

    const [isLightMode, setIsLightMode] = React.useState(() => {
        return localStorage.getItem('theme') === 'light' || document.documentElement.classList.contains('light');
    });

    React.useEffect(() => {
        if (isLightMode) {
            document.documentElement.classList.add('light');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.classList.remove('light');
            localStorage.setItem('theme', 'dark');
        }
    }, [isLightMode]);

    const toggleTheme = () => setIsLightMode(!isLightMode);

    return (
        <>
            {/* Dark backdrop – mobile only */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
                    onClick={close}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar panel */}
            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-50 flex w-64 flex-col',
                    'bg-slate-950 lg:bg-slate-950/80 backdrop-blur-xl',
                    'border-r border-white/10',
                    'transition-transform duration-300 ease-in-out',
                    'lg:translate-x-0',
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <div className="flex flex-col h-full">
                    {/* Header Branding */}
                    <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center group">
                        <Branding size="sm" showCollegeName={false} className="!items-start" />
                        <button onClick={close} className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin scrollbar-thumb-white/10">
                        {items.map((item) => (
                            <NavItem key={item.label} item={item} close={close} />
                        ))}
                    </nav>

                    {/* User Footer */}
                    <div className="shrink-0 border-t border-white/10 p-4">
                        <div className="flex items-center gap-3 mb-4 p-2.5 bg-white/5 rounded-2xl border border-white/5">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg ring-1 ring-white/10">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-white font-bold text-sm truncate uppercase tracking-tight">{user?.name || 'User'}</p>
                                <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">{user?.role}</p>
                            </div>
                        </div>

                        <NavLink
                            to="/change-password"
                            onClick={close}
                            className="flex items-center justify-center gap-2 w-full mb-3 px-3 py-2.5 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 border border-white/5 rounded-xl transition-all"
                        >
                            <Shield size={16} className="text-primary-400" />
                            <span>Security Pin</span>
                        </NavLink>

                        <div className="grid grid-cols-2 gap-2 mt-4">
                            <button
                                onClick={toggleTheme}
                                className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                            >
                                {isLightMode ? <Moon size={18} /> : <Sun size={18} />}
                                <span>Theme</span>
                            </button>
                            <button
                                onClick={logout}
                                className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-red-400 hover:bg-red-400/10 rounded-xl transition-colors"
                            >
                                <LogOut size={18} className="shrink-0" />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
