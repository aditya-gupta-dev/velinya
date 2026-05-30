import { useState, useRef, useCallback, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AddFolderDialog } from "@/components/AddFolderDialog";

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const isNotesMode = !location.pathname.startsWith("/todos");
  const currentMode = isNotesMode ? "notes" : "todos";

  // FAB scroll visibility
  const [fabVisible, setFabVisible] = useState(true);
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleScroll = useCallback(() => {
    setFabVisible(false);
    if (scrollTimer.current) clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(() => {
      setFabVisible(true);
    }, 300);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimer.current) clearTimeout(scrollTimer.current);
    };
  }, [handleScroll]);

  const handleModeSwitch = (mode: string) => {
    if (mode === "notes") navigate("/notes");
    else navigate("/todos");
  };

  const handleFabClick = () => {
    if (currentMode === "notes") navigate("/notes/new");
    else navigate("/todos/new");
  };

  // Check if we're on a sub-page (new note, new todo, note detail) where FAB should be hidden
  const isSubPage =
    location.pathname === "/notes/new" ||
    location.pathname === "/todos/new" ||
    (location.pathname.startsWith("/notes/") &&
      location.pathname.split("/").length > 3);

  return (
    <div className="min-h-svh bg-canvas-soft flex flex-col">
      {/* ─── Top Bar ────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-canvas border-b border-border/60 px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          {/* Left: Mode dropdown + folder add (notes) */}
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger
                  id="mode-switcher"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-canvas-soft hover:bg-wise-green-pale text-ink font-semibold text-sm transition-colors cursor-pointer"
                >
                  {currentMode === "notes" ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                      <polyline points="10 9 9 9 8 9"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                  )}
                  {currentMode === "notes" ? "Notes" : "Todos"}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="rounded-xl">
                <DropdownMenuItem
                  onClick={() => handleModeSwitch("notes")}
                  className="rounded-lg gap-2 cursor-pointer"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                  Notes
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleModeSwitch("todos")}
                  className="rounded-lg gap-2 cursor-pointer"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  Todos
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Add folder button — only on notes mode, only on notes list page */}
            {currentMode === "notes" && !isSubPage && <AddFolderDialog />}
          </div>

          {/* Right: User avatar */}
          <DropdownMenu>
            <DropdownMenuTrigger
              id="user-avatar-btn" 
              className="cursor-pointer rounded-full ring-2 ring-transparent hover:ring-wise-green transition-all"
            >
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.photoURL ?? undefined} alt={user?.displayName ?? "User"} />
                  <AvatarFallback className="bg-wise-green text-ink font-semibold text-sm">
                    {user?.displayName?.charAt(0)?.toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl w-48">
              <div className="px-3 py-2 border-b border-border/60">
                <p className="text-sm font-semibold text-ink truncate">{user?.displayName}</p>
                <p className="text-xs text-mute truncate">{user?.email}</p>
              </div>
              <DropdownMenuItem
                onClick={toggleTheme}
                className="rounded-lg cursor-pointer mt-1 font-medium"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  {theme === "light" ? (
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  ) : (
                    <>
                      <circle cx="12" cy="12" r="5" />
                      <line x1="12" y1="1" x2="12" y2="3" />
                      <line x1="12" y1="21" x2="12" y2="23" />
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                      <line x1="1" y1="12" x2="3" y2="12" />
                      <line x1="21" y1="12" x2="23" y2="12" />
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                    </>
                  )}
                </svg>
                {theme === "light" ? "Dark Mode" : "Light Mode"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={logout}
                className="rounded-lg text-negative cursor-pointer font-medium"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* ─── Main Content ───────────────────────────────────── */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <Outlet />
      </main>

      {/* ─── Floating Action Button ─────────────────────────── */}
      {!isSubPage && (
        <div className="fixed bottom-6 right-0 left-0 z-50 pointer-events-none flex justify-end max-w-5xl mx-auto px-4 sm:px-6">
          <button
            id="fab-button"
            onClick={handleFabClick}
            className={`w-16 h-16 md:w-20 md:h-20 rounded-full shadow-xl
                       bg-wise-green hover:bg-wise-green-hover active:scale-95
                       flex items-center justify-center pointer-events-auto
                       transition-all duration-200 cursor-pointer overflow-hidden
                       ${fabVisible ? "fab-visible" : "fab-hidden"}`}
          >
            <img src="/app-icon.jpg" alt="Create" className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover" />
          </button>
        </div>
      )}
    </div>
  );
}
