import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getRequestStats,
  subscribeRequestStats,
  getStorageEstimate,
  formatBytes,
} from "@/lib/requestStats";
import type {
  RequestStatsSnapshot,
  StorageEstimate
} from "@/lib/requestStats";

export function SettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [stats, setStats] = useState<RequestStatsSnapshot>(getRequestStats());
  const [storage, setStorage] = useState<StorageEstimate | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);

  useEffect(() => {
    if (!open) return;
    setStats(getRequestStats());
    const unsubscribe = subscribeRequestStats(() => {
      setStats(getRequestStats());
    });
    getStorageEstimate().then(setStorage);
    return unsubscribe;
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl bg-canvas border-none shadow-2xl max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-5 pt-5 pb-0">
          <DialogTitle className="font-display text-xl font-bold text-ink">
            Settings & Transparency
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-6 pt-4 min-h-0">
          <section>
            <h4 className="text-xs font-semibold text-mute uppercase tracking-wider mb-3">
              Network Requests (Firestore)
            </h4>
            <p className="text-sm text-body mb-4">
              We track every database request your device makes locally to provide full transparency on app usage. Nothing is sent to analytics.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-canvas-soft rounded-xl p-3 border border-border/40">
                <p className="text-xs text-mute mb-1">Session Reads</p>
                <p className="font-display text-xl font-bold text-ink">{stats.sessionReads}</p>
              </div>
              <div className="bg-canvas-soft rounded-xl p-3 border border-border/40">
                <p className="text-xs text-mute mb-1">Session Writes</p>
                <p className="font-display text-xl font-bold text-ink">{stats.sessionWrites}</p>
              </div>
              <div className="bg-canvas-soft rounded-xl p-3 border border-border/40">
                <p className="text-xs text-mute mb-1">Today Reads</p>
                <p className="font-display text-xl font-bold text-ink">{stats.today.reads}</p>
              </div>
              <div className="bg-canvas-soft rounded-xl p-3 border border-border/40">
                <p className="text-xs text-mute mb-1">Today Writes</p>
                <p className="font-display text-xl font-bold text-ink">{stats.today.writes}</p>
              </div>
              <div className="bg-canvas-soft rounded-xl p-3 border border-border/40">
                <p className="text-xs text-mute mb-1">Total Reads</p>
                <p className="font-display text-xl font-bold text-ink">{stats.reads}</p>
              </div>
              <div className="bg-canvas-soft rounded-xl p-3 border border-border/40">
                <p className="text-xs text-mute mb-1">Total Writes</p>
                <p className="font-display text-xl font-bold text-ink">{stats.writes}</p>
              </div>
            </div>
            <p className="text-xs text-mute mt-3 text-right">
              Tracking since: {new Date(stats.firstAt).toLocaleDateString()}
            </p>
          </section>

          <hr className="border-border/40" />

          <section>
            <h4 className="text-xs font-semibold text-mute uppercase tracking-wider mb-3">
              Local Storage
            </h4>
            <div 
              className="bg-canvas-soft rounded-xl p-4 border border-border/40 cursor-pointer hover:bg-canvas transition-colors"
              onClick={() => setShowBreakdown(!showBreakdown)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-ink">Offline Cache</p>
                  <p className="text-xs text-mute">IndexedDB & Cache API</p>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <p className="font-display text-lg font-bold text-ink">
                      {storage ? formatBytes(storage.usage) : "Unknown"}
                    </p>
                    {storage && storage.quota > 0 && (
                      <p className="text-xs text-mute">
                        of {formatBytes(storage.quota)} available
                      </p>
                    )}
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-mute transition-transform ${showBreakdown ? "rotate-180" : ""}`}>
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </div>

              {showBreakdown && storage?.usageDetails && (
                <div className="mt-4 pt-4 border-t border-border/40 space-y-2">
                  {Object.entries(storage.usageDetails).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center text-sm">
                      <span className="text-body capitalize">{key}</span>
                      <span className="font-medium text-ink">{formatBytes(value as number)}</span>
                    </div>
                  ))}
                  {Object.keys(storage.usageDetails).length === 0 && (
                    <p className="text-sm text-mute text-center py-2">No detailed breakdown available.</p>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
