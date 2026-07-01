import { collection, doc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { getDocs, addDoc, updateDoc, deleteDoc, setDoc, getDoc } from "@/lib/requestStats";
import { db } from "@/lib/firebase";

function userBasePath(email: string) {
  return `users/${email}`;
}

export interface DailyFolder {
  id: string;
  title: string;
  description: string;
  created_at: Date;
}

export interface DailyTask {
  id: string;
  title: string;
  description: string;
  folder_id: string;
  completed_days: string[]; // YYYY-MM-DD
  completed_times?: Record<string, string>; // "YYYY-MM-DD" -> "HH:mm"
  created_at: Date;
}

export async function getDailyFolders(email: string): Promise<DailyFolder[]> {
  const snap = await getDocs(query(collection(db, userBasePath(email), "dailyFolders"), orderBy("created_at", "desc")));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      title: data.title,
      description: data.description,
      created_at: data.created_at?.toDate?.() ?? new Date(),
    };
  });
}

export async function getDailyFolder(email: string, folderId: string): Promise<DailyFolder | null> {
  const snap = await getDoc(doc(db, userBasePath(email), "dailyFolders", folderId));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    id: snap.id,
    title: data.title,
    description: data.description,
    created_at: data.created_at?.toDate?.() ?? new Date(),
  };
}

export async function createDailyFolder(email: string, title: string, description: string): Promise<string> {
  const ref = await addDoc(collection(db, userBasePath(email), "dailyFolders"), {
    title,
    description,
    created_at: serverTimestamp(),
  });
  return ref.id;
}

export async function deleteDailyFolder(email: string, folderId: string): Promise<void> {
  // Delete all tasks in the folder first
  const tasksSnap = await getDocs(collection(db, userBasePath(email), "dailyFolders", folderId, "dailyTasks"));
  await Promise.all(tasksSnap.docs.map((d) => deleteDoc(d.ref)));
  await deleteDoc(doc(db, userBasePath(email), "dailyFolders", folderId));
}

export async function getDailyTasks(email: string, folderId: string): Promise<DailyTask[]> {
  const snap = await getDocs(query(collection(db, userBasePath(email), "dailyFolders", folderId, "dailyTasks"), orderBy("created_at", "asc")));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      title: data.title,
      description: data.description,
      folder_id: folderId,
      completed_days: data.completed_days || [],
      completed_times: data.completed_times || {},
      created_at: data.created_at?.toDate?.() ?? new Date(),
    };
  });
}

export async function createDailyTask(email: string, folderId: string, title: string, description: string): Promise<string> {
  const ref = await addDoc(collection(db, userBasePath(email), "dailyFolders", folderId, "dailyTasks"), {
    title,
    description,
    completed_days: [],
    completed_times: {},
    created_at: serverTimestamp(),
  });
  return ref.id;
}

export async function deleteDailyTask(email: string, folderId: string, taskId: string): Promise<void> {
  await deleteDoc(doc(db, userBasePath(email), "dailyFolders", folderId, "dailyTasks", taskId));
}

export async function toggleDailyTaskDay(email: string, folderId: string, taskId: string, dayStr: string, completedDays: string[], completedTimes: Record<string, string> = {}): Promise<void> {
  const isCompleted = completedDays.includes(dayStr);
  const newDays = isCompleted 
    ? completedDays.filter(d => d !== dayStr) 
    : [...completedDays, dayStr];
    
  const newTimes = { ...completedTimes };
  if (isCompleted) {
    delete newTimes[dayStr];
  } else {
    const now = new Date();
    newTimes[dayStr] = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }
    
  await updateDoc(doc(db, userBasePath(email), "dailyFolders", folderId, "dailyTasks", taskId), {
    completed_days: newDays,
    completed_times: newTimes
  });
}
