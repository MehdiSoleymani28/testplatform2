
import React, { useState, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { SystemSettings } from '../types';
import { SlidersHorizontal, AlertTriangle, CheckCircle, Eye, EyeOff, Terminal, RefreshCw, Copy } from 'lucide-react';
import { useSetPageInfo } from '../contexts/PageContext';
import { useLanguage } from '../contexts/LanguageContext';


const PlatformApiKeyManager: React.FC = () => {
    const { settings, regeneratePlatformApiKey } = useSettings();
    const { t } = useLanguage();
    const [isVisible, setIsVisible] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    const handleRegenerate = () => {
        if (window.confirm(t('settingsPage.confirmRegenerate'))) {
            regeneratePlatformApiKey();
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(settings.platformApiKey);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <label htmlFor="platform-api-key" className="text-sm font-medium text-slate-300">{t('settingsPage.platformApiKeyLabel')}</label>
                 <p className="text-xs text-slate-400">{t('settingsPage.platformApiHelper')}</p>
            </div>
            <div className="flex gap-2">
                <div className="relative flex-grow">
                    <input
                        id="platform-api-key"
                        type={isVisible ? 'text' : 'password'}
                        readOnly
                        value={settings.platformApiKey}
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg ps-3 pe-20 py-2 text-slate-300 font-mono"
                    />
                    <div className="absolute inset-y-0 end-0 flex items-center">
                        <button type="button" onClick={() => setIsVisible(!isVisible)} className="px-3 text-slate-400 hover:text-white">
                            {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button type="button" onClick={handleCopy} className="px-3 text-slate-400 hover:text-white">
                           {isCopied ? <CheckCircle size={16} className="text-green-400" /> : <Copy size={16} />}
                        </button>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={handleRegenerate}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-600 text-white font-semibold rounded-lg hover:bg-red-600 hover:border-red-500 border-2 border-transparent transition-colors"
                    title={t('settingsPage.regenerate')}
                >
                    <RefreshCw size={16} />
                    <span>{t('settingsPage.regenerate')}</span>
                </button>
            </div>
        </div>
    )
}

const SettingsPage: React.FC = () => {
    const { settings, updateSettings } = useSettings();
    const { t } = useLanguage();
    const setPageInfo = useSetPageInfo();
    const [localSettings, setLocalSettings] = useState<SystemSettings>(settings);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        setPageInfo({ title: t('settingsPage.title') });
    }, [setPageInfo, t]);

    useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        updateSettings(localSettings);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2500);
    };

    const handleSettingChange = (key: keyof SystemSettings, value: string | number) => {
        setLocalSettings(prev => ({...prev, [key]: value }));
    };

    return (
        <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSave} className="space-y-10">
                 <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 space-y-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-slate-700 pb-3">
                       <Terminal size={22} className="text-cyan-400"/> {t('settingsPage.platformTitle')}
                    </h2>
                    <PlatformApiKeyManager />
                </div>

                <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 space-y-8">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-slate-700 pb-3">
                       {t('settingsPage.aiProviderTitle')}
                    </h2>
                    
                    <div className="bg-slate-700/50 p-4 rounded-lg flex gap-3 text-slate-400">
                       <AlertTriangle size={24} className="flex-shrink-0 mt-1 text-slate-500" />
                       <div>
                         <h4 className="font-bold text-slate-300">Backend Configuration</h4>
                         <p className="text-sm">The management of AI provider API keys (like Gemini or OpenAI) is now handled by the backend server. Configure your keys there. The frontend no longer stores or validates these keys.</p>
                       </div>
                    </div>
                </div>
                
                <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 space-y-4">
                     <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-slate-700 pb-3">
                       <SlidersHorizontal size={22} className="text-cyan-400"/> {t('settingsPage.systemConfigTitle')}
                    </h2>

                    <div>
                         <label htmlFor="max-concurrent-tests" className="text-lg font-semibold text-white mb-3 block">{t('settingsPage.maxConcurrentTestsLabel')}</label>
                        <div className="flex items-center gap-4">
                            <input
                                id="max-concurrent-tests"
                                type="range"
                                min="1"
                                max="10"
                                value={localSettings.maxConcurrentTests}
                                onChange={(e) => handleSettingChange('maxConcurrentTests', parseInt(e.target.value))}
                                className="flex-grow h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                            />
                            <div className="bg-slate-700 text-white font-mono text-lg rounded-md px-4 py-1 w-20 text-center">
                                {localSettings.maxConcurrentTests}
                            </div>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">{t('settingsPage.maxConcurrentTestsHelper')}</p>
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <button 
                        type="submit"
                        className={`px-8 py-2 font-semibold rounded-lg transition-colors w-48 text-center ${isSaved ? 'bg-green-600' : 'bg-cyan-500 hover:bg-cyan-600'} text-white`}
                    >
                        {isSaved ? t('settingsPage.saved') : t('settingsPage.saveAll')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SettingsPage;
