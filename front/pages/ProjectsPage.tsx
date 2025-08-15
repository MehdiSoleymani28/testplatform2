
import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash2, Clock, FileText, AlertTriangle } from 'lucide-react';
import { useProjects } from '../contexts/ProjectContext';
import { Project } from '../types';
import { Link } from 'react-router-dom';
import Modal from '../components/Modal';
import ProjectForm from '../components/ProjectForm';
import { useSetPageInfo } from '../contexts/PageContext';
import { useLanguage } from '../contexts/LanguageContext';

const ProjectCard: React.FC<{ project: Project; onEdit: () => void; onDelete: () => void; }> = ({ project, onEdit, onDelete }) => {
    const { t } = useLanguage();
    return (
        <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-cyan-500/20 hover:scale-[1.02]">
            <div className="p-6">
                <div className="flex justify-between items-start">
                    <div className="flex-1 overflow-hidden">
                        <h3 className="text-xl font-bold text-white leading-tight">{project.name}</h3>
                        {project.pages.length > 0 && (
                            <a href={project.baseUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-cyan-400 hover:text-cyan-300 truncate transition-colors block">
                                {project.baseUrl}
                            </a>
                        )}
                    </div>
                    <div className="flex items-center gap-2 ms-4">
                        <button onClick={onEdit} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors" aria-label={t('projectsPage.edit')}><Edit size={18} /></button>
                        <button onClick={onDelete} className="p-2 text-slate-400 hover:text-red-500 hover:bg-slate-700 rounded-full transition-colors" aria-label={t('projectsPage.delete')}><Trash2 size={18} /></button>
                    </div>
                </div>
                {project.description && <p className="mt-4 text-slate-400 text-sm">{project.description}</p>}
                <div className="mt-6 border-t border-slate-700 pt-4 flex justify-between items-center text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                        <Clock size={14} />
                        <span>{t('projectsPage.created')}: {new Date(project.createdAt).toLocaleDateString()}</span>
                    </div>
                    <Link to={`/project/${project.id}`} className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-cyan-500 text-slate-300 hover:text-white rounded-full transition-colors">
                        <FileText size={14} />
                        <span>{project.tests.length} {t('projectsPage.tests')}</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

const ProjectsPage: React.FC = () => {
    const { projects, deleteProject, loading, error } = useProjects();
    const { t } = useLanguage();
    const setPageInfo = useSetPageInfo();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | undefined>(undefined);

    const openCreateModal = () => {
        setEditingProject(undefined);
        setIsModalOpen(true);
    };

    useEffect(() => {
      setPageInfo({
        title: t('projectsPage.title'),
        actions: (
            <button onClick={openCreateModal} className="flex items-center gap-2 bg-cyan-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-cyan-600 transition-colors">
                <PlusCircle size={20}/>
                <span className="hidden sm:inline">{t('projectsPage.newProject')}</span>
            </button>
        )
      });
    }, [setPageInfo, t]);

    const openEditModal = (project: Project) => {
        setEditingProject(project);
        setIsModalOpen(true);
    };
    
    const closeModal = () => setIsModalOpen(false);

    const handleDelete = (projectId: number) => {
        if (window.confirm(t('projectsPage.confirmDelete'))) {
            deleteProject(projectId);
        }
    };
    
    if (loading) {
        return <div className="text-center text-slate-400">Loading projects...</div>
    }
    
    if (error) {
        return (
            <div className="bg-red-900/30 border border-red-700 text-red-300 p-6 rounded-lg text-center">
                <AlertTriangle size={32} className="mx-auto mb-3" />
                <h3 className="text-xl font-bold">Failed to load projects</h3>
                <p className="mt-2">{error.message}</p>
            </div>
        );
    }

    return (
        <div>
            {projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map(project => (
                        <ProjectCard key={project.id} project={project} onEdit={() => openEditModal(project)} onDelete={() => handleDelete(project.id)} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 px-6 bg-slate-800 rounded-lg">
                    <h3 className="text-xl font-semibold text-white">{t('projectsPage.noProjectsTitle')}</h3>
                    <p className="text-slate-400 mt-2">{t('projectsPage.noProjectsDescription')}</p>
                    <button onClick={openCreateModal} className="mt-6 flex items-center mx-auto gap-2 bg-cyan-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-cyan-600 transition-colors">
                        <PlusCircle size={20}/>
                        <span>{t('projectsPage.createProject')}</span>
                    </button>
                </div>
            )}

            {isModalOpen && (
                <Modal onClose={closeModal}>
                    <ProjectForm project={editingProject} onDone={closeModal} />
                </Modal>
            )}
        </div>
    );
};

export default ProjectsPage;
