
import React, { useState, useEffect } from 'react';
import { Project, UiFramework, DomStructure, Page, TestType, DomElement } from '../types';
import { UI_FRAMEWORKS } from '../constants';
import { ScanLine, FlaskConical, Check, Info, FileCode2, AlertTriangle, Save } from 'lucide-react';
import aiService from '../services/aiService';
import CodeBlock from './CodeBlock';
import { useProjects } from '../contexts/ProjectContext';
import { useLanguage } from '../contexts/LanguageContext';

interface UiTestGeneratorProps {
  project: Project;
  selectedPage: Page | null;
}

const UiTestGenerator: React.FC<UiTestGeneratorProps> = ({ project, selectedPage }) => {
  const { addTestToProject } = useProjects();
  const { t } = useLanguage();
  const [scanUrl, setScanUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [scanResult, setScanResult] = useState<DomStructure | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedFramework, setSelectedFramework] = useState<UiFramework>(UiFramework.Playwright);
  const [generatedTests, setGeneratedTests] = useState<{name: string, code: string, isSaved: boolean}[]>([]);
  
  useEffect(() => {
    setScanUrl(selectedPage?.url || '');
    setIsScanning(false);
    setScanResult(null);
    setError(null);
    setGeneratedTests([]);
    setIsGenerating(false);
  }, [selectedPage]);


  const handleScanUrl = async () => {
    if (!scanUrl) {
      setError('Please provide the URL of the page to scan.');
      return;
    }
     if (!scanUrl.startsWith('http')) {
      setError('Please enter a valid, full URL (including http:// or https://).');
      return;
    }
    
    setIsScanning(true);
    setError(null);
    setScanResult(null);
    setGeneratedTests([]);

    try {
      const result = await aiService.generateDomJsonFromUrl(scanUrl);
      setScanResult(result);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'Failed to scan the URL. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleGenerateTests = async () => {
    if (!scanResult || !scanResult.elements || !selectedPage) {
        setError('Please scan a page successfully before generating tests.');
        return;
    }
    setIsGenerating(true);
    setError(null);

    try {
      const results = await aiService.generateTestScript(scanResult.elements, selectedFramework);
      
      const newTests = results.map((script, index) => ({
        name: `Generated Test ${index + 1} for ${selectedPage.name}`,
        code: script,
        isSaved: false
      }));
      setGeneratedTests(newTests);

    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'Failed to generate the test script. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveTest = async (testIndex: number) => {
    if (!selectedPage) return;
    const testToSave = generatedTests[testIndex];
    
    await addTestToProject(project.id, {
        type: TestType.UI,
        name: testToSave.name,
        framework: selectedFramework,
        code: testToSave.code,
        pageId: selectedPage.id
    });
    
    setGeneratedTests(prev => {
        const newTests = [...prev];
        newTests[testIndex].isSaved = true;
        return newTests;
    });
  };

  const handleTestNameChange = (index: number, newName: string) => {
    setGeneratedTests(prev => {
        const newTests = [...prev];
        newTests[index].name = newName;
        return newTests;
    });
  };
  
  if (!selectedPage) {
    return (
        <div className="bg-slate-800/50 p-8 rounded-lg border border-slate-700 text-center text-slate-400">
            <Info size={32} className="mx-auto mb-4 text-slate-500" />
            <h2 className="text-xl font-bold text-white">{t('uiTestGenerator.selectPage')}</h2>
            <p className="mt-1">{t('uiTestGenerator.selectPageDescription')}</p>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
            <span className="text-cyan-400 font-black">1.</span> {t('uiTestGenerator.step1').replace('{pageName}', '')} <span className="text-cyan-400">{selectedPage.name}</span>
        </h2>
        <p className="text-sm text-slate-400 mb-4">{t('uiTestGenerator.scanInstruction')}</p>
        
        <div className="flex flex-col sm:flex-row gap-4">
            <input
                id="scan-url"
                type="url"
                value={scanUrl}
                onChange={(e) => setScanUrl(e.target.value)}
                placeholder={t('pageForm.urlPlaceholder')}
                required
                className="flex-grow bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
            />
            <button
                onClick={handleScanUrl}
                disabled={isScanning || !scanUrl}
                className="w-full sm:w-auto flex justify-center items-center gap-2 bg-cyan-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-cyan-600 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
            >
                {isScanning ? <><div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div><span>{t('uiTestGenerator.scanningButton')}</span></> : <><ScanLine size={20}/><span>{t('uiTestGenerator.scanButton')}</span></>}
            </button>
        </div>
      </div>
      
      {error && <div className="p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg">{error}</div>}

      {scanResult?.accessibilityIssues?.length > 0 && (
          <div className="bg-yellow-900/40 p-6 rounded-lg border border-yellow-700 animate-fade-in space-y-4">
              <h2 className="text-xl font-bold text-yellow-300 flex items-center gap-2">
                  <AlertTriangle size={22} /> {t('uiTestGenerator.accessibilityResults')}
              </h2>
              <p className="text-sm text-yellow-400">
                  {t('uiTestGenerator.accessibilityDescription')}
              </p>
              <div className="space-y-3 max-h-60 overflow-y-auto pe-2">
                  {scanResult.accessibilityIssues.map((issue, index) => (
                      <div key={index} className="bg-slate-800/50 p-3 rounded-md border border-slate-700">
                          <p className={`font-semibold ${issue.severity === 'Critical' || issue.severity === 'Serious' ? 'text-red-400' : 'text-yellow-400'}`}>
                              {issue.severity}: {issue.message}
                          </p>
                          <p className="text-sm text-slate-400 mt-1">
                              Element: <code className="bg-slate-900 px-1 py-0.5 rounded-sm font-mono text-xs">{issue.elementSelector}</code>
                          </p>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {scanResult && (
        <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 animate-fade-in">
           <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4"><span className="text-cyan-400 font-black">2.</span> {t('uiTestGenerator.step3Intent')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
                <h3 className="font-semibold text-white mb-2">{t('uiTestGenerator.selectFramework')}</h3>
                <div className="space-y-2">
                    {UI_FRAMEWORKS.map(fw => (
                        <button key={fw} onClick={() => setSelectedFramework(fw)} className={`w-full text-start p-3 rounded-lg border-2 transition-colors flex items-center justify-between ${selectedFramework === fw ? 'bg-cyan-500/20 border-cyan-500 text-white' : 'bg-slate-700 border-slate-600 hover:border-slate-500 text-slate-300'}`}>
                            <span>{fw}</span>
                            {selectedFramework === fw && <Check size={18}/>}
                        </button>
                    ))}
                </div>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-lg">
                <h3 className="font-semibold text-white mb-2">Scanned Elements</h3>
                <p className="text-xs text-slate-400 mb-3">The backend will generate tests based on these interactive elements found on the page.</p>
                <div className="max-h-60 overflow-y-auto space-y-2 text-sm pe-2">
                    {scanResult.elements.filter(e => e.actionability !== 'Static').map((el, i) => (
                        <div key={i} className="p-2 bg-slate-800 rounded-md truncate">
                           <span className="font-mono text-cyan-400 text-xs">{el.type}</span>
                           <span className="text-slate-300 ms-2">{el.id ? `#${el.id}` : el.text ? `"${el.text}"` : `.${el.class || ''}`}</span>
                        </div>
                    ))}
                </div>
            </div>
          </div>
          <div className="mt-6 text-center">
            <button onClick={handleGenerateTests} disabled={isGenerating || !scanResult.elements} className="w-full sm:w-auto flex justify-center items-center gap-2 bg-green-500 text-white font-semibold px-6 py-3 rounded-lg hover:bg-green-600 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed">
              {isGenerating ? <><div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div><span>{t('uiTestGenerator.generatingButton')}</span></> : <><FlaskConical size={20}/><span>{t('uiTestGenerator.generateIntentButton')}</span></>}
            </button>
          </div>
        </div>
      )}

      {generatedTests.length > 0 && (
         <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 animate-fade-in">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4"><span className="text-cyan-400 font-black">3.</span> {t('uiTestGenerator.step4')}</h2>
          <div className="space-y-4">
            {generatedTests.map((test, index) => (
              <div key={index} className="bg-slate-900/50 p-4 rounded-lg">
                <div className="flex flex-col sm:flex-row gap-4 mb-3">
                    <div className="flex-grow">
                        <label htmlFor={`test-name-${index}`} className="block text-sm font-medium text-slate-300 mb-1">{t('uiTestGenerator.testName')}</label>
                        <input
                            id={`test-name-${index}`}
                            type="text"
                            value={test.name}
                            onChange={(e) => handleTestNameChange(index, e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                            disabled={test.isSaved}
                        />
                    </div>
                    <div className="self-end">
                        <button
                            onClick={() => handleSaveTest(index)}
                            disabled={test.isSaved}
                            className="w-full sm:w-auto flex justify-center items-center gap-2 bg-cyan-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-cyan-600 transition-colors disabled:bg-green-700 disabled:cursor-not-allowed"
                        >
                            {test.isSaved ? <><Check size={20}/><span>{t('uiTestGenerator.saved')}</span></> : <><Save size={20}/><span>{t('uiTestGenerator.saveTest')}</span></>}
                        </button>
                    </div>
                </div>
                <CodeBlock language="javascript" code={test.code} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UiTestGenerator;