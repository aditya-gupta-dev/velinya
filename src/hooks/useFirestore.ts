import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getFolders,
  createFolder,
  deleteFolder,
  getNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
  getTodos,
  createTodo,
  completeTodo,
  updateTodo,
  deleteTodo,
  type Folder,
  type Note,
  type Todo,
} from "@/lib/firestore";
import { useAuth } from "@/contexts/AuthContext";

// ─── Shared query config ──────────────────────────────────────────────────────

const STALE_TIME = Infinity;
const GC_TIME = 1000 * 60 * 30; // 30 minutes

// ─── Folders ──────────────────────────────────────────────────────────────────

export function useFolders() {
  const { user } = useAuth();
  const email = user?.email;

  return useQuery<Folder[]>({
    queryKey: ["folders", email],
    queryFn: () => getFolders(email!),
    enabled: !!email,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
}

export function useCreateFolder() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const email = user?.email;

  return useMutation({
    mutationFn: (name: string) => createFolder(email!, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders", email] });
    },
  });
}

export function useDeleteFolder() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const email = user?.email;

  return useMutation({
    mutationFn: (folderId: string) => deleteFolder(email!, folderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders", email] });
    },
  });
}

// ─── Notes ────────────────────────────────────────────────────────────────────

export function useNotes(folderId: string) {
  const { user } = useAuth();
  const email = user?.email;

  return useQuery<Note[]>({
    queryKey: ["notes", email, folderId],
    queryFn: () => getNotes(email!, folderId),
    enabled: !!email,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
}

export function useNote(folderId: string, noteId: string) {
  const { user } = useAuth();
  const email = user?.email;

  return useQuery<Note | null>({
    queryKey: ["note", email, folderId, noteId],
    queryFn: () => getNote(email!, folderId, noteId),
    enabled: !!email,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
}

export function useCreateNote() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const email = user?.email;

  return useMutation({
    mutationFn: (vars: { folderId: string; title: string; description: string }) =>
      createNote(email!, vars.folderId, vars.title, vars.description),
    onSuccess: (_id, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["notes", email, vars.folderId],
      });
    },
  });
}

export function useUpdateNote() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const email = user?.email;

  return useMutation({
    mutationFn: (vars: {
      folderId: string;
      noteId: string;
      data: { title?: string; description?: string };
    }) => updateNote(email!, vars.folderId, vars.noteId, vars.data),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["notes", email, vars.folderId],
      });
      queryClient.invalidateQueries({
        queryKey: ["note", email, vars.folderId, vars.noteId],
      });
    },
  });
}

export function useDeleteNote() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const email = user?.email;

  return useMutation({
    mutationFn: (vars: { folderId: string; noteId: string }) =>
      deleteNote(email!, vars.folderId, vars.noteId),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["notes", email, vars.folderId],
      });
    },
  });
}

// ─── Todos ────────────────────────────────────────────────────────────────────

export function useTodos(month: number) {
  const { user } = useAuth();
  const email = user?.email;

  return useQuery<Todo[]>({
    queryKey: ["todos", email, month],
    queryFn: () => getTodos(email!, month),
    enabled: !!email,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
}

export function useCreateTodo() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const email = user?.email;

  return useMutation({
    mutationFn: (vars: {
      month: number;
      data: {
        title: string;
        description: string;
        deadline: string;
        priority: "low" | "medium" | "high";
      };
    }) => createTodo(email!, vars.month, vars.data),
    onSuccess: (_id, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["todos", email, vars.month],
      });
    },
  });
}

export function useCompleteTodo() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const email = user?.email;

  return useMutation({
    mutationFn: (vars: { month: number; todoId: string; results: string }) =>
      completeTodo(email!, vars.month, vars.todoId, vars.results),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["todos", email, vars.month],
      });
    },
  });
}

export function useUpdateTodo() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const email = user?.email;

  return useMutation({
    mutationFn: (vars: {
      month: number;
      todoId: string;
      data: Partial<Omit<Todo, "id" | "created_at" | "updated_at">>;
    }) => updateTodo(email!, vars.month, vars.todoId, vars.data),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["todos", email, vars.month],
      });
    },
  });
}

export function useDeleteTodo() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const email = user?.email;

  return useMutation({
    mutationFn: (vars: { month: number; todoId: string }) =>
      deleteTodo(email!, vars.month, vars.todoId),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["todos", email, vars.month],
      });
    },
  });
}
