import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCreateDailyTask } from "@/hooks/useFirestoreDaily";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function DailyTaskFormPage() {
  const { folderId } = useParams<{ folderId: string }>();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const createTask = useCreateDailyTask();
  const navigate = useNavigate();

  const handleSave = () => {
    if (!title.trim() || !folderId) return;
    createTask.mutate(
      { folderId, title: title.trim(), description: description.trim() },
      { onSuccess: () => navigate(`/daily/${folderId}`) }
    );
  };

  return (
    <div className="page-enter flex flex-col h-[calc(100svh-120px)] bg-canvas rounded-2xl shadow-sm p-6 max-w-2xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-display font-bold text-2xl text-ink">New Daily Task</h2>
      </div>

      <div className="flex flex-col gap-6 flex-1">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-ink">Task Title</label>
          <Input 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            placeholder="e.g. 50 pullups" 
            className="text-lg py-6 bg-canvas-soft border-none focus-visible:ring-wise-green"
          />
        </div>

        <div className="space-y-2 flex-1 flex flex-col">
          <label className="text-sm font-semibold text-ink">Description</label>
          <Textarea 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            placeholder="Optional details..." 
            className="flex-1 bg-canvas-soft border-none focus-visible:ring-wise-green resize-none text-base p-4 [field-sizing:fixed] overflow-y-auto"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button 
          onClick={() => navigate(`/daily/${folderId}`)}
          className="px-6 py-3 rounded-xl font-medium text-ink hover:bg-canvas-soft transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button 
          onClick={handleSave}
          disabled={!title.trim() || createTask.isPending}
          className="px-8 py-3 rounded-xl bg-wise-green text-ink font-bold hover:bg-wise-green-hover transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
        >
          {createTask.isPending ? "Creating..." : "Create Task"}
        </button>
      </div>
    </div>
  );
}
