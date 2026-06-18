import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/theme-provider";

// Pages & Layout
import AppLayout from "@/layouts/AppLayout";
import LandingPage from "@/pages/LandingPage";
import NotesPage from "@/pages/NotesPage";
import NoteFormPage from "@/pages/NoteFormPage";
import TodosPage from "@/pages/TodosPage";
import TodoFormPage from "@/pages/TodoFormPage";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-svh flex items-center justify-center bg-canvas-soft">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-svh flex items-center justify-center bg-canvas-soft">Loading...</div>;
  }
  
  if (user) {
    const lastPage = localStorage.getItem("lastPage") || "/notes";
    return <Navigate to={lastPage} replace />;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route 
                path="/" 
                element={
                  <PublicRoute>
                    <LandingPage />
                  </PublicRoute>
                } 
              />
              
              <Route 
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                {/* Notes Routes */}
                <Route path="/notes" element={<NotesPage />} />
                <Route path="/notes/new" element={<NoteFormPage />} />
                <Route path="/notes/:folderId/:noteId" element={<NoteFormPage />} />
                
                {/* Todos Routes */}
                <Route path="/todos" element={<TodosPage />} />
                <Route path="/todos/new" element={<TodoFormPage />} />
                
                {/* Catch all */}
                <Route path="*" element={<Navigate to="/notes" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
