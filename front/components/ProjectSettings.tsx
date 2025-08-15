
import React, { useState } from 'react';
import { Project, NotificationSettings } from '../types';
import { useProjects } from '../contexts/ProjectContext';
import { Mail, Webhook, Trash2, Plus, Percent, Eye, KeyRound } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ProjectSettingsProps {
  project: Project;
}

const ToggleSwitch: React.FC<{
    enabled: boolean;
    onChange: (enabled: boolean) => void;
}> = ({ enabled, onChange }) => (
    <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-800 ${
            enabled ? 'bg-cyan-500' : 'bg-slate-600'
        }`}
    >
        <span
            aria-hidden="true"
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                enabled ? 'translate-x-5' : 'translate-x-0'
            }`}
        />
    </button>
);


const ListInput: React.FC<{
    title: string;
    icon: React.ReactNode;
    items: string[];
    setItems: (items: string[]) => void;
    placeholder: string;
    type?: string;
}> = ({ title, icon, items, setItems, placeholder, type = 'text' }) => {
    const [newItem, setNewItem] = useState('');

    const handleAddItem = () => {
        if (newItem.trim() && !items.includes(newItem.trim())) {
            setItems([...items, newItem.trim()]);
            setNewItem('');
        }
    };

    const handleRemoveItem = (itemToRemove: string) => {
        setItems(items.filter(item => item !== itemToRemove));
    };

    return (
        <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-3">
                {icon} {title}
            </h3>
            <div className="flex gap-2 mb-3">
                <input
                    type={type}
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                    placeholder={placeholder}
                    className="flex-grow bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                />
                <button
                    type="button"
                    onClick={handleAddItem}
                    className="p-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
                >
                    <Plus size={20} />
                </button>
            </div>
            <div className="space-y-2">
                {items.length > 0 ? items.map(item => (
                    <div key={item} className="flex items-center justify-between bg-slate-700/50 rounded-md p-2 ps-3 text-sm">
                        <span className="truncate">{item}</span>
                        <button
                            type="button"
                            onClick={() => handleRemoveItem(item)}
                            className="p-1 text-slate-400 hover:text-red-500 rounded-full transition-colors"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                )) : <p className="text-sm text-slate-500 text-center py-2">No items configured.</p>}
            </div>
        </div>
    );
};


const ProjectSettings: React.FC<ProjectSettingsProps> = ({ project }) => {
    const { updateProject } = useProjects();
    const { t } = useLanguage();
    const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(project.notificationSettings);
    const [vrtEnabled, setVrtEnabled] = useState(project.visualRegressionEnabled);
    const [apiAuthKey, setApiAuthKey] = useState(project.apiAuthentication.apiKey);
    const [isSaved, setIsSaved] = useState(false);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const updatedProject: Project = {
            ...project,
            notificationSettings,
            visualRegressionEnabled: vrtEnabled,
            apiAuthentication: { apiKey: apiAuthKey },
        };
        updateProject(updatedProject);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    return (
        <form onSubmit={handleSave} className="max-w-3xl mx-auto space-y-10 bg-slate-800/50 p-6 rounded-lg border border-slate-700 animate-fade-in">
             
            <div className="space-y-8">
                <div>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-3">
                        <Eye size={20} /> {t('projectSettings.vrtTitle')}
                    </h3>
                    <div className="flex items-center justify-between bg-slate-700/30 p-4 rounded-lg">
                        <div>
                            <p className="font-medium text-slate-200">{t('projectSettings.vrtEnable')}</p>
                            <p className="text-xs text-slate-400 max-w-sm">{t('projectSettings.vrtDescription')}</p>
                        </div>
                        <ToggleSwitch enabled={vrtEnabled} onChange={setVrtEnabled} />
                    </div>
                </div>
                 <div>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-3">
                        <KeyRound size={20} /> {t('projectSettings.apiAuthTitle')}
                    </h3>
                     <div className="bg-slate-700/30 p-4 rounded-lg">
                         <label htmlFor="api-auth-key" className="block text-sm font-medium text-slate-300 mb-1">{t('projectSettings.apiAuthKeyLabel')}</label>
                         <input
                            type="password"
                            id="api-auth-key"
                            value={apiAuthKey}
                            onChange={(e) => setApiAuthKey(e.target.value)}
                            placeholder={t('projectSettings.apiAuthKeyPlaceholder')}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                        />
                         <p className="text-xs text-slate-400 mt-2">{t('projectSettings.apiAuthDescription')}</p>
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                <ListInput
                    title={t('projectSettings.emailRecipientsTitle')}
                    icon={<Mail size={20} />}
                    items={notificationSettings.emails}
                    setItems={(emails) => setNotificationSettings(s => ({...s, emails}))}
                    placeholder={t('projectSettings.emailPlaceholder')}
                    type="email"
                />

                <ListInput
                    title={t('projectSettings.webhookUrlsTitle')}
                    icon={<Webhook size={20} />}
                    items={notificationSettings.webhooks}
                    setItems={(webhooks) => setNotificationSettings(s => ({...s, webhooks}))}
                    placeholder={t('projectSettings.webhookPlaceholder')}
                    type="url"
                />
            </div>
            
            <div>
                 <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-3">
                    <Percent size={20} /> {t('projectSettings.failureThresholdTitle')}
                </h3>
                <div className="flex items-center gap-4">
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={notificationSettings.failureThreshold}
                        onChange={(e) => setNotificationSettings(s => ({...s, failureThreshold: parseInt(e.target.value)}))}
                        className="flex-grow h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                    <div className="bg-slate-700 text-white font-mono text-lg rounded-md px-4 py-1 w-24 text-center">
                        {notificationSettings.failureThreshold}%
                    </div>
                </div>
                <p className="text-xs text-slate-400 mt-2">{t('projectSettings.failureThresholdDescription')}</p>
            </div>
            
            <div className="pt-4 border-t border-slate-700 flex justify-end">
                <button 
                    type="submit"
                    className={`px-6 py-2 font-semibold rounded-lg transition-colors ${isSaved ? 'bg-green-600' : 'bg-cyan-500 hover:bg-cyan-600'} text-white`}
                >
                    {isSaved ? t('settingsPage.saved') : t('settingsPage.saveAll')}
                </button>
            </div>

        </form>
    );
};

export default ProjectSettings;
