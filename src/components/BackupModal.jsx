import React, { useState } from 'react';
import { X, Download, Upload, Copy, Check, AlertCircle, FileText } from 'lucide-react';
import { exportData, importData } from '../services/storage';

export default function BackupModal({ isOpen, onClose, onRefreshData }) {
  const [copied, setCopied] = useState(false);
  const [importText, setImportText] = useState('');
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
                Backup & Sync Data
              </h3>
              <p className="text-xs text-slate-400">
                Safeguard your bookmarks and reading progress
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
            {importStatus.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{importStatus.message}</span>
          </div>
        )}

        {/* Export Section */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Export Your Library
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Download your reading history, last read position, and bookmarked manga to transfer across devices.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20"
            >
              <Download className="w-4 h-4" />
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
