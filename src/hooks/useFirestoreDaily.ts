import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getDailyFolders, getDailyFolder, createDailyFolder, deleteDailyFolder,
  getDailyTasks, createDailyTask, deleteDailyTask, toggleDailyTaskDay
} from "@/lib/firestoreDaily";
import { useAuth } from "@/contexts/AuthContext";

const STALE_TIME = Infinity;
const GC_TIME = 1000 * 60 * 30;

export function useDailyFolders() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["dailyFolders", user?.email],
    queryFn: () => getDailyFolders(user?.email!),
    enabled: !!user?.email,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
}

export function useDailyFolder(folderId: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["dailyFolder", user?.email, folderId],
    queryFn: () => getDailyFolder(user?.email!, folderId),
    enabled: !!user?.email && !!folderId,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
}

export function useCreateDailyFolder() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { title: string; description: string }) => createDailyFolder(user?.email!, vars.title, vars.description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dailyFolders", user?.email] });
    },
  });
}

export function useDeleteDailyFolder() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (folderId: string) => deleteDailyFolder(user?.email!, folderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dailyFolders", user?.email] });
    },
  });
}

export function useDailyTasks(folderId: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["dailyTasks", user?.email, folderId],
    queryFn: () => getDailyTasks(user?.email!, folderId),
    enabled: !!user?.email && !!folderId,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
}

export function useCreateDailyTask() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { folderId: string; title: string; description: string }) => createDailyTask(user?.email!, vars.folderId, vars.title, vars.description),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["dailyTasks", user?.email, vars.folderId] });
    },
  });
}

export function useDeleteDailyTask() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { folderId: string; taskId: string }) => deleteDailyTask(user?.email!, vars.folderId, vars.taskId),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["dailyTasks", user?.email, vars.folderId] });
    },
  });
}

export function useToggleDailyTaskDay() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { folderId: string; taskId: string; dayStr: string; completedDays: string[]; completedTimes: Record<string, string> }) => 
      toggleDailyTaskDay(user?.email!, vars.folderId, vars.taskId, vars.dayStr, vars.completedDays, vars.completedTimes),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["dailyTasks", user?.email, vars.folderId] });
    },
  });
}
