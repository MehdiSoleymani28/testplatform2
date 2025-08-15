
import React, { useState, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import CodeBlock from '../components/CodeBlock';
import { KeyRound, BookOpen, Terminal, Share2, Copy, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSetPageInfo } from '../contexts/PageContext';
import { useLanguage } from '../contexts/LanguageContext';

const githubActionsExample = `
name: AI Test Platform Integration

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  trigger-tests:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger UI Test
        run: |
          curl -X POST 'https://YOUR_APP_DOMAIN/api/v1/projects/1/tests/101/run' \\
          -H "Authorization: Bearer \${{ secrets.AITP_API_KEY }}" \\
          -H "Content-Type: application/json"
          
      - name: Trigger API Test
        run: |
          curl -X POST 'https://YOUR_APP_DOMAIN/api/v1/projects/1/tests/202/run' \\
          -H "Authorization: Bearer \${{ secrets.AITP_API_KEY }}" \\
          -H "Content-Type: application/json"
`;

const gitlabCiExample = `
stages:
  - test

trigger-aitp-tests:
  stage: test
  image: curlimages/curl:latest
  script:
    - |
      echo "Triggering UI Test"
      curl -X POST "https://YOUR_APP_DOMAIN/api/v1/projects/1/tests/101/run" \\
      --header "Authorization: Bearer $AITP_API_KEY" \\
      --header "Content-Type: application/json"
    - |
      echo "Triggering API Test"
      curl -X POST "https://YOUR_APP_DOMAIN/api/v1/projects/1/tests/202/run" \\
      --header "Authorization: Bearer $AITP_API_KEY" \\
      --header "Content-Type: application/json"
  rules:
    - if: '$CI_PIPELINE_SOURCE == "push" && $CI_COMMIT_BRANCH == "main"'
`;

const jenkinsExample = `
pipeline {
    agent any
    environment {
        AITP_API_KEY = credentials('aitp-api-key-credential-id')
    }
    stages {
        stage('Trigger AI Platform Tests') {
            steps {
                script {
                    sh '''
                    echo "Triggering UI Test..."
                    curl -X POST "https://YOUR_APP_DOMAIN/api/v1/projects/1/tests/101/run" \\
                    -H "Authorization: Bearer $AITP_API_KEY"
                    '''
                    
                    sh '''
                    echo "Triggering API Test..."
                    curl -X POST "https://YOUR_APP_DOMAIN/api/v1/projects/1/tests/202/run" \\
                    -H "Authorization: Bearer $AITP_API_KEY"
                    '''
                }
            }
        }
    }
}
`;

const cliExample = `
# 1. Configure the CLI with your API Key (only needs to be done once)
$ aitp-cli configure --api-key <YOUR_PLATFORM_API_KEY>

# 2. List all projects to find project IDs
$ aitp-cli projects list

# 3. List tests within a specific project to find test IDs
$ aitp-cli tests list --project-id 1

# 4. Trigger a specific test run and get the run ID
$ aitp-cli run --project-id 1 --test-id 101
> Test run queued successfully. Run ID: run-1678886400000

# 5. (Optional) Poll for the status of a run
$ aitp-cli status --run-id run-1678886400000
> Status: Success
`;

const webhookPayloadExample = `
{
  "projectId": 1,
  "projectName": "E-commerce Platform",
  "testId": 101,
  "testName": "Test Login Functionality",
  "testType": "UI",
  "runId": "run-1678886400000",
  "status": "Failure",
  "startedAt": "2023-03-15T12:00:00.000Z",
  "finishedAt": "2023-03-15T12:00:15.123Z",
  "duration": "15.12s",
  "logs": [
    { "timestamp": "...", "message": "Test execution started." },
    { "timestamp": "...", "message": "Error: Assertion failed: Expected element to be visible." }
  ],
  "reportUrl": "https://YOUR_APP_DOMAIN/#/project/1",
  "screenshotUrl": "https://picsum.photos/seed/run-1678886400000/1280/720"
}
`;


const IntegrationsPage: React.FC = () => {
    const { settings } = useSettings();
    const { t } = useLanguage();
    const setPageInfo = useSetPageInfo();
    const [isCopied, setIsCopied] = useState(false);
    const [activeCiTab, setActiveCiTab] = useState<'github' | 'gitlab' | 'jenkins'>('github');
    
    useEffect(() => {
        setPageInfo({ title: t('integrationsPage.title') });
    }, [setPageInfo, t]);

    const handleCopy = () => {
        navigator.clipboard.writeText(settings.platformApiKey);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const CiTabButton: React.FC<{tab: 'github' | 'gitlab' | 'jenkins', label: string}> = ({ tab, label }) => (
        <button
            onClick={() => setActiveCiTab(tab)}
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${
                activeCiTab === tab
                ? 'text-cyan-400 border-cyan-400'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
        >
            {label}
        </button>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-12">
            <div>
                <p className="mt-2 text-slate-400">{t('integrationsPage.description')}</p>
            </div>
            
            <section className="space-y-4 bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3"><KeyRound className="text-cyan-400" />{t('integrationsPage.apiKeyTitle')}</h2>
                <p className="text-sm text-slate-400">
                    {t('integrationsPage.apiKeyDescription').replace('{settingsLink}', '')}
                    <Link to="/settings" className="text-cyan-400 hover:underline">{t('integrationsPage.settingsLink')}</Link>.
                </p>
                <div className="flex items-center gap-2 p-3 bg-slate-900 rounded-md">
                    <span className="font-mono text-slate-300 flex-grow truncate">{settings.platformApiKey}</span>
                    <button onClick={handleCopy} className="flex items-center gap-2 text-sm px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-md font-semibold text-slate-200 transition-colors">
                        {isCopied ? <CheckCircle size={16} className="text-green-400" /> : <Copy size={16} />}
                        {isCopied ? t('settingsPage.copied') : t('settingsPage.copy')}
                    </button>
                </div>
            </section>
            
            <section className="space-y-4">
                 <h2 className="text-2xl font-bold text-white flex items-center gap-3"><BookOpen className="text-cyan-400" />{t('integrationsPage.apiUsageTitle')}</h2>
                 <p className="text-sm text-slate-400">{t('integrationsPage.apiUsageDescription')}</p>
                 <CodeBlock language='bash' code={`
# Endpoint format (Note: /run endpoint is conceptual and not in the current spec)
POST /api/v1/projects/{PROJECT_ID}/tests/{TEST_ID}/run

# Example with curl
curl -X POST 'https://YOUR_APP_DOMAIN/api/v1/projects/1/tests/101/run' \\
     -H "Authorization: Bearer ${settings.platformApiKey || '<YOUR_PLATFORM_API_KEY>'}"
`}/>
                <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 text-sm text-slate-400">
                    <strong>Note:</strong> {t('integrationsPage.apiNote')}
                </div>
            </section>
            
            <section className="space-y-4">
                 <h2 className="text-2xl font-bold text-white flex items-center gap-3"><Share2 className="text-cyan-400" />{t('integrationsPage.webhookTitle')}</h2>
                 <p className="text-sm text-slate-400">
                    {t('integrationsPage.webhookDescription').replace('{projectSettingsLink}', '')}
                    <Link to="/projects" className="text-cyan-400 hover:underline">{t('integrationsPage.projectSettingsLink')}</Link>.
                 </p>
                 <CodeBlock language='json' code={webhookPayloadExample}/>
            </section>

             <section className="space-y-4">
                 <h2 className="text-2xl font-bold text-white flex items-center gap-3"><Terminal className="text-cyan-400" />{t('integrationsPage.cliTitle')}</h2>
                 <p className="text-sm text-slate-400">{t('integrationsPage.cliDescription')}</p>
                 <CodeBlock language='bash' code={cliExample}/>
            </section>
            
            <section>
                 <h2 className="text-2xl font-bold text-white mb-4">{t('integrationsPage.recipesTitle')}</h2>
                 <div className="border-b border-slate-700">
                    <nav className="-mb-px flex gap-2" aria-label="CI Tabs">
                        <CiTabButton tab="github" label="GitHub Actions" />
                        <CiTabButton tab="gitlab" label="GitLab CI" />
                        <CiTabButton tab="jenkins" label="Jenkins" />
                    </nav>
                 </div>
                 <div className="pt-6">
                    {activeCiTab === 'github' && <CodeBlock language='yaml' code={githubActionsExample} />}
                    {activeCiTab === 'gitlab' && <CodeBlock language='yaml' code={gitlabCiExample} />}
                    {activeCiTab === 'jenkins' && <CodeBlock language='groovy' code={jenkinsExample} />}
                 </div>
                 <p className="text-xs text-slate-500 mt-4 text-center">{t('integrationsPage.recipesNote')}</p>
            </section>

        </div>
    );
};

export default IntegrationsPage;
