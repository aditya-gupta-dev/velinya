import {
  collection,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import {
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  getDoc,
} from "@/lib/requestStats";
import { db } from "@/lib/firebase";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Folder {
  id: string;
  name: string;
}

export interface Note {
  id: string;
  title: string;
  description: string;
  folder: string;
  created_at: Date;
  updated_at: Date;
}

export interface Todo {
  id: string;
  title: string;
  description: string;
  deadline: string; // ISO date string YYYY-MM-DD
  is_completed: boolean;
  results: string;
  priority: "low" | "medium" | "high";
  created_at: Date;
  updated_at: Date;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function userBasePath(email: string) {
  return `users/${email}`;
}

// ─── Folders ──────────────────────────────────────────────────────────────────

export async function getFolders(email: string): Promise<Folder[]> {
  const snap = await getDocs(
    collection(db, userBasePath(email), "folders")
  );
  return snap.docs.map((d) => ({ id: d.id, name: d.data().name as string }));
}

export async function createFolder(email: string, name: string): Promise<Folder> {
  const folderRef = doc(db, userBasePath(email), "folders", name);
  await setDoc(folderRef, { name });
  return { id: name, name };
}

export async function deleteFolder(email: string, folderId: string): Promise<void> {
  // Delete all notes in the folder first
  const notesSnap = await getDocs(
    collection(db, userBasePath(email), "folders", folderId, "notes")
  );
  const deletePromises = notesSnap.docs.map((d) => deleteDoc(d.ref));
  await Promise.all(deletePromises);
  await deleteDoc(doc(db, userBasePath(email), "folders", folderId));
}

// ─── Notes ────────────────────────────────────────────────────────────────────

export async function getNotes(email: string, folderId: string): Promise<Note[]> {
  const snap = await getDocs(
    query(
      collection(db, userBasePath(email), "folders", folderId, "notes"),
      orderBy("created_at", "desc")
    )
  );
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      title: data.title,
      description: data.description,
      folder: folderId,
      created_at: data.created_at?.toDate?.() ?? new Date(),
      updated_at: data.updated_at?.toDate?.() ?? new Date(),
    };
  });
}

export async function getNote(
  email: string,
  folderId: string,
  noteId: string
): Promise<Note | null> {
  const snap = await getDoc(
    doc(db, userBasePath(email), "folders", folderId, "notes", noteId)
  );
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    id: snap.id,
    title: data.title,
    description: data.description,
    folder: folderId,
    created_at: data.created_at?.toDate?.() ?? new Date(),
    updated_at: data.updated_at?.toDate?.() ?? new Date(),
  };
}

export async function createNote(
  email: string,
  folderId: string,
  title: string,
  description: string
): Promise<string> {
  const ref = await addDoc(
    collection(db, userBasePath(email), "folders", folderId, "notes"),
    {
      title,
      description,
      folder: folderId,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    }
  );
  return ref.id;
}

export async function updateNote(
  email: string,
  folderId: string,
  noteId: string,
  data: { title?: string; description?: string }
): Promise<void> {
  await updateDoc(
    doc(db, userBasePath(email), "folders", folderId, "notes", noteId),
    {
      ...data,
      updated_at: serverTimestamp(),
    }
  );
}

export async function deleteNote(
  email: string,
  folderId: string,
  noteId: string
): Promise<void> {
  await deleteDoc(
    doc(db, userBasePath(email), "folders", folderId, "notes", noteId)
  );
}

// ─── Todos ────────────────────────────────────────────────────────────────────

export async function getTodos(email: string, month: number): Promise<Todo[]> {
  const monthStr = String(month);
  const snap = await getDocs(
    query(
      collection(db, userBasePath(email), "todos", monthStr, "items"),
      orderBy("deadline", "asc")
    )
  );
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      title: data.title,
      description: data.description,
      deadline: data.deadline,
      is_completed: data.is_completed ?? false,
      results: data.results ?? "",
      priority: data.priority ?? "medium",
      created_at: data.created_at?.toDate?.() ?? new Date(),
      updated_at: data.updated_at?.toDate?.() ?? new Date(),
    };
  });
}

export async function createTodo(
  email: string,
  month: number,
  data: {
    title: string;
    description: string;
    deadline: string;
    priority: "low" | "medium" | "high";
  }
): Promise<string> {
  const monthStr = String(month);
  // Ensure the month doc exists
  await setDoc(doc(db, userBasePath(email), "todos", monthStr), { month: monthStr }, { merge: true });

  const ref = await addDoc(
    collection(db, userBasePath(email), "todos", monthStr, "items"),
    {
      ...data,
      is_completed: false,
      results: "",
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    }
  );
  return ref.id;
}

export async function completeTodo(
  email: string,
  month: number,
  todoId: string,
  results: string
): Promise<void> {
  const monthStr = String(month);
  await updateDoc(
    doc(db, userBasePath(email), "todos", monthStr, "items", todoId),
    {
      is_completed: true,
      results,
      updated_at: serverTimestamp(),
    }
  );
}

export async function updateTodo(
  email: string,
  month: number,
  todoId: string,
  data: Partial<Omit<Todo, "id" | "created_at" | "updated_at">>
): Promise<void> {
  const monthStr = String(month);
  await updateDoc(
    doc(db, userBasePath(email), "todos", monthStr, "items", todoId),
    {
      ...data,
      updated_at: serverTimestamp(),
    }
  );
}

export async function deleteTodo(
  email: string,
  month: number,
  todoId: string
): Promise<void> {
  const monthStr = String(month);
  await deleteDoc(
    doc(db, userBasePath(email), "todos", monthStr, "items", todoId)
  );
}
