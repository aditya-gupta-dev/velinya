import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateTodo } from "@/hooks/useFirestore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function TodoFormPage() {
  const navigate = useNavigate();
  const createTodo = useCreateTodo();

  // Default date is today
  const today = new Date().toISOString().split("T")[0];
  const [deadline, setDeadline] = useState(today);
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSave = () => {
    if (!title.trim() || !deadline) {
      alert("Please provide a title and deadline.");
      return;
    }

    const month = new Date(deadline).getMonth() + 1; // 1-12

    createTodo.mutate(
      {
        month,
        data: {
          title,
          description,
          deadline,
          priority,
        },
      },
      {
        onSuccess: () => navigate("/todos"),
      }
    );
  };

  return (
    <div className="page-enter flex flex-col h-[calc(100svh-120px)] bg-canvas p-6 rounded-2xl shadow-sm max-w-3xl mx-auto w-full">
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div className="flex gap-4 flex-wrap">
          <div className="w-40">
            <Input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="bg-canvas-soft border-none focus-visible:ring-wise-green text-ink"
            />
          </div>
          <div className="w-32">
            <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
              <SelectTrigger className="bg-canvas-soft border-none focus:ring-wise-green text-ink">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent className="bg-canvas rounded-xl">
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => navigate("/todos")}
            className="px-4 py-2 rounded-xl bg-canvas-soft text-ink font-medium text-sm hover:bg-border/50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={createTodo.isPending || !title.trim() || !deadline}
            className="px-6 py-2 rounded-xl bg-wise-green text-ink font-bold text-sm hover:bg-wise-green-hover disabled:opacity-50 transition-colors"
          >
            Save Todo
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4 flex-1">
        <Input
          placeholder="Todo Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-2xl font-bold font-display bg-canvas-soft px-4 py-3 rounded-xl border-none focus-visible:ring-2 focus-visible:ring-wise-green shadow-sm placeholder:text-mute h-16"
        />
        <Textarea
          placeholder="Describe the task..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="flex-1 resize-none overflow-y-auto [field-sizing:fixed] bg-canvas-soft px-4 py-4 rounded-xl border-none focus-visible:ring-2 focus-visible:ring-wise-green shadow-sm text-base text-body placeholder:text-mute"
        />
      </div>
    </div>
  );
}
