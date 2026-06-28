import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateDailyFolder } from "@/hooks/useFirestoreDaily";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function DailyFolderFormPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const createFolder = useCreateDailyFolder();
  const navigate = useNavigate();

  const handleSave = () => {
    if (!title.trim()) return;
    createFolder.mutate(
      { title: title.trim(), description: description.trim() },
      { onSuccess: () => navigate("/daily") }
    );
  };

  return (
    <div className="page-enter flex flex-col h-[calc(100svh-120px)] bg-canvas rounded-2xl shadow-sm p-6 max-w-2xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-display font-bold text-2xl text-ink">New Daily Folder</h2>
      </div>

      <div className="flex flex-col gap-6 flex-1">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-ink">Folder Title</label>
          <Input 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            placeholder="e.g. Self Improvement" 
            className="text-lg py-6 bg-canvas-soft border-none focus-visible:ring-wise-green"
          />
        </div>

        <div className="space-y-2 flex-1 flex flex-col">
          <label className="text-sm font-semibold text-ink">Description</label>
          <Textarea 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            placeholder="What kind of daily tasks go here?" 
            className="flex-1 bg-canvas-soft border-none focus-visible:ring-wise-green resize-none text-base p-4 [field-sizing:fixed] overflow-y-auto"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button 
          onClick={() => navigate("/daily")}
          className="px-6 py-3 rounded-xl font-medium text-ink hover:bg-canvas-soft transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button 
          onClick={handleSave}
          disabled={!title.trim() || createFolder.isPending}
          className="px-8 py-3 rounded-xl bg-wise-green text-ink font-bold hover:bg-wise-green-hover transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
        >
          {createFolder.isPending ? "Creating..." : "Create Folder"}
        </button>
      </div>
    </div>
  );
}
