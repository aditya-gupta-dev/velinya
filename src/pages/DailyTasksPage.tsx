import { useNavigate } from "react-router-dom";
import { useDailyFolders } from "@/hooks/useFirestoreDaily";

export default function DailyTasksPage() {
  const { data: folders, isLoading } = useDailyFolders();
  const navigate = useNavigate();

  return (
    <div className="page-enter flex flex-col h-[calc(100svh-120px)] bg-canvas-soft max-w-5xl mx-auto w-full pb-20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display font-bold text-2xl text-ink">Daily Tasks</h2>
      </div>
      
      {isLoading ? (
        <p className="text-mute">Loading...</p>
      ) : folders?.length === 0 ? (
        <div className="text-center p-10 bg-canvas rounded-2xl border border-border shadow-sm">
          <p className="text-mute mb-2">No daily folders yet.</p>
          <p className="text-sm text-body">Use the + button to create one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {folders?.map(folder => (
            <button
              key={folder.id}
              onClick={() => navigate(`/daily/${folder.id}`)}
              className="bg-canvas p-5 rounded-2xl border border-border shadow-sm hover:border-wise-green hover:shadow-md transition-all text-left group cursor-pointer"
            >
              <h3 className="font-display font-bold text-xl text-ink group-hover:text-wise-green mb-2">{folder.title}</h3>
              <p className="text-sm text-body line-clamp-2">{folder.description}</p>
              <div className="mt-4 text-xs text-mute">
                Started {new Date(folder.created_at).toLocaleDateString()}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
