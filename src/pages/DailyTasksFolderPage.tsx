import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDailyFolder, useDailyTasks, useToggleDailyTaskDay } from "@/hooks/useFirestoreDaily";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { DailyTask } from "@/lib/firestoreDaily";

export default function DailyTasksFolderPage() {
  const { folderId } = useParams<{ folderId: string }>();
  const navigate = useNavigate();
  const { data: folder, isLoading: folderLoading } = useDailyFolder(folderId || "");
  const { data: tasks, isLoading: tasksLoading } = useDailyTasks(folderId || "");
  const toggleDay = useToggleDailyTaskDay();

  const [selectedTask, setSelectedTask] = useState<DailyTask | null>(null);

  // Calculate days to show
  let daysArray: number[] = [];
  let startDate = new Date();
  
  if (folder) {
    startDate = new Date(folder.created_at);
    startDate.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diffTime = today.getTime() - startDate.getTime();
    const diffDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
    
    const daysToShow = diffDays + 1;
    daysArray = Array.from({ length: daysToShow }, (_, i) => i + 1);
  }

  const handleToggle = (taskId: string, day: number, currentCompleted: string[], currentTimes: Record<string, string> = {}) => {
    if (!folderId || !folder) return;
    
    const cellDate = new Date(startDate);
    cellDate.setDate(cellDate.getDate() + (day - 1));
    const dateStr = `${cellDate.getFullYear()}-${String(cellDate.getMonth() + 1).padStart(2, '0')}-${String(cellDate.getDate()).padStart(2, '0')}`;
    
    toggleDay.mutate({
      folderId,
      taskId,
      dayStr: dateStr,
      completedDays: currentCompleted,
      completedTimes: currentTimes
    });
  };

  const graphData = useMemo(() => {
    if (!selectedTask || !selectedTask.completed_times) return [];
    const data = [];
    const sortedDates = Object.keys(selectedTask.completed_times).sort();
    for (const dateStr of sortedDates) {
      const timeStr = selectedTask.completed_times[dateStr];
      if (!timeStr) continue;
      const [h, m] = timeStr.split(':');
      const timeValue = parseInt(h) + parseInt(m) / 60;
      const d = new Date(dateStr);
      const dayName = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      data.push({
        day: dayName,
        timeValue,
        timeString: timeStr
      });
    }
    return data;
  }, [selectedTask]);

  const completedDaysCount = selectedTask?.completed_days.length || 0;
  const totalDaysCount = daysArray.length;
  const uncompletedDaysCount = Math.max(0, totalDaysCount - completedDaysCount);

  if (folderLoading || tasksLoading) return <div className="p-10 text-mute">Loading...</div>;
  if (!folder) return <div className="p-10 text-negative">Folder not found</div>;

  return (
    <div className="page-enter flex flex-col h-[calc(100svh-120px)] bg-canvas rounded-2xl shadow-sm max-w-5xl mx-auto w-full overflow-hidden border border-border/50">
      
      {/* Scrollable container for the grid */}
      <div className="flex-1 overflow-x-auto overflow-y-auto">
        <table className="border-collapse">
          <thead>
            <tr>
              <th className="sticky left-0 top-0 z-20 bg-canvas-soft border-b border-r border-border/50 p-2 sm:p-4 text-left align-middle">
                <div className="w-24 sm:w-36">
                  <h2 className="font-display font-bold text-base sm:text-lg text-ink truncate" title={folder.title}>{folder.title}</h2>
                </div>
              </th>
              {daysArray.map(day => (
                <th key={day} className="sticky top-0 z-10 bg-canvas-soft border-b border-border/50 p-2 sm:p-4 text-center min-w-12 sm:min-w-16">
                  <span className="font-display font-bold text-ink">{day}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tasks?.map(task => (
              <tr key={task.id}>
                <td className="sticky left-0 z-10 bg-canvas border-b border-r border-border/50 p-2 sm:p-4 align-middle">
                  <div className="w-24 sm:w-36">
                    <h3 
                      className="font-semibold text-sm sm:text-base text-ink truncate cursor-pointer hover:underline decoration-border underline-offset-2" 
                      title={task.title}
                      onClick={() => setSelectedTask(task as DailyTask)}
                    >
                      {task.title}
                    </h3>
                    {task.description && <p className="text-xs text-body truncate mt-1" title={task.description}>{task.description}</p>}
                  </div>
                </td>
                {daysArray.map(day => {
                  const cellDate = new Date(startDate);
                  cellDate.setDate(cellDate.getDate() + (day - 1));
                  const dateStr = `${cellDate.getFullYear()}-${String(cellDate.getMonth() + 1).padStart(2, '0')}-${String(cellDate.getDate()).padStart(2, '0')}`;
                  
                  const isCompleted = task.completed_days.includes(dateStr);
                  
                  const todayDate = new Date();
                  todayDate.setHours(0,0,0,0);
                  const isPastOrToday = cellDate <= todayDate;
                  
                  let bgClass = "bg-transparent hover:bg-canvas-soft";
                  if (isCompleted) {
                    bgClass = "bg-positive hover:bg-positive-deep";
                  } else if (isPastOrToday) {
                    bgClass = "bg-negative hover:bg-negative-deep opacity-80 hover:opacity-100";
                  }
                  
                  const isUpdating = toggleDay.isPending && 
                    toggleDay.variables?.taskId === task.id && 
                    toggleDay.variables?.dayStr === dateStr;
                  
                  return (
                    <td key={day} className="border-b border-r border-border/50 p-0 h-16 sm:h-20 min-w-12 sm:min-w-16">
                      <button
                        onClick={() => handleToggle(task.id, day, task.completed_days, task.completed_times)}
                        disabled={isUpdating}
                        className={`w-full h-full cursor-pointer transition-colors flex items-center justify-center ${bgClass} ${isUpdating ? 'opacity-80' : ''}`}
                        title={dateStr}
                        aria-label={`Toggle task completion for ${dateStr}`}
                      >
                        {isUpdating && <Loader2 className={`w-5 h-5 animate-spin ${isCompleted || isPastOrToday ? 'text-canvas' : 'text-ink/60'}`} />}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
            
            {tasks?.length === 0 && (
              <tr>
                <td colSpan={daysArray.length + 1} className="p-8 text-center text-mute border-b border-border/50">
                  No tasks added yet. Click the + button to add one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-border/50 bg-canvas-soft flex justify-between items-center text-sm text-mute">
        <span className="font-medium">Started at: {new Date(folder.created_at).toLocaleDateString()}</span>
        <button onClick={() => navigate("/daily")} className="hover:text-ink transition-colors cursor-pointer font-medium">
          ← Back to Folders
        </button>
      </div>

      <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <DialogContent className="max-w-xl w-full mx-4 sm:mx-auto">
          {selectedTask && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-display">{selectedTask.title}</DialogTitle>
                {selectedTask.description && (
                  <p className="text-sm text-mute mt-1">{selectedTask.description}</p>
                )}
              </DialogHeader>

              <div className="grid grid-cols-2 gap-4 my-4">
                <div className="bg-canvas-soft border border-border p-4 rounded-xl flex flex-col">
                  <span className="text-sm text-mute font-medium">Completed</span>
                  <span className="text-2xl font-display font-bold text-positive">{completedDaysCount} days</span>
                </div>
                <div className="bg-canvas-soft border border-border p-4 rounded-xl flex flex-col">
                  <span className="text-sm text-mute font-medium">Uncompleted</span>
                  <span className="text-2xl font-display font-bold text-negative">{uncompletedDaysCount} days</span>
                </div>
              </div>

              {graphData.length > 0 ? (
                <div className="h-64 w-full mt-4 bg-canvas-soft rounded-xl border border-border p-4 flex flex-col">
                  <h4 className="text-sm font-semibold mb-4 text-ink">Completion Time Trend</h4>
                  <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={graphData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--positive)" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="var(--positive)" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                        <XAxis dataKey="day" stroke="var(--mute)" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis 
                          domain={[0, 24]} 
                          stroke="var(--mute)" 
                          fontSize={12} 
                          tickLine={false} 
                          axisLine={false}
                          tickFormatter={(v) => `${v}h`} 
                        />
                        <RechartsTooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-canvas border border-border p-2 rounded-lg shadow-sm">
                                  <p className="font-semibold text-ink text-sm">{payload[0].payload.day}</p>
                                  <p className="text-positive text-sm font-medium">{payload[0].payload.timeString}</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Area type="monotone" dataKey="timeValue" stroke="var(--positive)" fillOpacity={1} fill="url(#colorTime)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <div className="h-32 mt-4 bg-canvas-soft rounded-xl border border-border flex items-center justify-center text-mute text-sm">
                  Not enough data for chart yet.
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
