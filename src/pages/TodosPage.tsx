import { useState, useMemo } from "react";
import { useTodos, useCompleteTodo } from "@/hooks/useFirestore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function TodosPage() {
  const currentMonth = new Date().getMonth() + 1;
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const { data: todos, isLoading } = useTodos(selectedMonth);

  const [completingTodoId, setCompletingTodoId] = useState<string | null>(null);
  const [results, setResults] = useState("");
  const completeTodo = useCompleteTodo();

  const handleComplete = () => {
    if (completingTodoId) {
      completeTodo.mutate(
        { month: selectedMonth, todoId: completingTodoId, results },
        {
          onSuccess: () => {
            setCompletingTodoId(null);
            setResults("");
          }
        }
      );
    }
  };

  const pendingTodos = useMemo(() => todos?.filter(t => !t.is_completed) || [], [todos]);
  const completedTodos = useMemo(() => todos?.filter(t => t.is_completed) || [], [todos]);

  return (
    <div className="page-enter flex flex-col h-[calc(100svh-120px)] bg-canvas-soft max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display font-bold text-2xl text-ink">Todos</h2>
        <div className="w-48">
          <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(Number(v))}>
            <SelectTrigger className="bg-canvas border-none shadow-sm focus:ring-wise-green text-ink font-semibold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-canvas rounded-xl">
              {MONTHS.map((month, idx) => (
                <SelectItem key={idx + 1} value={(idx + 1).toString()}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden pb-20">
        {/* Left Side: Pending Todos */}
        <div className="md:col-span-2 bg-canvas rounded-2xl shadow-sm p-6 overflow-y-auto">
          <h3 className="font-semibold text-ink text-lg mb-4">Pending Tasks</h3>
          {isLoading ? (
            <p className="text-mute">Loading...</p>
          ) : pendingTodos.length === 0 ? (
            <p className="text-mute">No pending todos for this month.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {pendingTodos.map(todo => (
                <div key={todo.id} className="bg-canvas-soft p-4 rounded-xl flex items-start gap-4">
                  <input
                    type="checkbox"
                    className="mt-1 w-5 h-5 rounded-md border-2 border-border checked:bg-wise-green checked:border-wise-green transition-colors cursor-pointer"
                    onChange={() => setCompletingTodoId(todo.id)}
                    checked={false}
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-bold text-ink mb-1">{todo.title}</h4>
                      <span className="text-xs text-mute whitespace-nowrap">
                        {new Date(todo.deadline).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-body">{todo.description}</p>
                    {todo.priority && (
                      <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                        todo.priority === 'high' ? 'bg-negative-bg text-canvas' :
                        todo.priority === 'medium' ? 'bg-warning text-warning-content' :
                        'bg-canvas text-mute border border-border'
                      }`}>
                        {todo.priority}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Totals */}
        <div className="flex flex-col gap-6">
          <div className="bg-canvas rounded-2xl shadow-sm p-6">
            <h3 className="font-semibold text-ink text-lg mb-4">Summary</h3>
            <div className="flex flex-col gap-4">
              <div className="p-4 bg-negative-bg/5 rounded-xl border border-negative/20">
                <p className="text-sm font-semibold text-negative uppercase tracking-wider mb-1">Pending</p>
                <p className="font-display text-4xl font-bold text-ink">{pendingTodos.length}</p>
              </div>
              <div className="p-4 bg-wise-green-pale rounded-xl border border-wise-green-neutral">
                <p className="text-sm font-semibold text-positive-deep uppercase tracking-wider mb-1">Completed</p>
                <p className="font-display text-4xl font-bold text-ink">{completedTodos.length}</p>
              </div>
              <div className="p-4 bg-canvas-soft rounded-xl border border-border/50">
                <p className="text-sm font-semibold text-mute uppercase tracking-wider mb-1">Total</p>
                <p className="font-display text-4xl font-bold text-ink">{todos?.length || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Complete Todo Modal */}
      <Dialog open={completingTodoId !== null} onOpenChange={(open) => !open && setCompletingTodoId(null)}>
        <DialogContent className="sm:max-w-[425px] bg-canvas rounded-2xl border-none shadow-2xl slide-up-center">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold text-ink">Complete Todo</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-body mb-3">Optional: What were the results or aftermath of this task?</p>
            <Textarea
              placeholder="e.g. Sent the email and they replied immediately..."
              value={results}
              onChange={(e) => setResults(e.target.value)}
              className="resize-none h-32 bg-canvas-soft border-none focus-visible:ring-wise-green text-base [field-sizing:fixed] overflow-y-auto"
            />
          </div>
          <DialogFooter>
            <button
              onClick={() => setCompletingTodoId(null)}
              className="px-4 py-2 rounded-xl text-ink font-medium text-sm hover:bg-canvas-soft transition-colors cursor-pointer"
            >
              Skip
            </button>
            <button
              onClick={handleComplete}
              disabled={completeTodo.isPending}
              className="px-6 py-2 rounded-xl bg-wise-green text-ink font-bold text-sm hover:bg-wise-green-hover transition-colors cursor-pointer"
            >
              Complete
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
