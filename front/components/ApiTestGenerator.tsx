

import React, { useState, useRef, useMemo } from 'react';
import { Project, ApiEndpoint, ApiCollection, TestType, ApiTest, ApiFramework } from '../types';
import { HTTP_METHODS } from '../constants';
import { FlaskConical, PlusCircle, Upload, Play, Edit, Trash2, ChevronDown, Folder, FolderPlus, FolderKanban, Bot } from 'lucide-react';
import { useProjects } from '../contexts/ProjectContext';
import Modal from './Modal';
import aiService from '../services/aiService';
import CodeBlock from './CodeBlock';
import { useLanguage } from '../contexts/LanguageContext';

// --- SUB-COMPONENTS (to avoid creating new files) ---

const ApiCollectionForm: React.FC<{
  projectId: number;
  collection?: ApiCollection;
  onDone: () => void;
}> = ({ projectId, collection, onDone }) => {
    const { addApiCollection, updateApiCollection } = useProjects();
    const { t } = useLanguage();
    const [name, setName] = useState(collection?.name || '');
    const isEditing = !!collection;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        if (isEditing) {
            updateApiCollection(projectId, { ...collection!, name });
        } else {
            addApiCollection(projectId, name);
        }
        onDone();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-2xl font-bold text-white">{isEditing ? t('apiCollectionForm.editTitle') : t('apiCollectionForm.createTitle')}</h2>
            <div>
                <label htmlFor="coll-name" className="block text-sm font-medium text-slate-300 mb-1">{t('apiCollectionForm.nameLabel')}</label>
                <input type="text" id="coll-name" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 outline-none" />
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onDone} className="px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-500 text-white font-semibold transition-colors">{t('projectForm.cancel')}</button>
                <button type="submit" className="px-6 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white font-semibold transition-colors">{isEditing ? t('projectForm.saveChanges') : t('apiCollectionForm.addButton')}</button>
            </div>
        </form>
    );
};

