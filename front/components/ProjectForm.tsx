
import React, { useState } from 'react';
import { useProjects } from '../contexts/ProjectContext';
import { Project } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface ProjectFormProps {
  project?: Project;
  onDone: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ project, onDone }) => {
  const { addProject, updateProject } = useProjects();
  const { t } = useLanguage();
  const [name, setName] = useState(project?.name || '');
  const [baseUrl, setBaseUrl] = useState(project?.baseUrl || '');
  const [description, setDescription] = useState(project?.description || '');

  const isEditing = !!project;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      const updatedProject = {
          ...project,
          name,
          baseUrl,
          description,
      };
      updateProject(updatedProject);
    } else {
      addProject({ name, baseUrl }, name); // Pass the DTO
    }
    onDone();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-white">{isEditing ? t('projectForm.editTitle') : t('projectForm.createTitle')}</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">{t('projectForm.nameLabel')}</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
              placeholder={t('projectForm.namePlaceholder')}
            />
          </div>
           <div className="sm:col-span-2">
            <label htmlFor="baseUrl" className="block text-sm font-medium text-slate-300 mb-1">{t('projectForm.primaryPageUrlLabel')}</label>
            <input
              type="url"
              id="baseUrl"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              required
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
              placeholder={t('projectForm.urlPlaceholder')}
            />
          </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-1">{t('projectForm.descriptionLabel')}</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
          placeholder={t('projectForm.descriptionPlaceholder')}
        />
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <button type="button" onClick={onDone} className="px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-500 text-white font-semibold transition-colors">{t('projectForm.cancel')}</button>
        <button type="submit" className="px-6 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white font-semibold transition-colors">{isEditing ? t('projectForm.saveChanges') : t('projectForm.createProject')}</button>
      </div>
    </form>
  );
};

export default ProjectForm;
