
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import SubscriptionGuard from "@/components/SubscriptionGuard";
import TrialExpiredOverlay from "@/components/TrialExpiredOverlay";
import DisplayNameModal from "@/components/DisplayNameModal";
import ConnectivityOverlay from "@/components/ConnectivityOverlay";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Despesas from "./pages/Despesas";
import Receitas from "./pages/Receitas";
import ControleContas from "./pages/ControleContas";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import AdminAuth from "./pages/AdminAuth";
import { useAuth } from "@/hooks/useAuth";

const queryClient = new QueryClient();

const AppContent = () => {
  const { showDisplayNameModal, setShowDisplayNameModal, createProfile } = useAuth();

  const handleDisplayNameSubmit = async (displayName: string) => {
    const result = await createProfile(displayName);
    if (!result.error) {
      setShowDisplayNameModal(false);
    }
    return result;
  };

  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <SubscriptionGuard>
              <Index />
            </SubscriptionGuard>
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/despesas" element={
          <ProtectedRoute>
            <SubscriptionGuard>
              <Despesas />
            </SubscriptionGuard>
          </ProtectedRoute>
        } />
        <Route path="/receitas" element={
          <ProtectedRoute>
            <SubscriptionGuard>
              <Receitas />
            </SubscriptionGuard>
          </ProtectedRoute>
        } />
        <Route path="/controle-contas" element={
          <ProtectedRoute>
            <SubscriptionGuard>
              <ControleContas />
            </SubscriptionGuard>
          </ProtectedRoute>
        } />
        <Route path="/admin" element={<AdminAuth />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <TrialExpiredOverlay />
      <ConnectivityOverlay />
      <DisplayNameModal 
        isOpen={showDisplayNameModal} 
        onSubmit={handleDisplayNameSubmit}
      />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
