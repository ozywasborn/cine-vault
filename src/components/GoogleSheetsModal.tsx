import React, { useState, useEffect } from 'react';
import {
  Cloud,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  ExternalLink,
  HelpCircle,
  X,
  UploadCloud,
  DownloadCloud,
  ShieldCheck,
  FileSpreadsheet,
  Check,
  Sparkles,
  Link2,
} from 'lucide-react';
import { GearItem, ShootProject, MaintenanceRecord, AuditLog } from '../types';
import {
  GoogleSheetsConfig,
  getStoredSheetsConfig,
  saveStoredSheetsConfig,
  googleSheetsService,
  APPS_SCRIPT_TEMPLATE,
} from '../services/googleSheetsService';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  gear: GearItem[];
  projects: ShootProject[];
  maintenance: MaintenanceRecord[];
  auditLogs: AuditLog[];
  onDataImported: (data: {
    gear?: GearItem[];
    projects?: ShootProject[];
    maintenance?: MaintenanceRecord[];
    auditLogs?: AuditLog[];
  }) => void;
  showToast: (msg: string) => void;
  sheetsConfig: GoogleSheetsConfig;
  onConfigChange: (config: GoogleSheetsConfig) => void;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  gear,
  projects,
  maintenance,
  auditLogs,
  onDataImported,
  showToast,
  sheetsConfig,
  onConfigChange,
}) => {
  const [urlInput, setUrlInput] = useState(sheetsConfig.webAppUrl || '');
  const [spreadsheetUrlInput, setSpreadsheetUrlInput] = useState(sheetsConfig.spreadsheetUrl || '');
  const [isTesting, setIsTesting] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [showInstructions, setShowInstructions] = useState(!sheetsConfig.webAppUrl);
  const [testResult, setTestResult] = useState<{
    status: 'idle' | 'success' | 'error';
    message?: string;
  }>({ status: 'idle' });

  useEffect(() => {
    setUrlInput(sheetsConfig.webAppUrl || '');
    if (sheetsConfig.spreadsheetUrl) {
      setSpreadsheetUrlInput(sheetsConfig.spreadsheetUrl);
    }
    if (!sheetsConfig.webAppUrl) {
      setShowInstructions(true);
    }
  }, [sheetsConfig.webAppUrl, sheetsConfig.spreadsheetUrl]);

  const activeSpreadsheetUrl =
    spreadsheetUrlInput.trim() ||
    sheetsConfig.spreadsheetUrl ||
    (sheetsConfig.webAppUrl ? 'https://docs.google.com/spreadsheets/d/1TH8x2NNXsxbydzF0Z79lzlSvfa8s-1Ly54bgZQkaeVc/edit' : '');

  if (!isOpen) return null;

  // Test Connection
  const handleTestConnection = async () => {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      setTestResult({ status: 'error', message: 'Please enter your Google Apps Script Web App URL.' });
      return;
    }

    setIsTesting(true);
    setTestResult({ status: 'idle' });

    const res = await googleSheetsService.testConnection(trimmed);
    setIsTesting(false);

    if (res.success) {
      const sheetUrl = res.spreadsheetUrl || sheetsConfig.spreadsheetUrl || (spreadsheetUrlInput.trim() || undefined);
      if (res.spreadsheetUrl) {
        setSpreadsheetUrlInput(res.spreadsheetUrl);
      }
      const updated: GoogleSheetsConfig = {
        ...sheetsConfig,
        webAppUrl: trimmed,
        sheetName: res.sheetName || 'Google Sheet Database',
        spreadsheetUrl: sheetUrl,
        status: 'connected',
        lastSynced: new Date().toISOString(),
        errorMessage: undefined,
      };
      saveStoredSheetsConfig(updated);
      onConfigChange(updated);
      setTestResult({
        status: 'success',
        message: `Connected successfully to "${res.sheetName || 'Google Sheet'}"!`,
      });
      showToast(`Connected to Google Sheets: ${res.sheetName || 'Ready'}`);
    } else {
      const updated: GoogleSheetsConfig = {
        ...sheetsConfig,
        webAppUrl: trimmed,
        status: 'error',
        errorMessage: res.error,
      };
      saveStoredSheetsConfig(updated);
      onConfigChange(updated);
      setTestResult({
        status: 'error',
        message: res.error || 'Could not connect. Please check permissions or deployment URL.',
      });
    }
  };

  // Push full catalog to Google Sheets
  const handlePushAll = async () => {
    const url = urlInput.trim() || sheetsConfig.webAppUrl;
    if (!url) {
      showToast('Please enter and test your Web App URL first.');
      return;
    }

    setIsPushing(true);
    try {
      const res = await googleSheetsService.pushAll(url, {
        gear,
        projects,
        maintenance,
        auditLogs,
        spreadsheetUrl: activeSpreadsheetUrl || undefined,
      });

      if (res.success) {
        const sheetUrl = res.spreadsheetUrl || sheetsConfig.spreadsheetUrl || (spreadsheetUrlInput.trim() || undefined);
        if (res.spreadsheetUrl) {
          setSpreadsheetUrlInput(res.spreadsheetUrl);
        }
        const updated: GoogleSheetsConfig = {
          ...sheetsConfig,
          webAppUrl: url,
          sheetName: res.sheetName || sheetsConfig.sheetName,
          spreadsheetUrl: sheetUrl,
          status: 'connected',
          lastSynced: new Date().toISOString(),
        };
        saveStoredSheetsConfig(updated);
        onConfigChange(updated);
        const writtenCount = res.gearWritten !== undefined ? res.gearWritten : gear.length;
        showToast(`Pushed ${writtenCount} assets to Google Sheets!`);
        setTestResult({
          status: 'success',
          message: res.message || `Successfully pushed ${writtenCount} gear items and deployments to your Google Sheet!`,
        });
      } else {
        showToast(`Push failed: ${res.error}`);
        setTestResult({
          status: 'error',
          message: `Push failed: ${res.error}`,
        });
      }
    } catch (err: any) {
      showToast(`Error syncing to Google Sheets: ${err.message}`);
    } finally {
      setIsPushing(false);
    }
  };

  // Pull catalog from Google Sheets
  const handlePullAll = async () => {
    const url = urlInput.trim() || sheetsConfig.webAppUrl;
    if (!url) {
      showToast('Please enter and test your Web App URL first.');
      return;
    }

    setIsPulling(true);
    try {
      const res = await googleSheetsService.fetchAll(url);
      if (res.success) {
        onDataImported({
          gear: res.gear,
          projects: res.projects,
          maintenance: res.maintenance,
          auditLogs: res.auditLogs,
        });

        const sheetUrl = res.spreadsheetUrl || sheetsConfig.spreadsheetUrl || (spreadsheetUrlInput.trim() || undefined);
        if (res.spreadsheetUrl) {
          setSpreadsheetUrlInput(res.spreadsheetUrl);
        }
        const updated: GoogleSheetsConfig = {
          ...sheetsConfig,
          webAppUrl: url,
          sheetName: res.sheetName || sheetsConfig.sheetName,
          spreadsheetUrl: sheetUrl,
          status: 'connected',
          lastSynced: new Date().toISOString(),
        };
        saveStoredSheetsConfig(updated);
        onConfigChange(updated);

        const count = res.gear?.length || 0;
        showToast(`Imported ${count} assets from Google Sheets!`);
      } else {
        showToast(`Fetch failed: ${res.error}`);
      }
    } catch (err: any) {
      showToast(`Error pulling from Google Sheets: ${err.message}`);
    } finally {
      setIsPulling(false);
    }
  };

  // Copy Script Code
  const handleCopyScript = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_TEMPLATE);
    setCopiedScript(true);
    showToast('Apps Script code copied to clipboard!');
    setTimeout(() => setCopiedScript(false), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50/60 via-teal-50/40 to-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  Google Sheets Cloud Database
                </h2>
                {sheetsConfig.status === 'connected' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Cloud Sync
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Store full inventory & deployments permanently in your Google Drive
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activeSpreadsheetUrl ? (
              <a
                href={activeSpreadsheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                title="Open your Google Spreadsheet in a new tab"
              >
                <span>Open Sheet</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : null}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Status Alert Banner */}
          {sheetsConfig.status === 'connected' ? (
            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-emerald-900 flex items-center gap-2 flex-wrap">
                      <span>Connected to:</span>
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-100 border border-emerald-300 font-mono font-black text-emerald-950">
                        {sheetsConfig.sheetName || 'cine-vault-inventory'}
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-200/60 text-emerald-900 text-[11px] font-semibold">
                        📋 Tab: <strong>Inventory</strong> ({gear.length} items)
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-200/60 text-emerald-900 text-[11px] font-semibold">
                        🎬 Tab: <strong>Deployments</strong> ({projects.length} shoots)
                      </span>
                    </div>
                  </div>
                </div>

                {activeSpreadsheetUrl && (
                  <a
                    href={activeSpreadsheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all shrink-0"
                  >
                    <span>Open Sheet</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                <span className="font-bold text-amber-700 shrink-0">👉 Tip:</span>
                <span>
                  Google Sheets displays tabs along the bottom bar. Click the <strong>Inventory</strong> tab to view all equipment assets. (If you see an empty <strong>Sheet1</strong>, click on <strong>Inventory</strong> right next to it!)
                </span>
              </div>

              {sheetsConfig.lastSynced && (
                <div className="text-[10px] text-emerald-700 font-medium pt-1 border-t border-emerald-200/50">
                  Last synchronized: {new Date(sheetsConfig.lastSynced).toLocaleString()}
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-start gap-3">
              <Cloud className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs text-amber-900">
                <div className="font-bold">Cloud Database Disconnected</div>
                <p className="mt-0.5 text-amber-800/90 leading-relaxed">
                  Connect your Google Sheet below to permanently store your {gear.length}+ equipment assets, active shoot deployments, and maintenance records in Google Drive.
                </p>
              </div>
            </div>
          )}

          {/* Web App URL Configuration */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Google Apps Script Web App URL</span>
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-mono focus:outline-none focus:bg-white focus:border-emerald-500 transition-colors"
              />
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="px-4 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs flex items-center gap-2 transition-all shrink-0 disabled:opacity-50"
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Testing...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Test &amp; Connect</span>
                  </>
                )}
              </button>
            </div>

            {/* Live URL Hints */}
            {urlInput.includes('docs.google.com/spreadsheets/d/') && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-medium space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-800">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Spreadsheet link entered in Web App field</span>
                </div>
                <p>
                  You entered the spreadsheet web link. CineVault requires the <strong>Web app URL</strong> ending in <strong>/exec</strong>. In your Google Sheet, click <strong>Extensions &gt; Apps Script &gt; Deploy &gt; Manage deployments</strong>, and copy the Web app URL.
                </p>
              </div>
            )}

            {urlInput.includes('/dev') && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-medium space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-800">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Development '/dev' URL detected</span>
                </div>
                <p>
                  URLs ending in <strong>/dev</strong> require Google browser login. Please replace <strong>/dev</strong> with <strong>/exec</strong> from <strong>Deploy &gt; Manage deployments</strong>.
                </p>
              </div>
            )}

            {testResult.status === 'success' && (
              <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5 mt-1">
                <Check className="w-3.5 h-3.5" />
                <span>{testResult.message}</span>
              </p>
            )}
            {testResult.status === 'error' && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1 mt-1.5">
                <div className="font-bold flex items-center gap-1.5 text-rose-700">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Connection Issue</span>
                </div>
                <p className="text-rose-800 leading-relaxed font-medium">
                  {testResult.message}
                </p>
              </div>
            )}
          </div>

          {/* Database Synchronization Controls */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Database Synchronization
              </span>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sheetsConfig.autoSyncEnabled}
                  onChange={(e) => {
                    const updated = { ...sheetsConfig, autoSyncEnabled: e.target.checked };
                    saveStoredSheetsConfig(updated);
                    onConfigChange(updated);
                  }}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <span>Auto-sync changes to Google Sheet</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={handlePushAll}
                disabled={isPushing || (!urlInput && !sheetsConfig.webAppUrl)}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPushing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Pushing Catalog ({gear.length} Assets)...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>Push Inventory to Sheet ({gear.length})</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handlePullAll}
                disabled={isPulling || (!urlInput && !sheetsConfig.webAppUrl)}
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPulling ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-600" />
                    <span>Pulling from Google Sheet...</span>
                  </>
                ) : (
                  <>
                    <DownloadCloud className="w-4 h-4 text-emerald-600" />
                    <span>Pull Latest from Google Sheet</span>
                  </>
                )}
              </button>
            </div>

            {/* Direct CSV Download option */}
            <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
              <span className="text-[11px] text-slate-500">Need immediate offline data or manual file import?</span>
              <button
                type="button"
                onClick={() => {
                  googleSheetsService.downloadInventoryCsv(gear);
                  showToast('Inventory CSV downloaded!');
                }}
                className="font-bold text-slate-800 hover:text-emerald-700 text-[11px] flex items-center gap-1.5 transition-colors underline"
              >
                <span>Download Inventory CSV</span>
              </button>
            </div>
          </div>

          {/* Quick Setup & Update Guide Accordion */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowInstructions((prev) => !prev)}
              className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/80 flex items-center justify-between text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold text-slate-900">
                  Google Apps Script Setup &amp; Update Guide
                </span>
              </div>
              <span className="text-xs font-semibold text-emerald-700">
                {showInstructions ? 'Hide Guide' : 'Show Guide'}
              </span>
            </button>

            {showInstructions && (
              <div className="p-4 bg-white space-y-3.5 text-xs text-slate-600 border-t border-slate-200">
                <ol className="space-y-2 list-decimal list-inside font-medium leading-relaxed">
                  <li>
                    Open your Google Sheet in Google Drive.
                  </li>
                  <li>
                    In the top menu, click <strong className="text-slate-900">Extensions</strong> →{' '}
                    <strong className="text-slate-900">Apps Script</strong>.
                  </li>
                  <li>
                    Replace all code in <code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded font-mono text-[11px]">Code.gs</code> by clicking the <strong className="text-emerald-700">&quot;Copy Apps Script Code&quot;</strong> button below and pasting it.
                  </li>
                  <li className="p-2.5 rounded-xl bg-amber-50/90 border border-amber-300 text-amber-950 font-medium space-y-1">
                    <div>
                      <strong>Deploying or Updating (Crucial):</strong>
                    </div>
                    <ul className="list-disc list-inside text-[11px] space-y-0.5 pl-1 text-amber-900 font-normal">
                      <li>
                        <strong>If first time:</strong> Click <strong className="text-slate-900">Deploy</strong> (top-right) → <strong className="text-slate-900">New deployment</strong> → Web app. Set <em>Execute as:</em> <strong>Me</strong>, <em>Who has access:</em> <strong className="underline font-bold text-amber-950">Anyone</strong>.
                      </li>
                      <li>
                        <strong>If updating existing:</strong> Click <strong className="text-slate-900">Deploy → Manage deployments</strong>, click the <strong>pencil (Edit)</strong> icon, under Version select <strong className="underline font-bold text-amber-950">&quot;New version&quot;</strong>, and click <strong>Deploy</strong>.
                        <span className="block text-[10px] text-amber-800/80 mt-0.5">*(Google Web Apps keep running the old version until you select &quot;New version&quot; &amp; Deploy).*</span>
                      </li>
                    </ul>
                  </li>
                  <li>
                    Copy the Web app URL ending in <code className="text-emerald-800 bg-emerald-50 px-1 py-0.5 rounded font-bold font-mono text-[11px]">/exec</code>, paste it above, and click <strong className="text-slate-900">Test &amp; Connect</strong>!
                  </li>
                </ol>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleCopyScript}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    {copiedScript ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Apps Script Code Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-emerald-400" />
                        <span>Copy Apps Script Code to Clipboard</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-[11px] text-emerald-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>Bonus:</strong> The updated script also adds a <strong>🎬 CineVault</strong> menu directly in Google Sheets so you can initialize or format tabs inside Google Sheets anytime!
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Database permanently hosted on your personal Google Drive</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
