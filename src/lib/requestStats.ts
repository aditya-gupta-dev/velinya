/**
 * requestStats — local-only transparency tracker.
 *
 * Counts every Firestore network op this device sends (reads + writes) and
 * persists cumulative + per-day counts to localStorage. Nothing leaves the
 * device. Firestore lib calls import their ops from here instead of straight
 * from "firebase/firestore", so tracking is automatic with zero call-site edits.
 */
import {
  getDocs as _getDocs,
  getDoc as _getDoc,
  addDoc as _addDoc,
  updateDoc as _updateDoc,
  deleteDoc as _deleteDoc,
  setDoc as _setDoc,
} from "firebase/firestore";

const STORAGE_KEY = "velinya:reqStats";

export interface RequestStats {
  reads: number;
  writes: number;
  firstAt: string; // ISO
  today: { date: string; reads: number; writes: number };
}

export interface RequestStatsSnapshot extends RequestStats {
  total: number;
  sessionReads: number;
  sessionWrites: number;
  sessionTotal: number;
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function load(): RequestStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const p = JSON.parse(raw) as RequestStats;
      if (p && typeof p.reads === "number" && typeof p.writes === "number") {
        if (!p.today || p.today.date !== todayStr()) {
          p.today = { date: todayStr(), reads: 0, writes: 0 };
        }
        return p;
      }
    }
  } catch {
    /* ignore malformed */
  }
  return { reads: 0, writes: 0, firstAt: new Date().toISOString(), today: { date: todayStr(), reads: 0, writes: 0 } };
}

let state: RequestStats = load();
let sessionReads = 0;
let sessionWrites = 0;

const listeners = new Set<() => void>();

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage full / disabled — counting still works in memory */
  }
}

function emit() {
  listeners.forEach((cb) => cb());
}

function trackRequest(kind: "read" | "write") {
  // roll the per-day bucket if the day changed mid-session
  if (state.today.date !== todayStr()) {
    state.today = { date: todayStr(), reads: 0, writes: 0 };
  }
  if (kind === "read") {
    state.reads++;
    state.today.reads++;
    sessionReads++;
  } else {
    state.writes++;
    state.today.writes++;
    sessionWrites++;
  }
  persist();
  emit();
}

export function getRequestStats(): RequestStatsSnapshot {
  return {
    ...state,
    total: state.reads + state.writes,
    sessionReads,
    sessionWrites,
    sessionTotal: sessionReads + sessionWrites,
  };
}

export function resetRequestStats() {
  state = { reads: 0, writes: 0, firstAt: new Date().toISOString(), today: { date: todayStr(), reads: 0, writes: 0 } };
  sessionReads = 0;
  sessionWrites = 0;
  persist();
  emit();
}

export function subscribeRequestStats(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export interface StorageEstimate {
  usage: number;
  quota: number;
  percent: number;
  usageDetails?: Record<string, number>;
}

/** Local cache / origin storage footprint (IndexedDB + SW caches). null if unsupported. */
export async function getStorageEstimate(): Promise<StorageEstimate | null> {
  if (!navigator.storage?.estimate) return null;
  const estimate = await navigator.storage.estimate();
  const usage = estimate.usage ?? 0;
  const quota = estimate.quota ?? 0;
  return { 
    usage, 
    quota, 
    percent: quota > 0 ? (usage / quota) * 100 : 0,
    usageDetails: estimate.usageDetails
  };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let val = bytes / 1024;
  let i = 0;
  while (val >= 1024 && i < units.length - 1) {
    val /= 1024;
    i++;
  }
  return `${val.toFixed(val >= 10 ? 0 : 1)} ${units[i]}`;
}

// ─── Tracked Firestore ops (drop-in replacements) ───────────────────────────
export const getDocs = ((q: unknown) => {
  trackRequest("read");
  return (_getDocs as (a: unknown) => unknown)(q);
}) as typeof _getDocs;

export const getDoc = ((ref: unknown) => {
  trackRequest("read");
  return (_getDoc as (a: unknown) => unknown)(ref);
}) as typeof _getDoc;

export const addDoc = ((...args: unknown[]) => {
  trackRequest("write");
  return (_addDoc as (...a: unknown[]) => unknown)(...args);
}) as typeof _addDoc;

export const updateDoc = ((...args: unknown[]) => {
  trackRequest("write");
  return (_updateDoc as (...a: unknown[]) => unknown)(...args);
}) as typeof _updateDoc;

export const deleteDoc = ((ref: unknown) => {
  trackRequest("write");
  return (_deleteDoc as (a: unknown) => unknown)(ref);
}) as typeof _deleteDoc;

export const setDoc = ((...args: unknown[]) => {
  trackRequest("write");
  return (_setDoc as (...a: unknown[]) => unknown)(...args);
}) as typeof _setDoc;
