import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFolders, useNotes } from "@/hooks/useFirestore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function NotesPage() {
  const { data: folders, isLoading: foldersLoading } = useFolders();
  const [selectedFolder, setSelectedFolder] = useState<string | null>(() => {
    return localStorage.getItem("lastViewedFolder");
  });
  
  const navigate = useNavigate();
  const folderId = selectedFolder || (folders?.[0]?.id ?? null);

  useEffect(() => {
    if (folderId) {
      localStorage.setItem("lastViewedFolder", folderId);
    }
  }, [folderId]);
  
  const { data: notes, isLoading: notesLoading } = useNotes(folderId ?? "");

  return (
    <div className="page-enter flex flex-col md:flex-row gap-6 h-[calc(100svh-120px)]">
      {/* Mobile Folder Selector */}
      <div className="md:hidden w-full flex flex-col gap-2 shrink-0">
        <h2 className="font-display font-bold text-xl text-ink">Folders</h2>
        {foldersLoading ? (
          <div className="text-mute">Loading folders...</div>
        ) : folders?.length === 0 ? (
          <div className="text-mute text-sm bg-canvas p-4 rounded-xl">No folders yet. Click the + icon above to create one.</div>
        ) : (
          <Select value={folderId || ""} onValueChange={(v) => v && setSelectedFolder(v as string)}>
            <SelectTrigger className="w-full bg-canvas border-none focus-visible:ring-wise-green text-ink h-12 rounded-xl text-base px-4 font-medium shadow-sm">
              <SelectValue placeholder="Select folder" />
            </SelectTrigger>
            <SelectContent className="bg-canvas rounded-xl">
              {folders?.map((folder) => (
                <SelectItem key={folder.id} value={folder.id}>
                  {folder.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Desktop Sidebar - Folders */}
      <div className="hidden md:flex w-64 flex-col gap-2 shrink-0">
        <h2 className="font-display font-bold text-xl text-ink mb-2">Folders</h2>
        {foldersLoading ? (
          <div className="text-mute">Loading folders...</div>
        ) : folders?.length === 0 ? (
          <div className="text-mute text-sm bg-canvas p-4 rounded-xl">No folders yet. Click the + icon above to create one.</div>
        ) : (
          <div className="flex flex-col gap-2 overflow-y-auto pr-2 pb-10">
            {folders?.map((folder) => (
              <button
                key={folder.id}
                onClick={() => setSelectedFolder(folder.id)}
                className={`text-left px-4 py-3 rounded-xl transition-colors font-medium text-sm
                  ${folderId === folder.id 
                    ? "bg-wise-green text-ink shadow-sm" 
                    : "bg-canvas text-body hover:bg-canvas-soft border border-border/50"
                  }`}
              >
                {folder.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Area - Notes List */}
      <div className="flex-1 flex flex-col min-w-0 bg-canvas rounded-2xl p-6 shadow-sm">
        <h2 className="font-display font-bold text-2xl text-ink mb-4 hidden md:block">
          {folders?.find((f) => f.id === folderId)?.name || "Notes"}
        </h2>
        
        {notesLoading && folderId ? (
          <div className="text-mute">Loading notes...</div>
        ) : !folderId ? (
          <div className="text-mute flex items-center justify-center h-full text-center max-w-xs mx-auto">
            Select or create a folder to view notes.
          </div>
        ) : notes?.length === 0 ? (
          <div className="text-mute flex items-center justify-center h-full text-center">
            No notes in this folder. Tap the button below to create one.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto pb-20">
            {notes?.map((note) => (
              <div
                key={note.id}
                onClick={() => navigate(`/notes/${folderId}/${note.id}`)}
                className="bg-canvas-soft p-4 rounded-xl cursor-pointer hover:ring-2 hover:ring-wise-green transition-all group flex flex-col"
              >
                <h3 className="font-bold text-ink text-lg line-clamp-1 mb-1">{note.title || "Untitled"}</h3>
                <p className="text-body text-sm line-clamp-3 mb-3 flex-1 whitespace-pre-wrap">
                  {note.description || "No description"}
                </p>
                <div className="text-xs text-mute mt-auto">
                  {note.updated_at.toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
