
import React, { useState } from 'react';
import { Page } from '../types';
import { Globe, PlusCircle, Edit } from 'lucide-react';
import Modal from './Modal';
import PageForm from './PageForm';
import { useLanguage } from '../contexts/LanguageContext';

interface PageManagerProps {
    pages: Page[];
    projectId: number;
    selectedPageId?: number | null;
    onPageSelect: (page: Page) => void;
}

const PageManager: React.FC<PageManagerProps> = ({ pages, projectId, selectedPageId, onPageSelect }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPage, setEditingPage] = useState<Page | undefined>();
    const { t } = useLanguage();

    const handleAddClick = () => {
        setEditingPage(undefined);
        setIsModalOpen(true);
    };

    const handleEditClick = (page: Page) => {
        setEditingPage(page);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Globe size={22} className="text-cyan-400" />
                    {t('pageManager.title')}
                </h2>
                <button onClick={handleAddClick} className="flex items-center gap-2 bg-slate-700 text-slate-300 font-semibold px-3 py-1.5 rounded-lg hover:bg-slate-600 hover:text-white transition-colors">
                    <PlusCircle size={18}/>
                    <span>{t('pageManager.addPage')}</span>
                </button>
            </div>
            <div className="flex flex-wrap gap-3">
                {pages.map(page => (
                    <div
                        key={page.id}
                        className={`rounded-lg border-2 flex items-center justify-between group transition-all duration-200 ${
                            selectedPageId === page.id
                            ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-md'
                            : 'bg-slate-700 border-slate-600 hover:border-cyan-500 text-slate-300'
                        }`}
                    >
                        <div
                            onClick={() => onPageSelect(page)}
                            className="p-3 text-start cursor-pointer flex-grow"
                        >
                            <span className="font-semibold block">{page.name}</span>
                            <span className="text-xs text-slate-400 block truncate max-w-60">{page.url}</span>
                        </div>
                        <button 
                            onClick={() => handleEditClick(page)}
                            aria-label={t('pageManager.edit').replace('{pageName}', page.name)}
                            className="p-3 self-stretch border-s-2 border-slate-700/50 group-hover:border-slate-600 text-slate-400 hover:text-white transition-colors"
                        >
                            <Edit size={16} />
                        </button>
                    </div>
                ))}
                 {pages.length === 0 && (
                    <p className="text-slate-400 text-sm w-full text-center py-2">{t('pageManager.noPages')}</p>
                )}
            </div>

            {isModalOpen && (
                <Modal onClose={closeModal}>
                    <PageForm 
                        projectId={projectId} 
                        page={editingPage}
                        onDone={closeModal} 
                    />
                </Modal>
            )}
        </div>
    );
};

export default PageManager;
