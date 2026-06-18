import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useFolders, useNote, useCreateNote, useUpdateNote, useDeleteNote } from "@/hooks/useFirestore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function NoteFormPage() {
  const { folderId, noteId } = useParams();
  const isEditing = !!noteId;
  const navigate = useNavigate();

  const { data: folders, isLoading: foldersLoading } = useFolders();
  const { data: note, isLoading: noteLoading } = useNote(folderId ?? "", noteId ?? "");
  
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();

  const [selectedFolder, setSelectedFolder] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (isEditing && note) {
      setTitle(note.title);
      setDescription(note.description);
      setSelectedFolder(note.folder);
    } else if (!isEditing && folderId) {
      setSelectedFolder(folderId);
    } else if (!isEditing && folders && folders.length > 0 && !selectedFolder) {
      const lastUploadFolder = localStorage.getItem("lastUploadFolder");
      if (lastUploadFolder && folders.some(f => f.id === lastUploadFolder)) {
        setSelectedFolder(lastUploadFolder);
      } else {
        setSelectedFolder(folders[0].id);
      }
    }
  }, [note, isEditing, folderId, folders, selectedFolder]);

  const handleSave = () => {
    if (!selectedFolder || !title.trim() || !description.trim()) {
      alert("Please provide a folder, title, and description.");
      return;
    }

    localStorage.setItem("lastUploadFolder", selectedFolder);

    if (isEditing && noteId) {
      updateNote.mutate(
        { folderId: selectedFolder, noteId, data: { title, description } },
        { onSuccess: () => navigate("/notes") }
      );
    } else {
      createNote.mutate(
        { folderId: selectedFolder, title, description },
        { onSuccess: () => navigate("/notes") }
      );
    }
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this note?") && noteId && selectedFolder) {
      deleteNote.mutate(
        { folderId: selectedFolder, noteId },
        { onSuccess: () => navigate("/notes") }
      );
    }
  };

  if (foldersLoading || (isEditing && noteLoading)) {
    return <div className="p-6 text-mute">Loading...</div>;
  }

  return (
    <div className="page-enter flex flex-col h-[calc(100svh-120px)] bg-canvas p-6 rounded-2xl shadow-sm max-w-3xl mx-auto w-full">
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div className="w-48">
          <Select value={selectedFolder} onValueChange={(v) => v && setSelectedFolder(v as string)} disabled={isEditing}>
            <SelectTrigger className="bg-canvas-soft border-none focus:ring-wise-green text-ink">
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
        </div>
        
        <div className="flex gap-2">
          {isEditing && (
            <button
              onClick={handleDelete}
              disabled={deleteNote.isPending}
              className="px-4 py-2 rounded-xl text-negative border border-negative/20 hover:bg-negative-bg transition-colors font-medium text-sm"
            >
              Delete
            </button>
          )}
          <button
            onClick={() => navigate("/notes")}
            className="px-4 py-2 rounded-xl bg-canvas-soft text-ink font-medium text-sm hover:bg-border/50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={createNote.isPending || updateNote.isPending || !selectedFolder || !title.trim() || !description.trim()}
            className="px-6 py-2 rounded-xl bg-wise-green text-ink font-bold text-sm hover:bg-wise-green-hover disabled:opacity-50 transition-colors"
          >
            Save Note
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4 flex-1">
        <Input
          placeholder="Note Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-2xl font-bold font-display bg-canvas-soft px-4 py-3 rounded-xl border-none focus-visible:ring-2 focus-visible:ring-wise-green shadow-sm placeholder:text-mute h-16"
        />
        <Textarea
          placeholder="Write your note here..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="flex-1 resize-none overflow-y-auto [field-sizing:fixed] bg-canvas-soft px-4 py-4 rounded-xl border-none focus-visible:ring-2 focus-visible:ring-wise-green shadow-sm text-base text-body placeholder:text-mute"
        />
      </div>
    </div>
  );
}
