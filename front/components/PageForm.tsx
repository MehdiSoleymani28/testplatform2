
import React, { useState } from 'react';
import { useProjects } from '../contexts/ProjectContext';
import { Page } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface PageFormProps {
  projectId: number;
  page?: Page;
  onDone: () => void;
}

const PageForm: React.FC<PageFormProps> = ({ projectId, page, onDone }) => {
  const { addPageToProject, updatePageInProject } = useProjects();
  const { t } = useLanguage();
  const [name, setName] = useState(page?.name || '');
  const [url, setUrl] = useState(page?.url || '');
  const [requirements, setRequirements] = useState(page?.requirements || '');

  const isEditing = !!page;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;

    if (isEditing) {
        updatePageInProject(projectId, { ...page, name, url, requirements });
    } else {
        addPageToProject(projectId, { name, url, requirements });
    }
    onDone();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-white">{isEditing ? t('pageForm.editTitle') : t('pageForm.createTitle')}</h2>
      
      <div>
        <label htmlFor="pageName" className="block text-sm font-medium text-slate-300 mb-1">{t('pageForm.nameLabel')}</label>
        <input
          type="text"
          id="pageName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
          placeholder={t('pageForm.namePlaceholder')}
        />
      </div>

      <div>
        <label htmlFor="pageUrl" className="block text-sm font-medium text-slate-300 mb-1">{t('pageForm.urlLabel')}</label>
        <input
          type="url"
          id="pageUrl"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
          placeholder={t('pageForm.urlPlaceholder')}
        />
      </div>

      <div>
        <label htmlFor="pageRequirements" className="block text-sm font-medium text-slate-300 mb-1">{t('pageForm.requirementsLabel')}</label>
        <textarea
          id="pageRequirements"
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          rows={5}
          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
          placeholder={t('pageForm.requirementsPlaceholder')}
        />
        <p className="text-xs text-slate-400 mt-1">{t('pageForm.requirementsHelper')}</p>
      </div>


      <div className="flex justify-end gap-4 pt-4">
        <button type="button" onClick={onDone} className="px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-500 text-white font-semibold transition-colors">{t('projectForm.cancel')}</button>
        <button type="submit" className="px-6 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white font-semibold transition-colors">{isEditing ? t('projectForm.saveChanges') : t('pageForm.addPage')}</button>
      </div>
    </form>
  );
};

export default PageForm;
