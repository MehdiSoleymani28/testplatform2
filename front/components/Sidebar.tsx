import React from 'react';
import { NavLink } from 'react-router-dom';
import { TestTubeDiagonal, BotMessageSquare, BarChart3, Terminal, Settings, Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const { language, setLanguage, t } = useLanguage();

    const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
        `flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium transition-colors ${
        isActive
            ? 'bg-slate-700 text-white'
            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
        }`;
    
    const sidebarContent = (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 text-white font-bold text-xl h-16 px-4 border-b border-slate-700/50 flex-shrink-0">
                <TestTubeDiagonal className="h-7 w-7 text-cyan-400"/>
                <span>{t('sidebar.platformName')}</span>
            </div>
            <nav className="flex-grow p-4 space-y-2">
                <NavLink to="/projects" className={navLinkClasses} onClick={onClose}>
                    <BotMessageSquare className="h-5 w-5" />
                    <span>{t('sidebar.projects')}</span>
                </NavLink>
                <NavLink to="/reports" className={navLinkClasses} onClick={onClose}>
                    <BarChart3 className="h-5 w-5" />
                    <span>{t('sidebar.reports')}</span>
                </NavLink>
                <NavLink to="/integrations" className={navLinkClasses} onClick={onClose}>
                    <Terminal className="h-5 w-5" />
                    <span>{t('sidebar.integrations')}</span>
                </NavLink>
                <NavLink to="/settings" className={navLinkClasses} onClick={onClose}>
                    <Settings className="h-5 w-5" />
                    <span>{t('sidebar.settings')}</span>
                </NavLink>
            </nav>
            <div className="p-4 border-t border-slate-700/50">
                 <label htmlFor="language-select" className="sr-only">{t('sidebar.language')}</label>
                 <div className="relative">
                    <Globe className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                    <select
                        id="language-select"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as 'en' | 'fa')}
                        className="w-full bg-slate-800 border border-slate-600 rounded-lg ps-10 pe-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 outline-none appearance-none"
                    >
                        <option value="en">English</option>
                        <option value="fa">فارسی</option>
                    </select>
                 </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Overlay for mobile */}
            <div
                className={`fixed inset-0 bg-black/60 z-30 md:hidden ${isOpen ? 'block' : 'hidden'}`}
                onClick={onClose}
                aria-hidden="true"
            />
            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 h-full w-64 bg-slate-900 border-r border-slate-700/50 z-40 transition-transform transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
                {sidebarContent}
            </aside>
        </>
    );
};

export default Sidebar;