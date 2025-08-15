
import React from 'react';
import { TestRun, UiTest } from '../types';
import Modal from './Modal';
import { useLanguage } from '../contexts/LanguageContext';

interface AiFixModalProps {
  test: UiTest;
  run: TestRun;
  projectId: string;
  onClose: () => void;
}

const AiFixModal: React.FC<AiFixModalProps> = ({ onClose }) => {
    const { t } = useLanguage();
    return (
        <Modal onClose={onClose}>
            <div className="p-4 text-center">
                <h2 className="text-xl font-bold text-white">{t('aiFixModal.title')}</h2>
                <p className="mt-2 text-slate-400">This feature is currently unavailable.</p>
            </div>
        </Modal>
    );
};

export default AiFixModal;
