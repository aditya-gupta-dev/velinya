import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  // Dialog state for day view
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  
  // Dialog state for completing a todo
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

  // Grid calculation
  const daysInMonth = new Date(new Date().getFullYear(), selectedMonth, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const todosByDay = useMemo(() => {
    const map = new Map<number, typeof todos>();
    if (!todos) return map;
    todos.forEach(t => {
      // deadline format YYYY-MM-DD
      const date = new Date(t.deadline);
      const day = date.getDate();
      if (date.getMonth() + 1 === selectedMonth) {
        if (!map.has(day)) map.set(day, []);
        map.get(day)?.push(t);
      }
    });
    return map;
  }, [todos, selectedMonth]);

  const selectedDayTodos = selectedDay ? (todosByDay.get(selectedDay) || []) : [];
  const pendingTodos = selectedDayTodos.filter(t => !t.is_completed);
  const completedTodos = selectedDayTodos.filter(t => t.is_completed);

  return (
    <div className="page-enter flex flex-col h-[calc(100svh-120px)] bg-canvas rounded-2xl shadow-sm p-6 max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display font-bold text-2xl text-ink">Todos Calendar</h2>
        <div className="w-48">
          <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(Number(v))}>
            <SelectTrigger className="bg-canvas-soft border-none focus:ring-wise-green text-ink font-semibold">
              {MONTHS[selectedMonth - 1]}
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

      {isLoading ? (
        <div className="text-mute text-center p-10">Loading calendar...</div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-2 pb-20">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3 sm:gap-4">
            {daysArray.map((day) => {
              const dayTodos = todosByDay.get(day) || [];
              const pendingCount = dayTodos.filter(t => !t.is_completed).length;
              const hasTodos = dayTodos.length > 0;
              const isAllDone = hasTodos && pendingCount === 0;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`relative flex flex-col aspect-square p-2 sm:p-3 rounded-2xl transition-all cursor-pointer border ${
                    !hasTodos
                      ? "bg-canvas border-border/50 hover:bg-canvas-soft"
                      : isAllDone
                      ? "bg-wise-green-pale border-wise-green text-ink hover:ring-2 hover:ring-wise-green"
                      : "bg-negative-bg/5 border-negative text-ink hover:ring-2 hover:ring-negative"
                  }`}
                >
                  <span className="font-display font-bold text-lg sm:text-xl">{day}</span>
                  {hasTodos && (
                    <span className="mt-auto text-xs font-semibold sm:text-sm">
                      {isAllDone ? "Done" : `${pendingCount} pending`}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Day View Modal */}
      <Dialog open={selectedDay !== null} onOpenChange={(open) => !open && setSelectedDay(null)}>
        <DialogContent className="sm:max-w-[500px] bg-canvas rounded-2xl border-none shadow-xl max-h-[80svh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl font-bold text-ink">
              {MONTHS[selectedMonth - 1]} {selectedDay}
            </DialogTitle>
          </DialogHeader>

          <div className="py-4 flex flex-col gap-6">
            {selectedDayTodos.length === 0 ? (
              <p className="text-mute text-center">No todos for this day.</p>
            ) : (
              <>
                {pendingTodos.length > 0 && (
                  <div className="flex flex-col gap-3">
                    <h3 className="font-semibold text-ink text-sm uppercase tracking-wider text-mute">Pending</h3>
                    {pendingTodos.map(todo => (
                      <div key={todo.id} className="bg-canvas-soft p-4 rounded-xl flex items-start gap-4">
                        <input
                          type="checkbox"
                          className="mt-1 w-5 h-5 rounded-md border-2 border-border checked:bg-wise-green checked:border-wise-green transition-colors cursor-pointer"
                          onChange={() => setCompletingTodoId(todo.id)}
                          checked={false}
                        />
                        <div className="flex-1">
                          <h4 className="font-bold text-ink mb-1">{todo.title}</h4>
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
                
                {completedTodos.length > 0 && (
                  <div className="flex flex-col gap-3">
                    <h3 className="font-semibold text-ink text-sm uppercase tracking-wider text-mute">Completed</h3>
                    {completedTodos.map(todo => (
                      <div key={todo.id} className="bg-canvas p-4 rounded-xl border border-border/50 opacity-75">
                        <h4 className="font-bold text-ink line-through mb-1">{todo.title}</h4>
                        <p className="text-sm text-body">{todo.description}</p>
                        {todo.results && (
                          <div className="mt-3 p-3 bg-wise-green-pale rounded-lg text-sm text-ink-deep border border-wise-green-neutral">
                            <span className="font-semibold block mb-1">Results:</span>
                            {todo.results}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

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
              className="resize-none h-32 bg-canvas-soft border-none focus-visible:ring-wise-green text-base"
            />
          </div>
          <DialogFooter>
            <button
              onClick={() => setCompletingTodoId(null)}
              className="px-4 py-2 rounded-xl text-ink font-medium text-sm hover:bg-canvas-soft transition-colors"
            >
              Skip
            </button>
            <button
              onClick={handleComplete}
              disabled={completeTodo.isPending}
              className="px-6 py-2 rounded-xl bg-wise-green text-ink font-bold text-sm hover:bg-wise-green-hover transition-colors"
            >
              Complete
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
