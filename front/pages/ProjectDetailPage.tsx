
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProjects } from '../contexts/ProjectContext';
import UiTestGenerator from '../components/UiTestGenerator';
import ApiTestGenerator from '../components/ApiTestGenerator';
import { ArrowLeft, FileText, Clock, Settings, Monitor, Server, Info, Play } from 'lucide-react';
import TestListItem from '../components/TestListItem';
import ProjectSettings from '../components/ProjectSettings';
import { Page, TestType, UiTest } from '../types';
import PageManager from '../components/PageManager';
import { useSetPageInfo } from '../contexts/PageContext';
import { useLanguage } from '../contexts/LanguageContext';

const ProjectDetailPage: React.FC = () => {
  const { projectId: projectIdStr } = useParams<{ projectId: string }>();
  const projectId = projectIdStr ? parseInt(projectIdStr, 10) : undefined;
  const { getProjectById, loading, runTests } = useProjects();
  const { t, dir } = useLanguage();
  const setPageInfo = useSetPageInfo();
  const [activeTab, setActiveTab] = useState<'uiTests' | 'apiTests' | 'settings'>('uiTests');
  
  const project = useMemo(() => projectId ? getProjectById(projectId) : undefined, [projectId, getProjectById]);
  
  useEffect(() => {
    if (project) {
      setPageInfo({
        title: (
          <div className="flex items-center gap-3">
            <Link to="/projects" className="p-1 rounded-full text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
              <ArrowLeft size={20} className={dir === 'rtl' ? 'transform scale-x-[-1]' : ''} />
            </Link>
            <span className="truncate">{project.name}</span>
          </div>
        )
      });
    } else if (!loading) {
      setPageInfo({ title: t('projectDetailPage.notFound') });
    }
  }, [project, loading, setPageInfo, t, dir]);

  const [selectedPage, setSelectedPage] = useState<Page | null>(null);

  useEffect(() => {
    if (project && project.pages.length > 0 && !selectedPage) {
        setSelectedPage(project.pages[0]);
    }
  }, [project, selectedPage]);


  const uiTests = useMemo(() => project?.tests.filter((t): t is UiTest => t.type === TestType.UI) || [], [project]);
  const apiTests = useMemo(() => project?.tests.filter(t => t.type === TestType.API) || [], [project]);

  if (loading) {
      return <div className="text-center">Loading Project...</div>
  }
  
  if (!projectId) {
    return <div className="text-center text-red-500">Project ID is missing.</div>;
  }

  if (!project) {
    return <div className="text-center">{t('projectDetailPage.notFound')} <Link to="/projects" className="text-cyan-400 hover:underline">{t('projectDetailPage.goBack')}</Link></div>;
  }

  const handlePageSelect = (page: Page) => {
    setSelectedPage(page);
  };

  const testsForSelectedPage = uiTests.filter(t => !selectedPage || t.pageId === selectedPage.id);
  
  const handleRunAllPageTests = () => {
    if (!project) return;
    const testIds = testsForSelectedPage.map(t => t.id);
    if (testIds.length > 0) {
        runTests(project.id, testIds);
    }
  };


  const TabButton: React.FC<{
    tabName: 'uiTests' | 'apiTests' | 'settings';
    children: React.ReactNode;
  }> = ({ tabName, children }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
        activeTab === tabName
          ? 'text-cyan-400 border-cyan-400'
          : 'text-slate-400 border-transparent hover:text-white'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="space-y-8">
      <div>
        <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
          <h2 className="text-2xl font-bold text-white">{project.name}</h2>
          {project.description && <p className="text-slate-400 mt-2">{project.description}</p>}
           <div className="mt-4 border-t border-slate-700 pt-4 flex items-center gap-6 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                    <Clock size={14} />
                    <span>{t('projectsPage.created')}: {new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                    <FileText size={14} />
                    <span>{project.tests.length} {t('projectDetailPage.totalTests')}</span>
                </div>
            </div>
        </div>
      </div>
      
      <div className="border-b border-slate-700">
        <nav className="-mb-px flex gap-2" aria-label="Tabs">
          <TabButton tabName="uiTests"><Monitor size={16} /> {t('projectDetailPage.uiTestsTab')}</TabButton>
          <TabButton tabName="apiTests"><Server size={16} /> {t('projectDetailPage.apiTestsTab')}</TabButton>
          <TabButton tabName="settings"><Settings size={16} /> {t('projectDetailPage.settingsTab')}</TabButton>
        </nav>
      </div>

      {activeTab === 'uiTests' && (
        <div className="space-y-10 animate-fade-in">
          <PageManager 
            pages={project.pages}
            projectId={project.id}
            selectedPageId={selectedPage?.id}
            onPageSelect={handlePageSelect}
          />
          <UiTestGenerator project={project} selectedPage={selectedPage} />

          <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">{t('projectDetailPage.generatedUiTestsTitle')}</h2>
                 <button 
                    onClick={handleRunAllPageTests} 
                    disabled={testsForSelectedPage.length === 0}
                    className="flex items-center gap-2 bg-slate-700 text-slate-300 font-semibold px-3 py-1.5 rounded-lg hover:bg-cyan-500 hover:text-white transition-colors disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed"
                >
                    <Play size={16}/>
                    <span>{t('projectDetailPage.runAllButton')}</span>
                </button>
            </div>
            <div className="space-y-4">
              {testsForSelectedPage.length > 0 ? (
                testsForSelectedPage.map(test => (
                  <TestListItem key={test.id} test={test} projectId={project.id} />
                ))
              ) : (
                <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-8 text-center text-slate-400">
                    {selectedPage ? (
                      <>
                        <FileText size={40} className="mx-auto text-slate-500 mb-4" />
                        <h3 className="text-lg font-semibold text-white">{t('projectDetailPage.noUiTestsTitle')}</h3>
                        <p className="text-sm mt-1">{t('projectDetailPage.noUiTestsDescription').replace('{pageName}', selectedPage.name)}</p>
                      </>
                    ) : (
                       <>
                        <Info size={40} className="mx-auto text-slate-500 mb-4" />
                        <h3 className="text-lg font-semibold text-white">{t('projectDetailPage.noPageSelectedTitle')}</h3>
                        <p className="text-sm mt-1">{t('projectDetailPage.noPageSelectedDescription')}</p>
                       </>
                    )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'apiTests' && (
        <div className="space-y-10 animate-fade-in">
          <ApiTestGenerator project={project} />

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">{t('projectDetailPage.generatedApiTestsTitle')}</h2>
            <div className="space-y-4">
              {apiTests.length > 0 ? (
                apiTests.map(test => (
                  <TestListItem key={test.id} test={test} projectId={project.id} />
                ))
              ) : (
                <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-8 text-center text-slate-400">
                    <FileText size={40} className="mx-auto text-slate-500 mb-4" />
                    <h3 className="text-lg font-semibold text-white">{t('projectDetailPage.noApiTestsTitle')}</h3>
                    <p className="text-sm mt-1">{t('projectDetailPage.noApiTestsDescription')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <ProjectSettings project={project} />
      )}
    </div>
  );
};

export default ProjectDetailPage;