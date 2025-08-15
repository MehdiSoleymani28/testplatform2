
import React, { useState } from 'react';
import { Test, TestRun, TestType, UiTest, ApiTest } from '../types';
import { Play, Clock, Code, ChevronDown, ChevronUp, History, CheckCircle2, XCircle, MoreHorizontal, Monitor, Server, Archive, Edit } from 'lucide-react';
import { useProjects } from '../contexts/ProjectContext';
import TestRunDetails from './TestRunDetails';
import CodeBlock from './CodeBlock';
import Modal from './Modal';
import { useLanguage } from '../contexts/LanguageContext';

const StatusDisplay: React.FC<{ status: TestRun['status'] }> = ({ status }) => {
    const { t } = useLanguage();
    const STATUS_MAP = {
        Success: { icon: <CheckCircle2 size={16} className="text-green-500" />, text: t('common.status.Success'), color: 'text-green-400' },
        Failure: { icon: <XCircle size={16} className="text-red-500" />, text: t('common.status.Failure'), color: 'text-red-400' },
        Running: { icon: <Clock size={16} className="text-blue-500 animate-spin" />, text: t('common.status.Running'), color: 'text-blue-400' },
        Queued: { icon: <MoreHorizontal size={16} className="text-yellow-500" />, text: t('common.status.Queued'), color: 'text-yellow-400' },
    };
    const { icon, text, color } = STATUS_MAP[status] || STATUS_MAP.Queued;
    return <div className={`flex items-center gap-2 text-sm font-medium ${color}`}>{icon}{text}</div>;
};

const TestEditModal: React.FC<{
    test: Test;
    projectId: number;
    onClose: () => void;
}> = ({ test, projectId, onClose }) => {
    const { t } = useLanguage();
    const { updateTestCode } = useProjects();
    const [code, setCode] = useState(test.code);
    const [reason, setReason] = useState('');

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        updateTestCode(projectId, test.id, code, reason);
        onClose();
    };
    
    return (
        <Modal onClose={onClose}>
            <form onSubmit={handleSave} className="space-y-6">
                <h2 className="text-2xl font-bold text-white">{t('testEditModal.title')}</h2>
                <div>
                    <textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        rows={15}
                        className="w-full font-mono text-xs bg-slate-900 border border-slate-600 rounded-lg p-2 text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                    />
                </div>
                <div>
                    <label htmlFor="edit-reason" className="block text-sm font-medium text-slate-300 mb-1">{t('testEditModal.reasonLabel')}</label>
                    <input
                        id="edit-reason"
                        type="text"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder={t('testEditModal.reasonPlaceholder')}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                    />
                </div>
                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-500 text-white font-semibold transition-colors">{t('projectForm.cancel')}</button>
                    <button type="submit" className="px-6 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white font-semibold transition-colors">{t('testEditModal.saveChanges')}</button>
                </div>
            </form>
        </Modal>
    );
};


