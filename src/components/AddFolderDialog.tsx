import { useState } from "react";
import { useCreateFolder } from "@/hooks/useFirestore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function AddFolderDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const createFolder = useCreateFolder();

  const handleSave = () => {
    if (!name.trim()) return;
    createFolder.mutate(name.trim(), {
      onSuccess: () => {
        setName("");
        setOpen(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
          className="p-2 bg-canvas hover:bg-canvas-soft rounded-full text-ink cursor-pointer transition-colors shadow-sm"
          title="Add folder"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            <line x1="12" y1="11" x2="12" y2="17"/>
            <line x1="9" y1="14" x2="15" y2="14"/>
          </svg>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-xl bg-canvas border-none shadow-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-bold text-ink">New Folder</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Input
            id="folder-name"
            placeholder="Folder name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSave();
              }
            }}
            className="w-full text-base"
            autoFocus
          />
        </div>
        <DialogFooter>
          <button
            type="button"
            onClick={handleSave}
            disabled={createFolder.isPending || !name.trim()}
            className="px-6 py-2 rounded-xl bg-wise-green text-ink font-semibold hover:bg-wise-green-hover disabled:opacity-50 transition-colors"
          >
            {createFolder.isPending ? "Saving..." : "Save"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
