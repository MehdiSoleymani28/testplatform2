import React from 'react';
import { Menu } from 'lucide-react';
import NotificationBell from './NotificationBell';
import { usePage } from '../contexts/PageContext';

interface HeaderProps {
    onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
    const { title, actions } = usePage();

    return (
        <header className="bg-slate-900/70 backdrop-blur-md border-b border-slate-700/50 sticky top-0 z-20 h-16 flex-shrink-0">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full">
                <div className="flex items-center justify-between h-full">
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={onMenuClick} 
                            className="md:hidden p-2 text-slate-400 hover:text-white"
                            aria-label="Open navigation menu"
                        >
                            <Menu size={24} />
                        </button>
                        <div className="text-xl font-bold text-white truncate flex items-center gap-3">
                            {title}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                        {actions}
                        <div className="border-s border-slate-700/50 h-8 hidden sm:block"></div>
                        <NotificationBell />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;