const ApiEndpointForm: React.FC<{
  projectId: number;
  endpoint?: ApiEndpoint;
  collections: ApiCollection[];
  onDone: () => void;
}> = ({ projectId, endpoint, collections, onDone }) => {
  const { addApiEndpoint, updateApiEndpoint } = useProjects();
  const { t } = useLanguage();
  const [name, setName] = useState(endpoint?.name || '');
  const [url, setUrl] = useState(endpoint?.url || '');
  const [method, setMethod] = useState<ApiEndpoint['method']>(endpoint?.method || 'GET');
  const [headers, setHeaders] = useState(endpoint?.headers || '{\n  "Content-Type": "application/json"\n}');
  const [bodySchema, setBodySchema] = useState(endpoint?.bodySchema || '{\n  "type": "object",\n  "properties": {\n    "id": { "type": "string" }\n  }\n}');
  const [collectionId, setCollectionId] = useState(endpoint?.collectionId || '');
  const [requirements, setRequirements] = useState(endpoint?.requirements || '');

  const isEditing = !!endpoint;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;

    const endpointData = { name, url, method, headers, bodySchema, collectionId: collectionId ? Number(collectionId) : undefined, requirements };

    if (isEditing) {
      updateApiEndpoint(projectId, { ...endpoint!, ...endpointData });
    } else {
      addApiEndpoint(projectId, endpointData);
    }
    onDone();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-white">{isEditing ? t('apiEndpointForm.editTitle') : t('apiEndpointForm.createTitle')}</h2>
      
       <div>
            <label htmlFor="ep-collection" className="block text-sm font-medium text-slate-300 mb-1">{t('apiEndpointForm.collectionLabel')}</label>
            <select id="ep-collection" value={collectionId} onChange={e => setCollectionId(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 outline-none">
                <option value="">{t('apiEndpointForm.noCollection')}</option>
                {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
            <label htmlFor="ep-name" className="block text-sm font-medium text-slate-300 mb-1">{t('apiEndpointForm.nameLabel')}</label>
            <input type="text" id="ep-name" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 outline-none" placeholder={t('apiEndpointForm.namePlaceholder')} />
        </div>
        <div>
            <label htmlFor="ep-method" className="block text-sm font-medium text-slate-300 mb-1">{t('apiEndpointForm.methodLabel')}</label>
            <select id="ep-method" value={method} onChange={e => setMethod(e.target.value as ApiEndpoint['method'])} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 outline-none">
                {HTTP_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
        </div>
      </div>
      <div>
        <label htmlFor="ep-url" className="block text-sm font-medium text-slate-300 mb-1">{t('apiEndpointForm.urlLabel')}</label>
        <input type="text" id="ep-url" value={url} onChange={e => setUrl(e.target.value)} required className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 outline-none" placeholder={t('apiEndpointForm.urlPlaceholder')} />
      </div>
      <div>
        <label htmlFor="ep-requirements" className="block text-sm font-medium text-slate-300 mb-1">{t('apiEndpointForm.requirementsLabel')}</label>
        <textarea
          id="ep-requirements"
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          rows={4}
          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
          placeholder={t('apiEndpointForm.requirementsPlaceholder')}
        />
        <p className="text-xs text-slate-400 mt-1">{t('apiEndpointForm.requirementsHelper')}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="ep-headers" className="block text-sm font-medium text-slate-300 mb-1">{t('apiEndpointForm.headersLabel')}</label>
          <textarea id="ep-headers" value={headers} onChange={e => setHeaders(e.target.value)} rows={8} className="w-full font-mono text-xs bg-slate-900 border border-slate-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-cyan-500 outline-none" />
        </div>
        <div>
          <label htmlFor="ep-body-schema" className="block text-sm font-medium text-slate-300 mb-1">{t('apiEndpointForm.bodySchemaLabel')}</label>
          <textarea id="ep-body-schema" value={bodySchema} onChange={e => setBodySchema(e.target.value)} rows={8} className="w-full font-mono text-xs bg-slate-900 border border-slate-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-cyan-500 outline-none" />
        </div>
      </div>
      <div className="flex justify-end gap-4 pt-4">
        <button type="button" onClick={onDone} className="px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-500 text-white font-semibold transition-colors">{t('projectForm.cancel')}</button>
        <button type="submit" className="px-6 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white font-semibold transition-colors">{isEditing ? t('projectForm.saveChanges') : t('apiEndpointForm.addButton')}</button>
      </div>
    </form>
  );
};

const EndpointRow: React.FC<{
    endpoint: ApiEndpoint,
    project: Project,
    onEdit: () => void,
    onGenerate: () => void,
    isGenerating: boolean,
}> = ({ endpoint, project, onEdit, onGenerate, isGenerating }) => {
    const { deleteApiEndpoint, runTest } = useProjects();
    const { t } = useLanguage();

    const associatedTest = useMemo(() => {
        return project.tests.find(t => t.type === TestType.API && (t as ApiTest).endpointId === endpoint.id);
    }, [project.tests, endpoint.id]);


    return (
        <div className="bg-slate-800/70 rounded-lg border border-slate-700">
            <div className="p-3 flex items-center gap-3">
                <span className={`flex-shrink-0 px-2 py-0.5 text-xs font-bold rounded ${ endpoint.method === 'GET' ? 'bg-sky-500/20 text-sky-400' : endpoint.method === 'POST' ? 'bg-green-500/20 text-green-400' : endpoint.method === 'PUT' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400' }`}>{endpoint.method}</span>
                <div className="flex-grow overflow-hidden">
                    <p className="font-semibold text-white truncate">{endpoint.name}</p>
                    <p className="text-sm text-slate-400 font-mono truncate">{endpoint.url}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button onClick={onEdit} className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-700"><Edit size={16}/></button>
                    <button onClick={() => window.confirm(t('apiEndpointManager.deleteConfirm').replace('{endpointName}', endpoint.name)) && deleteApiEndpoint(project.id, endpoint.id)} className="p-2 text-slate-400 hover:text-red-400 rounded-full hover:bg-slate-700"><Trash2 size={16}/></button>
                    {associatedTest ? (
                        <button onClick={() => runTest(project.id, associatedTest.id)} className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 bg-cyan-600 text-white rounded-md hover:bg-cyan-500">
                            <Play size={14}/> {t('apiEndpointManager.runTestButton')}
                        </button>
                    ) : (
                        <button onClick={onGenerate} disabled={isGenerating} className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-500 disabled:bg-slate-600 disabled:cursor-not-allowed">
                            {isGenerating ? <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : <Bot size={14}/>}
                            {isGenerating ? t('apiTestGenerator.generatingTest') : t('apiTestGenerator.generateTest')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// --- MAIN COMPONENT ---

interface ApiTestGeneratorProps {
  project: Project;
}

const ApiTestGenerator: React.FC<ApiTestGeneratorProps> = ({ project }) => {
  const { deleteApiCollection, importApiEndpointsFromOpenApi, addTestToProject, runApiCollectionTests } = useProjects();
  const { t } = useLanguage();
  
  const [isEpFormModalOpen, setEpFormModalOpen] = useState(false);
  const [editingEndpoint, setEditingEndpoint] = useState<ApiEndpoint | undefined>();
  const [isCollFormModalOpen, setCollFormModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<ApiCollection | undefined>();
  const [isGenTestModalOpen, setIsGenTestModalOpen] = useState(false);
  const [generatingEndpoint, setGeneratingEndpoint] = useState<ApiEndpoint | null>(null);
  const [generatedApiTest, setGeneratedApiTest] = useState<{name: string, code: string} | null>(null);
  const [isGeneratingTestId, setIsGeneratingTestId] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const endpointsByCollection = useMemo(() => {
    const grouped = new Map<number | string, ApiEndpoint[]>();
    project.apiEndpoints.forEach(endpoint => {
        const collectionId = endpoint.collectionId || 'uncategorized';
        if (!grouped.has(collectionId)) {
            grouped.set(collectionId, []);
        }
        grouped.get(collectionId)!.push(endpoint);
    });
    return grouped;
  }, [project.apiEndpoints]);

  const sortedCollections = useMemo(() => {
    return [...project.apiCollections].sort((a,b) => a.name.localeCompare(b.name));
  }, [project.apiCollections]);

  const handleOpenFileChooser = () => fileInputRef.current?.click();
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        const content = e.target?.result as string;
        importApiEndpointsFromOpenApi(project.id, content);
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset file input
  };
  
  const handleGenerateTestClick = async (endpoint: ApiEndpoint) => {
    setIsGeneratingTestId(endpoint.id);
    setGeneratingEndpoint(endpoint);
    try {
        const script = await aiService.generateApiTestScript(endpoint, project);
        setGeneratedApiTest({
            name: `Test for ${endpoint.name}`,
            code: script
        });
        setIsGenTestModalOpen(true);
    } catch(e) {
        console.error("Failed to generate API test", e);
        // Maybe show a toast notification here
    } finally {
        setIsGeneratingTestId(null);
    }
  };

  const handleSaveApiTest = async () => {
    if (!generatedApiTest || !generatingEndpoint) return;
    await addTestToProject(project.id, {
        type: TestType.API,
        name: generatedApiTest.name,
        framework: ApiFramework.Jest, // Hardcoded for now
        code: generatedApiTest.code,
        endpointId: generatingEndpoint.id
    });
    setIsGenTestModalOpen(false);
    setGeneratedApiTest(null);
    setGeneratingEndpoint(null);
  };

  const CollectionGroup: React.FC<{collection?: ApiCollection}> = ({ collection }) => {
      const collectionId = collection ? collection.id : 'uncategorized';
      const endpoints = endpointsByCollection.get(collectionId) || [];
      const [isExpanded, setIsExpanded] = useState(true);
      
      if (endpoints.length === 0 && !collection) return null; // Don't show uncategorized if empty

      const title = collection ? collection.name : t('apiEndpointManager.uncategorized');
      const Icon = collection ? FolderKanban : Folder;
      
      const testsInCollection = useMemo(() => {
          const endpointIds = endpoints.map(e => e.id);
          return project.tests.filter(t => t.type === TestType.API && endpointIds.includes((t as ApiTest).endpointId));
      }, [endpoints, project.tests]);

      const handleRunAll = () => {
          if (collection) {
              runApiCollectionTests(project.id, collection.id);
          }
      };

      return (
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                  <button onClick={() => setIsExpanded(!isExpanded)} className="p-1 text-slate-400 hover:text-white">
                      <ChevronDown size={20} className={`transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`} />
                  </button>
                  <Icon size={22} className="text-cyan-400" />
                  <h3 className="text-xl font-bold text-white flex-grow">{title}</h3>
                  {collection && (
                      <div className="flex items-center gap-2">
                           <button onClick={handleRunAll} disabled={testsInCollection.length === 0} className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 bg-slate-700 text-slate-300 rounded-md hover:bg-cyan-500 hover:text-white disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed">
                            <Play size={14}/> {t('apiTestGenerator.runAllInCollection')}
                          </button>
                          <button onClick={() => { setEditingCollection(collection); setCollFormModalOpen(true); }} className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-700"><Edit size={16}/></button>
                          <button onClick={() => window.confirm(t('apiEndpointManager.deleteCollectionConfirm').replace('{collectionName}', collection.name)) && deleteApiCollection(project.id, collection.id)} className="p-2 text-slate-400 hover:text-red-400 rounded-full hover:bg-slate-700"><Trash2 size={16}/></button>
                      </div>
                  )}
              </div>
              {isExpanded && (
                  <div className="space-y-2 ps-6 animate-fade-in-fast">
                      {endpoints.map(endpoint => (
                          <EndpointRow 
                            key={endpoint.id}
                            endpoint={endpoint}
                            project={project}
                            onEdit={() => { setEditingEndpoint(endpoint); setEpFormModalOpen(true); }}
                            onGenerate={() => handleGenerateTestClick(endpoint)}
                            isGenerating={isGeneratingTestId === endpoint.id}
                          />
                      ))}
                      {endpoints.length === 0 && collection && <p className="text-sm text-slate-500 text-center py-4">This collection is empty.</p>}
                  </div>
              )}
          </div>
      )
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
            <h2 className="text-2xl font-bold text-white">{t('apiEndpointManager.title')}</h2>
            <div className="flex items-center gap-2">
                <input type="file" ref={fileInputRef} onChange={handleFileImport} accept=".json, .yaml, .yml" className="hidden" />
                <button onClick={handleOpenFileChooser} className="flex items-center gap-2 text-sm bg-slate-700 text-slate-300 font-semibold px-3 py-1.5 rounded-lg hover:bg-slate-600 hover:text-white transition-colors">
                    <Upload size={16} /> {t('apiEndpointManager.importButton')}
                </button>
                 <button onClick={() => { setEditingCollection(undefined); setCollFormModalOpen(true); }} className="flex items-center gap-2 text-sm bg-slate-700 text-slate-300 font-semibold px-3 py-1.5 rounded-lg hover:bg-slate-600 hover:text-white transition-colors">
                    <FolderPlus size={16}/> {t('apiEndpointManager.addCollection')}
                </button>
                <button onClick={() => { setEditingEndpoint(undefined); setEpFormModalOpen(true); }} className="flex items-center gap-2 text-sm bg-cyan-500 text-white font-semibold px-3 py-1.5 rounded-lg hover:bg-cyan-600 transition-colors">
                    <PlusCircle size={16}/> {t('apiEndpointManager.addButton')}
                </button>
            </div>
        </div>
        
        <div className="space-y-4">
            {sortedCollections.map(collection => <CollectionGroup key={collection.id} collection={collection} />)}
            <CollectionGroup />

            {project.apiEndpoints.length === 0 && (
                <div className="text-center py-16 px-6 bg-slate-800/50 rounded-lg border border-slate-700">
                     <h3 className="text-xl font-semibold text-white">{t('apiEndpointManager.noEndpoints')}</h3>
                     <p className="text-slate-400 mt-2">Add an endpoint manually or import from an OpenAPI file.</p>
                </div>
            )}
        </div>
      </div>

      {isEpFormModalOpen && (
        <Modal onClose={() => setEpFormModalOpen(false)}>
            <ApiEndpointForm 
              projectId={project.id} 
              endpoint={editingEndpoint} 
              collections={project.apiCollections}
              onDone={() => setEpFormModalOpen(false)} 
            />
        </Modal>
      )}

       {isCollFormModalOpen && (
        <Modal onClose={() => setCollFormModalOpen(false)}>
            <ApiCollectionForm 
                projectId={project.id}
                collection={editingCollection}
                onDone={() => setCollFormModalOpen(false)}
            />
        </Modal>
      )}
      
      {isGenTestModalOpen && generatedApiTest && (
          <Modal onClose={() => setIsGenTestModalOpen(false)}>
              <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white">{t('apiTestGenerator.saveGeneratedApiTestTitle')}</h2>
                  <div>
                      <label htmlFor="gen-api-test-name" className="block text-sm font-medium text-slate-300 mb-1">{t('uiTestGenerator.testName')}</label>
                      <input
                          id="gen-api-test-name"
                          type="text"
                          value={generatedApiTest.name}
                          onChange={(e) => setGeneratedApiTest(prev => prev ? {...prev, name: e.target.value} : null)}
                          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                      />
                  </div>
                  <CodeBlock language="javascript" code={generatedApiTest.code} />
                   <div className="flex justify-end gap-4 pt-4">
                      <button type="button" onClick={() => setIsGenTestModalOpen(false)} className="px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-500 text-white font-semibold transition-colors">{t('projectForm.cancel')}</button>
                      <button type="button" onClick={handleSaveApiTest} className="px-6 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white font-semibold transition-colors">{t('apiTestGenerator.save')}</button>
                  </div>
              </div>
          </Modal>
      )}
    </>
  );
};

export default ApiTestGenerator;