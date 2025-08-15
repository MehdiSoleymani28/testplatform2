
import React, { useMemo, useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useProjects } from '../contexts/ProjectContext';
import { TestRun, TestType, UiTest, ApiTest, Test, ApiCollection } from '../types';
import { CheckCircle2, XCircle, Clock, MoreHorizontal, Download, ChevronDown, Monitor, Server } from 'lucide-react';
import TestRunDetails from '../components/TestRunDetails';
import { useSetPageInfo } from '../contexts/PageContext';
import { useLanguage } from '../contexts/LanguageContext';

const COLORS = { Success: '#22c55e', Failure: '#ef4444', Running: '#3b82f6', Queued: '#f59e0b' };

interface ReportExecution {
    run: TestRun;
    test: Test;
    projectName: string;
    projectId: number;
    targetName: string;
    targetValue: string;
    collectionId?: string;
    collectionName?: string;
}

const ReportsPage: React.FC = () => {
    const { projects } = useProjects();
    const { t } = useLanguage();
    const setPageInfo = useSetPageInfo();
    const [statusFilter, setStatusFilter] = useState<'All' | TestRun['status']>('All');
    const [projectFilter, setProjectFilter] = useState<string>('All');
    const [typeFilter, setTypeFilter] = useState<'All' | TestType>('All');
    const [collectionFilter, setCollectionFilter] = useState<string>('All');
    const [expandedRunId, setExpandedRunId] = useState<string | null>(null);
    
    const STATUS_ICONS: Record<TestRun['status'], React.ReactNode> = {
      Success: <CheckCircle2 className="text-green-500" size={20} />,
      Failure: <XCircle className="text-red-500" size={20} />,
      Running: <Clock className="text-blue-500 animate-spin" size={20} />,
      Queued: <MoreHorizontal className="text-yellow-500" size={20} />,
    };

    useEffect(() => {
        setPageInfo({ title: t('reportsPage.title') });
    }, [setPageInfo, t]);

    const allExecutions: ReportExecution[] = useMemo(() => {
        return projects.flatMap(proj => 
            proj.tests.flatMap(test => {
                let targetName = 'N/A';
                let targetValue = 'N/A';
                let collectionId: string | undefined = undefined;
                let collectionName: string | undefined = undefined;


                if (test.type === TestType.UI) {
                    const uiTest = test as UiTest;
                    const page = proj.pages.find(p => p.id === uiTest.pageId);
                    targetName = page?.name || 'Unknown Page';
                    targetValue = page?.url || 'N/A';
                } else {
                    const apiTest = test as ApiTest;
                    const endpoint = proj.apiEndpoints.find(e => e.id === apiTest.endpointId);
                    targetName = endpoint?.name || 'Unknown Endpoint';
                    targetValue = endpoint ? `${endpoint.method} ${endpoint.url}` : 'N/A';
                    if (endpoint?.collectionId) {
                        collectionId = endpoint.collectionId.toString();
                        collectionName = proj.apiCollections.find(c => c.id === endpoint.collectionId)?.name;
                    }
                }

                return test.runs.map(run => ({
                    run,
                    test,
                    projectName: proj.name,
                    projectId: proj.id,
                    targetName,
                    targetValue,
                    collectionId,
                    collectionName
                }))
            })
        ).sort((a, b) => new Date(b.run.startedAt || 0).getTime() - new Date(a.run.startedAt || 0).getTime());
    }, [projects]);
    
    const statusCounts = useMemo(() => {
        return allExecutions.reduce((acc, curr) => {
            acc[curr.run.status] = (acc[curr.run.status] || 0) + 1;
            return acc;
        }, {} as Record<TestRun['status'], number>);
    }, [allExecutions]);

    const pieData = [
        { name: t('common.status.Success'), value: statusCounts.Success || 0, key: 'Success' },
        { name: t('common.status.Failure'), value: statusCounts.Failure || 0, key: 'Failure' },
        { name: t('common.status.Running'), value: statusCounts.Running || 0, key: 'Running' },
        { name: t('common.status.Queued'), value: statusCounts.Queued || 0, key: 'Queued' },
    ].filter(d => d.value > 0);
    
    const apiCollections: ApiCollection[] = useMemo(() => {
        const collectionsMap = new Map<number, ApiCollection>();
        projects.forEach(p => {
            if (projectFilter === 'All' || p.id === parseInt(projectFilter)) {
                p.apiCollections.forEach(c => {
                    if (!collectionsMap.has(c.id)) {
                        collectionsMap.set(c.id, c);
                    }
                });
            }
        });
        return Array.from(collectionsMap.values()).sort((a,b) => a.name.localeCompare(b.name));
    }, [projects, projectFilter]);
    
    useEffect(() => {
        // Reset collection filter if project changes and the selected collection doesn't exist in the new project scope
        if (collectionFilter !== 'All' && !apiCollections.some(c => c.id.toString() === collectionFilter)) {
            setCollectionFilter('All');
        }
    }, [projectFilter, apiCollections, collectionFilter]);


    const filteredExecutions = useMemo(() => {
        return allExecutions.filter(exec => {
            const statusMatch = statusFilter === 'All' || exec.run.status === statusFilter;
            const projectMatch = projectFilter === 'All' || exec.projectId.toString() === projectFilter;
            const typeMatch = typeFilter === 'All' || exec.test.type === typeFilter;
            const collectionMatch = collectionFilter === 'All' || exec.collectionId === collectionFilter;
            return statusMatch && projectMatch && typeMatch && (typeFilter !== TestType.API || collectionMatch);
        });
    }, [allExecutions, statusFilter, projectFilter, typeFilter, collectionFilter]);
    
    const executionsByProject = useMemo(() => {
        return projects.map(proj => ({
            name: proj.name,
            [t('common.status.Success')]: proj.tests.flatMap(t => t.runs).filter(r => r.status === 'Success').length,
            [t('common.status.Failure')]: proj.tests.flatMap(t => t.runs).filter(r => r.status === 'Failure').length,
        }));
    }, [projects, t]);

    const handleExportCsv = () => {
        const headers = "Status,Test Type,Test Name,Project,API Collection,Target,Date,Duration\n";
        const rows = filteredExecutions.map(exec => 
            [
                exec.run.status,
                exec.test.type,
                `"${exec.test.name.replace(/"/g, '""')}"`,
                `"${exec.projectName.replace(/"/g, '""')}"`,
                `"${(exec.collectionName || '').replace(/"/g, '""')}"`,
                `"${exec.targetName.replace(/"/g, '""')}"`,
                exec.run.startedAt ? new Date(exec.run.startedAt).toLocaleString() : 'N/A',
                exec.run.duration || 'N/A'
            ].join(',')
        ).join('\n');
        
        const csvContent = headers + rows;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `test-report-${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const toggleExpand = (runId: string) => {
        setExpandedRunId(prev => (prev === runId ? null : runId));
    };

    const filterButtons = [
        { key: 'All', label: t('reportsPage.allTypes')},
        { key: 'Success', label: t('common.status.Success')},
        { key: 'Failure', label: t('common.status.Failure')},
        { key: 'Running', label: t('common.status.Running')},
        { key: 'Queued', label: t('common.status.Queued')},
    ]

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                    <h2 className="text-xl font-semibold text-white mb-4">{t('reportsPage.byProject')}</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={executionsByProject} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tick={{ fill: '#9ca3af' }} />
                            <YAxis stroke="#9ca3af" fontSize={12} tick={{ fill: '#9ca3af' }} />
                            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '0.5rem' }} cursor={{fill: 'rgba(100, 116, 139, 0.1)'}} />
                            <Legend />
                            <Bar dataKey={t('common.status.Success')} stackId="a" fill={COLORS.Success} name={t('common.status.Success')} />
                            <Bar dataKey={t('common.status.Failure')} stackId="a" fill={COLORS.Failure} name={t('common.status.Failure')} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                    <h2 className="text-xl font-semibold text-white mb-4">{t('reportsPage.overallStatus')}</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={pieData} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                {pieData.map((entry) => <Cell key={`cell-${entry.key}`} fill={COLORS[entry.key as keyof typeof COLORS]} />)}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '0.5rem' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-slate-800/50 rounded-lg border border-slate-700">
                 <div className="p-4 flex flex-wrap gap-4 justify-between items-center border-b border-slate-700">
                     <h2 className="text-xl font-semibold text-white">{t('reportsPage.allExecutions')}</h2>
                     <div className="flex flex-wrap items-center gap-4">
                        <div className="relative">
                           <select onChange={(e) => setProjectFilter(e.target.value)} value={projectFilter} className="appearance-none bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-semibold rounded-full px-4 py-2 pe-8 transition-colors cursor-pointer focus:ring-2 focus:ring-cyan-500 outline-none">
                               <option value="All">{t('reportsPage.allProjects')}</option>
                               {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                           </select>
                           <ChevronDown size={16} className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
                        </div>
                         <div className="relative">
                           <select onChange={(e) => setTypeFilter(e.target.value as 'All' | TestType)} value={typeFilter} className="appearance-none bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-semibold rounded-full px-4 py-2 pe-8 transition-colors cursor-pointer focus:ring-2 focus:ring-cyan-500 outline-none">
                               <option value="All">{t('reportsPage.allTypes')}</option>
                               <option value={TestType.UI}>{t('reportsPage.uiTests')}</option>
                               <option value={TestType.API}>{t('reportsPage.apiTests')}</option>
                           </select>
                           <ChevronDown size={16} className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
                        </div>
                        {typeFilter === TestType.API && (
                            <div className="relative">
                               <select onChange={(e) => setCollectionFilter(e.target.value)} value={collectionFilter} className="appearance-none bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-semibold rounded-full px-4 py-2 pe-8 transition-colors cursor-pointer focus:ring-2 focus:ring-cyan-500 outline-none">
                                   <option value="All">{t('reportsPage.allCollections')}</option>
                                   {apiCollections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                               </select>
                               <ChevronDown size={16} className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
                            </div>
                        )}
                        <div className="flex items-center gap-2 bg-slate-700/50 rounded-full p-1">
                            {filterButtons.map(f => (
                                <button key={f.key} onClick={() => setStatusFilter(f.key as TestRun['status'] | 'All')} className={`px-3 py-1 text-sm rounded-full transition-colors ${statusFilter === f.key ? 'bg-cyan-500 text-white shadow' : 'hover:bg-slate-600 text-slate-300'}`}>
                                    {f.label}
                                </button>
                            ))}
                        </div>
                        <button onClick={handleExportCsv} className="flex items-center gap-2 text-sm px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold text-slate-200 transition-colors">
                            <Download size={16}/>
                            {t('reportsPage.exportCsv')}
                        </button>
                    </div>
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-start text-slate-400">
                        <thead className="text-xs text-slate-300 uppercase bg-slate-800">
                            <tr>
                                <th scope="col" className="px-6 py-3 w-1"></th>
                                <th scope="col" className="px-6 py-3">{t('reportsPage.status')}</th>
                                <th scope="col" className="px-6 py-3">{t('reportsPage.type')}</th>
                                <th scope="col" className="px-6 py-3">{t('reportsPage.testName')}</th>
                                <th scope="col" className="px-6 py-3">{t('reportsPage.project')}</th>
                                <th scope="col" className="px-6 py-3">{t('reportsPage.target')}</th>
                                <th scope="col" className="px-6 py-3">{t('reportsPage.date')}</th>
                                <th scope="col" className="px-6 py-3">{t('reportsPage.duration')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredExecutions.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-12 text-slate-500">
                                        {t('reportsPage.noExecutions')}
                                    </td>
                                </tr>
                            ) : filteredExecutions.map(({run, test, projectName, projectId, targetName}) => (
                                <React.Fragment key={run.id}>
                                    <tr onClick={() => toggleExpand(run.id)} className="border-b border-slate-700 hover:bg-slate-800 cursor-pointer">
                                        <td className="px-6 py-4">
                                            <ChevronDown size={16} className={`transition-transform ${expandedRunId === run.id ? 'rotate-180' : ''}`} />
                                        </td>
                                        <td className="px-6 py-4"><div className="flex items-center gap-2">{STATUS_ICONS[run.status]} {t(`common.status.${run.status}`)}</div></td>
                                        <td className="px-6 py-4"><div className="flex items-center gap-2">{test.type === TestType.UI ? <Monitor size={16}/> : <Server size={16} />} {test.type}</div></td>
                                        <td className="px-6 py-4 font-medium text-white">{test.name}</td>
                                        <td className="px-6 py-4">{projectName}</td>
                                        <td className="px-6 py-4 truncate max-w-xs" title={targetName}>{targetName}</td>
                                        <td className="px-6 py-4">{run.startedAt ? new Date(run.startedAt).toLocaleString() : 'N/A'}</td>
                                        <td className="px-6 py-4">{run.duration || 'N/A'}</td>
                                    </tr>
                                    {expandedRunId === run.id && (
                                        <tr className="bg-slate-900/50">
                                            <td colSpan={8} className="p-0">
                                                <div className="p-4">
                                                  <TestRunDetails run={run} test={test} projectId={projectId} />
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                 </div>
            </div>
        </div>
    );
};

export default ReportsPage;
