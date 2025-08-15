
import React, { useState } from 'react';
import { Test, TestRun, TestType, UiTest } from '../types';
import { CheckCircle2, XCircle, Clock, MoreHorizontal, ChevronDown, ChevronUp, Image as ImageIcon, Terminal, Eye, TrendingUp } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const StatusIcon: React.FC<{ status: TestRun['status'] }> = ({ status }) => {
    if (status === 'Success') return <CheckCircle2 className="text-green-500 flex-shrink-0" size={20} />;
    if (status === 'Failure') return <XCircle className="text-red-500 flex-shrink-0" size={20} />;
    if (status === 'Running') return <Clock className="text-blue-500 animate-spin flex-shrink-0" size={20} />;
    return <MoreHorizontal className="text-yellow-500 flex-shrink-0" size={20} />;
};

const TestRunDetails: React.FC<{ run: TestRun; test: Test, projectId: number }> = ({ run, test }) => {
    const [isExpanded, setIsExpanded] = useState(run.status === 'Running' || run.status === 'Queued' || run.status === 'Failure');
    const { t } = useLanguage();
    
    const uiTest = test.type === TestType.UI ? test as UiTest : null;
    const isVisualFailure = run.status === 'Failure' && !!run.diffScreenshotUrl && uiTest?.baselineScreenshotUrl;

    return (
        <div className="bg-slate-800 rounded-lg border border-slate-700 animate-fade-in">
            <button onClick={() => setIsExpanded(!isExpanded)} className="w-full p-3 flex items-center gap-4 text-start">
                <StatusIcon status={run.status} />
                <div className="flex-grow">
                    <p className="font-semibold text-white">{t(`common.status.${run.status}`)}</p>
                    <p className="text-xs text-slate-400">
                        {run.startedAt ? new Date(run.startedAt).toLocaleString() : t('testRunDetails.pending')}
                        {run.duration && ` • ${t('testRunDetails.duration').replace('{duration}', run.duration)}`}
                    </p>
                </div>
                <div className="text-slate-400">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
            </button>
            {isExpanded && (
                <div className="border-t border-slate-700 p-4 space-y-4">
                    {run.logs.length > 0 && (
                        <div>
                            <h4 className="font-semibold text-sm text-slate-300 flex items-center gap-2 mb-2"><Terminal size={16}/> {t('testRunDetails.logs')}</h4>
                            <div className="bg-slate-900 rounded-md p-3 max-h-60 overflow-y-auto">
                                {run.logs.map((log, index) => (
                                    <div key={index} className="font-mono text-xs text-slate-400 flex gap-4">
                                    <span className="text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                    <span className={log.message.toLowerCase().includes('error') || log.message.toLowerCase().includes('failed') ? 'text-red-400' : ''}>{log.message}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {test.type === TestType.UI && run.performanceMetrics && (
                        <div>
                            <h4 className="font-semibold text-sm text-slate-300 flex items-center gap-2 mb-2"><TrendingUp size={16}/> {t('testRunDetails.performanceMetrics')}</h4>
                            <div className="grid grid-cols-3 gap-4 text-center bg-slate-900 rounded-md p-3">
                                <div>
                                    <p className="text-xs text-slate-400">{t('testRunDetails.loadTime')}</p>
                                    <p className="text-lg font-bold text-white">{run.performanceMetrics.loadTime.toFixed(0)}ms</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400">{t('testRunDetails.fcp')}</p>
                                    <p className="text-lg font-bold text-white">{run.performanceMetrics.fcp.toFixed(0)}ms</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400">{t('testRunDetails.lcp')}</p>
                                    <p className="text-lg font-bold text-white">{run.performanceMetrics.lcp.toFixed(0)}ms</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {run.status === 'Failure' && (
                        <div className="pt-2 space-y-4">
                            {isVisualFailure ? (
                                <div>
                                    <h4 className="font-semibold text-sm text-red-400 flex items-center gap-2 mb-2"><Eye size={16}/> {t('testRunDetails.visualReport')}</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <p className="text-center font-semibold text-sm text-slate-300">{t('testRunDetails.baseline')}</p>
                                            <img src={uiTest.baselineScreenshotUrl} alt="Baseline screenshot" className="w-full h-auto rounded-md border-2 border-slate-600" />
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-center font-semibold text-sm text-slate-300">{t('testRunDetails.current')}</p>
                                            <img src={run.screenshotUrl} alt="Current failure screenshot" className="w-full h-auto rounded-md border-2 border-red-500" />
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-center font-semibold text-sm text-slate-300">{t('testRunDetails.difference')}</p>
                                            <img src={run.diffScreenshotUrl} alt="Difference screenshot" className="w-full h-auto rounded-md border-2 border-yellow-500" />
                                        </div>
                                    </div>
                                </div>
                            ) : run.screenshotUrl && (
                                    <div>
                                    <h4 className="font-semibold text-sm text-slate-300 flex items-center gap-2 mb-2"><ImageIcon size={16}/> {t('testRunDetails.failureScreenshot')}</h4>
                                    <div className="border border-red-700/50 rounded-md overflow-hidden">
                                        <img src={run.screenshotUrl} alt="Test failure screenshot" className="w-full h-auto" />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
};

export default TestRunDetails;
