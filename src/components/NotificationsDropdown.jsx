import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  Sparkles, 
  Play, 
  CheckCheck, 
  Trash2, 
  RefreshCw, 
  X, 
  ExternalLink,
  Layers,
  Settings,
  Clock
} from 'lucide-react';
import { 
  getUpdates, 
  markUpdateAsRead, 
  markAllUpdatesAsRead, 
  clearUpdates,
  getUpdateSettings,
  saveUpdateSettings
} from '../services/storage';
import { 
  checkAllLibraryUpdates, 
  requestNotificationPermission 
} from '../services/updateService';

export default function NotificationsDropdown({
  isOpen,
  onClose,
  onOpenReader,
  onSelectManga
}) {
  const [updates, setUpdates] = useState([]);
  const [settings, setSettings] = useState(getUpdateSettings());
  const [checking, setChecking] = useState(false);
  const [permissionState, setPermissionState] = useState(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );
  const dropdownRef = useRef(null);

  const loadData = () => {
    setUpdates(getUpdates());
    setSettings(getUpdateSettings());
  };

  useEffect(() => {
    loadData();
  }, [isOpen]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Check for updates manually
  const handleCheckNow = async () => {
    setChecking(true);
    try {
      await checkAllLibraryUpdates();
      loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setChecking(false);
    }
  };

  // Toggle browser desktop notifications
  const handleToggleDesktopNotifs = async () => {
    if (settings.browserNotifications) {
      const updated = { ...settings, browserNotifications: false };
      setSettings(updated);
      saveUpdateSettings(updated);
    } else {
      const granted = await requestNotificationPermission();
      setPermissionState(granted ? 'granted' : 'denied');
      const updated = { ...settings, browserNotifications: granted };
      setSettings(updated);
      saveUpdateSettings(updated);
    }
  };

  // Change interval
  const handleIntervalChange = (val) => {
    const updated = { ...settings, intervalMinutes: parseInt(val, 10) };
    setSettings(updated);
    saveUpdateSettings(updated);
  };

  const unreadCount = updates.filter((u) => !u.read).length;

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className="fixed inset-x-3 top-20 sm:top-full sm:mt-3 sm:right-0 sm:left-auto sm:inset-x-auto w-auto sm:w-96 max-h-[85vh] bg-[#0c1017] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col z-50 animate-fadeIn text-slate-200"
    >
      {/* Header */}
      <div className="p-4 sm:p-5 bg-gradient-to-b from-slate-900/90 to-[#0c1017] border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Bell className="w-4 h-4 fill-amber-400 text-amber-400" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight flex items-center gap-2">
              <span>Chapter Updates</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-600 text-white animate-pulse">
                  {unreadCount} new
                </span>
              )}
            </h3>
            <p className="text-[11px] text-slate-400">
              Regular releases for your tracked manga
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Control Bar: Refresh & Interval */}
      <div className="px-4 py-2.5 bg-slate-950/60 border-b border-white/5 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>Every:</span>
          <select
            value={settings.intervalMinutes || 15}
            onChange={(e) => handleIntervalChange(e.target.value)}
            className="bg-slate-900 border border-white/10 rounded-md px-1.5 py-0.5 text-[11px] text-slate-300 focus:outline-none focus:border-rose-500"
          >
            <option value="5">5 min</option>
            <option value="15">15 min</option>
            <option value="30">30 min</option>
            <option value="60">1 hour</option>
          </select>
        </div>

        <button
          onClick={handleCheckNow}
          disabled={checking}
          className="px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 font-semibold text-[11px] flex items-center gap-1.5 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${checking ? 'animate-spin' : ''}`} />
          <span>{checking ? 'Checking...' : 'Check Now'}</span>
        </button>
      </div>

      {/* Desktop Push Notification Toggle Banner */}
      <div className="px-4 py-2 bg-gradient-to-r from-rose-950/20 to-amber-950/20 border-b border-white/5 flex items-center justify-between text-[11px]">
        <span className="text-slate-300 font-medium">Desktop Alerts:</span>
        <button
          onClick={handleToggleDesktopNotifs}
          className={`px-2 py-0.5 rounded-md font-bold transition-all ${
            settings.browserNotifications
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-white/10 text-slate-400 hover:text-white border border-white/10'
          }`}
        >
          {settings.browserNotifications ? '✓ Enabled' : 'Enable'}
        </button>
      </div>

      {/* Updates List */}
      <div className="flex-1 overflow-y-auto max-h-[380px] p-2 space-y-1.5">
        {updates.length === 0 ? (
          <div className="py-12 px-4 text-center text-slate-500 space-y-2">
            <Sparkles className="w-8 h-8 text-slate-600 mx-auto opacity-50" />
            <p className="text-xs font-semibold text-slate-400">All caught up!</p>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              We check for new chapters regularly. When a new chapter drops for your manga, you'll be notified here!
            </p>
            <button
              onClick={handleCheckNow}
              disabled={checking}
              className="mt-3 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium inline-flex items-center gap-1.5 border border-white/5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
              <span>Scan Library Now</span>
            </button>
          </div>
        ) : (
          updates.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 group ${
                !item.read
                  ? 'bg-rose-500/10 border-rose-500/30 hover:bg-rose-500/15'
                  : 'bg-slate-900/50 border-white/5 hover:bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              {/* Cover thumbnail */}
              <div 
                className="w-11 h-14 rounded-xl overflow-hidden bg-slate-950 flex-shrink-0 cursor-pointer border border-white/10 shadow-md"
                onClick={() => {
                  onSelectManga(item.mangaId, item.coverUrl);
                  onClose();
                }}
              >
                <img
                  src={item.coverUrl}
                  alt={item.mangaTitle}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=100&auto=format&fit=crop&q=80';
                  }}
                />
              </div>

              {/* Title & Chapter Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-white truncate max-w-[170px]" title={item.mangaEnglishTitle || item.mangaTitle}>
                    {item.mangaEnglishTitle || item.mangaTitle}
                  </span>
                  {!item.read && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0"></span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-amber-400 font-extrabold text-xs">
                    Ch. {item.chapterNumber}
                  </span>
                  <span className="text-[10px] text-slate-500">• Released</span>
                </div>

                <div className="text-[10px] text-slate-500 mt-0.5">
                  {item.publishedAt || 'Recently'}
                </div>
              </div>

              {/* Action Button: Read Now */}
              <button
                onClick={() => {
                  markUpdateAsRead(item.id);
                  loadData();
                  onClose();
                  onOpenReader(
                    item.mangaId,
                    item.chapterId,
                    item.chapterNumber,
                    item.mangaTitle,
                    item.coverUrl,
                    item.mangaEnglishTitle
                  );
                }}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-xs shadow-md shadow-rose-600/30 flex items-center gap-1 flex-shrink-0 transition-all"
              >
                <Play className="w-3 h-3 fill-white" />
                <span>Read</span>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer Actions */}
      {updates.length > 0 && (
        <div className="p-3 bg-slate-950/80 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
          <button
            onClick={() => {
              markAllUpdatesAsRead();
              loadData();
            }}
            className="hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>Mark all read</span>
          </button>

          <button
            onClick={() => {
              clearUpdates();
              loadData();
            }}
            className="hover:text-rose-400 flex items-center gap-1 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      )}
    </div>
  );
}
