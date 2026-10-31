import React, { useState } from 'react';
import { X, Download, Upload, Copy, Check, AlertCircle, ExternalLink, Globe, Sparkles } from 'lucide-react';
import { exportData, importData, encodeDataForUrl } from '../services/storage';

export default function BackupModal({ isOpen, onClose, onRefreshData }) {
  const [copied, setCopied] = useState(false);
  const [copiedSyncLink, setCopiedSyncLink] = useState(false);
  const [importText, setImportText] = useState('');
  const [vercelUrl, setVercelUrl] = useState(() => localStorage.getItem('kuroneko_vercel_url') || '');
  const [importStatus, setImportStatus] = useState(null); // { type: 'success' | 'error', message: string }

  if (!isOpen) return null;

  const handleDownload = () => {
    const json = exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kuroneko_manga_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    const json = exportData();
    navigator.clipboard.writeText(json).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleSyncToVercel = () => {
    if (!vercelUrl.trim()) {
      setImportStatus({ type: 'error', message: 'Please enter your Vercel deployment URL (e.g. https://manga-for-me.vercel.app).' });
      return;
    }
    let target = vercelUrl.trim();
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = 'https://' + target;
    }
    localStorage.setItem('kuroneko_vercel_url', target);
    const json = exportData();
    const encoded = encodeDataForUrl(json);
    if (!encoded) {
      setImportStatus({ type: 'error', message: 'Failed to encode data. Please use "Download Backup File" instead.' });
      return;
    }
    const cleanUrl = target.replace(/#.*$/, '').replace(/\/+$/, '');
    const migrationUrl = `${cleanUrl}/#sync_data=${encoded}`;
    // Security: Prevent reverse tabnabbing by disallowing the opened window from accessing window.opener
    const win = window.open(migrationUrl, '_blank', 'noopener,noreferrer');
    if (win) win.opener = null;
    setImportStatus({ type: 'success', message: 'Migration launched! Your Vercel app tab will automatically restore all data.' });
  };

  const handleCopySyncLink = () => {
    if (!vercelUrl.trim()) {
      setImportStatus({ type: 'error', message: 'Please enter your Vercel deployment URL first.' });
      return;
    }
    let target = vercelUrl.trim();
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = 'https://' + target;
    }
    localStorage.setItem('kuroneko_vercel_url', target);
    const json = exportData();
    const encoded = encodeDataForUrl(json);
    const cleanUrl = target.replace(/#.*$/, '').replace(/\/+$/, '');
    const migrationUrl = `${cleanUrl}/#sync_data=${encoded}`;
    navigator.clipboard.writeText(migrationUrl).then(() => {
      setCopiedSyncLink(true);
      setTimeout(() => setCopiedSyncLink(false), 2500);
      setImportStatus({ type: 'success', message: 'Direct sync link copied to clipboard!' });
    });
  };

  const handleImportText = () => {
    if (!importText.trim()) return;
    const ok = importData(importText.trim());
    if (ok) {
      setImportStatus({ type: 'success', message: 'Library and reading history successfully restored!' });
      if (onRefreshData) onRefreshData();
      setTimeout(() => {
        onClose();
        setImportStatus(null);
        setImportText('');
      }, 1500);
    } else {
      setImportStatus({ type: 'error', message: 'Invalid backup JSON data format.' });
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        const ok = importData(content);
        if (ok) {
          setImportStatus({ type: 'success', message: 'Library restored from file!' });
          if (onRefreshData) onRefreshData();
          setTimeout(() => {
            onClose();
            setImportStatus(null);
          }, 1500);
        } else {
          setImportStatus({ type: 'error', message: 'Failed to parse JSON backup file.' });
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-lg bg-[#0c1017] border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh] p-5 sm:p-7 space-y-5 sm:space-y-6"
        style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-600/20 text-rose-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white">
                Backup & Vercel Sync
              </h3>
              <p className="text-xs text-slate-400">
                Transfer your library & reading progress to Vercel
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Message */}
        {importStatus && (
          <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
            importStatus.type === 'success' 
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
              : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
          }`}>
            {importStatus.type === 'success' ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            <span>{importStatus.message}</span>
          </div>
        )}

        {/* 1-Click Sync to Vercel Section */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-950/40 via-slate-900/80 to-slate-900/90 border border-rose-500/30 space-y-3">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 fill-rose-400" />
            <span>1-Click Sync to Vercel App</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Running on localhost? Enter your Vercel URL below to instantly push your library, reading history, and bookmarks directly into your deployed Vercel site:
          </p>
          <div className="space-y-2">
            <div className="relative">
              <Globe className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                placeholder="https://your-app-name.vercel.app"
                value={vercelUrl}
                onChange={(e) => setVercelUrl(e.target.value)}
                className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSyncToVercel}
                className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/30"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open & Sync in Vercel</span>
              </button>
              <button
                onClick={handleCopySyncLink}
                className="py-2.5 px-3 rounded-xl text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-white/10 transition-all flex items-center gap-1.5"
                title="Copy direct sync URL"
              >
                {copiedSyncLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSyncLink ? 'Copied' : 'Copy Link'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Standard Export Section */}
        <div className="space-y-3 pt-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Manual File Backup (Universal)
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Download your full data as a JSON file, or copy the JSON to paste into your Vercel app.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-100 bg-slate-900 hover:bg-slate-800 border border-white/10 transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4 text-rose-400" />
              <span>Download Backup File</span>
            </button>
            <button
              onClick={handleCopy}
              className="py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-white/10 transition-all flex items-center gap-2"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
            </button>
          </div>
        </div>

        {/* Import Section */}
        <div className="space-y-3 pt-3 border-t border-white/5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Restore Backup
          </h4>
          <div className="flex items-center gap-2">
            <label className="flex-1 cursor-pointer py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-white/10 flex items-center justify-center gap-2 transition-all">
              <Upload className="w-4 h-4 text-rose-400" />
              <span>Upload Backup JSON File</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="pt-2">
            <textarea
              placeholder="Or paste JSON backup content here..."
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              rows={3}
              className="w-full bg-slate-900/80 border border-white/10 rounded-xl p-3 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
            />
            {importText.trim() && (
              <button
                onClick={handleImportText}
                className="mt-2 w-full py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-all"
              >
                Restore Pasted Data
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