const TestListItem: React.FC<{ test: Test; projectId: number }> = ({ test, projectId }) => {
  const { runTest, getProjectById } = useProjects();
  const { t } = useLanguage();
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
  const [isCodeExpanded, setIsCodeExpanded] = useState(false);
  const [isCodeHistoryExpanded, setIsCodeHistoryExpanded] = useState(false);
  const [viewingHistoryCode, setViewingHistoryCode] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const latestRun = test.runs.length > 0 ? test.runs[0] : null;
  const isRunningOrQueued = latestRun?.status === 'Running' || latestRun?.status === 'Queued';

  const handleRunTest = () => {
    runTest(projectId, test.id);
    setIsHistoryExpanded(true); // Automatically open history when a test is run
  };
  
  const renderTestDetails = () => {
    if (test.type === TestType.UI) {
      return <p className="text-sm text-slate-400">{test.framework}</p>;
    } else {
      const apiTest = test as ApiTest;
      const project = getProjectById(projectId);
      const endpoint = project?.apiEndpoints.find(ep => ep.id === apiTest.endpointId);
      
      if (!endpoint) {
          return <p className="text-sm text-red-400">{t('testListItem.errorEndpointNotFound')}</p>
      }

      return (
         <div className="text-sm text-slate-400 font-mono flex items-center gap-2">
            <span className={`px-1.5 py-0.5 text-xs rounded ${
                endpoint.method === 'GET' ? 'bg-sky-500/20 text-sky-400'
              : endpoint.method === 'POST' ? 'bg-green-500/20 text-green-400'
              : endpoint.method === 'PUT' ? 'bg-yellow-500/20 text-yellow-400'
              : 'bg-red-500/20 text-red-400'
            }`}>{endpoint.method}</span>
            <span className="truncate" title={endpoint.url}>{endpoint.url}</span>
         </div>
      );
    }
  };

  return (
    <>
    <div className="bg-slate-800/50 rounded-lg border border-slate-700 transition-all duration-300">
      <div className="p-4">
        <div className="flex justify-between items-start gap-4">
            <div className="flex-1 overflow-hidden">
                <h3 className="font-bold text-white flex items-center gap-2">
                  {test.type === TestType.UI ? <Monitor size={18} className="text-cyan-400"/> : <Server size={18} className="text-cyan-400" />}
                  {test.name}
                </h3>
                {renderTestDetails()}
            </div>
            <div className="flex items-center flex-shrink-0 gap-2">
                <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors"
                    title={t('testListItem.editTest')}
                >
                   <Edit size={14} /> <span>{t('testListItem.editTest')}</span>
                </button>
                <button
                    onClick={() => setIsCodeExpanded(!isCodeExpanded)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors"
                    title={isCodeExpanded ? t('testListItem.hideCode') : t('testListItem.showCode')}
                >
                   <Code size={14} />
                </button>
                <button
                    onClick={handleRunTest}
                    disabled={isRunningOrQueued}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-md bg-cyan-500 hover:bg-cyan-600 text-white transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
                >
                    <Play size={14} /> <span>{t('testListItem.runTest')}</span>
                </button>
            </div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-700/50 flex justify-between items-center">
            <div className="text-xs text-slate-500">
                {t('projectsPage.created')}: {new Date(test.createdAt).toLocaleDateString()}
            </div>
            {latestRun ? (
                <StatusDisplay status={latestRun.status} />
            ) : (
                 <div className="text-sm text-slate-500">{test.status || t('testListItem.notYetRun')}</div>
            )}
        </div>
      </div>
      
      {isCodeExpanded && (
        <div className="px-4 pb-4 animate-fade-in">
            <CodeBlock language="javascript" code={test.code} />
        </div>
      )}
      
      <div className="border-t border-slate-700/50 grid grid-cols-1 sm:grid-cols-2">
        {test.runs.length > 0 && (
          <button onClick={() => setIsHistoryExpanded(!isHistoryExpanded)} className="flex justify-between items-center p-3 text-sm font-semibold text-slate-300 hover:bg-slate-800 transition-colors w-full">
              <div className="flex items-center gap-2">
                  <History size={16} />
                  <span>{t('testListItem.executionHistory').replace('{count}', test.runs.length.toString())}</span>
              </div>
              {isHistoryExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        )}
        {test.codeHistory.length > 0 && (
           <button onClick={() => setIsCodeHistoryExpanded(!isCodeHistoryExpanded)} className={`flex justify-between items-center p-3 text-sm font-semibold text-slate-300 hover:bg-slate-800 transition-colors w-full ${test.runs.length > 0 ? 'sm:border-s' : ''} border-slate-700/50`}>
              <div className="flex items-center gap-2">
                  <Archive size={16} />
                  <span>{t('testListItem.codeHistory').replace('{count}', test.codeHistory.length.toString())}</span>
              </div>
              {isCodeHistoryExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        )}
      </div>

      {isHistoryExpanded && test.runs.length > 0 && (
          <div className="border-t border-slate-700/50 bg-slate-900/50 p-4 space-y-3">
              {test.runs.map(run => <TestRunDetails key={run.id} run={run} test={test} projectId={projectId} />)}
          </div>
      )}
      {isCodeHistoryExpanded && test.codeHistory.length > 0 && (
         <div className="border-t border-slate-700/50 bg-slate-900/50 p-4 space-y-2">
            {test.codeHistory.map(item => (
                <div key={item.timestamp} className="bg-slate-800/50 rounded-lg border border-slate-700">
                    <button 
                        onClick={() => setViewingHistoryCode(viewingHistoryCode === item.timestamp ? null : item.timestamp)}
                        className="w-full p-3 flex justify-between items-center text-start"
                    >
                        <div>
                            <p className="font-semibold text-slate-300">{item.reason}</p>
                            <p className="text-xs text-slate-400">{new Date(item.timestamp).toLocaleString()}</p>
                        </div>
                        <ChevronDown size={16} className={`transition-transform text-slate-400 ${viewingHistoryCode === item.timestamp ? 'rotate-180' : ''}`} />
                    </button>
                    {viewingHistoryCode === item.timestamp && (
                        <div className="p-3 border-t border-slate-700">
                             <CodeBlock code={item.code} language="javascript" />
                        </div>
                    )}
                </div>
            ))}
        </div>
      )}
    </div>
    {isEditModalOpen && <TestEditModal test={test} projectId={projectId} onClose={() => setIsEditModalOpen(false)} />}
    </>
  );
};

export default TestListItem;