import React, { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "@/pages/Landing";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Leaderboard from "@/pages/Leaderboard";
import AdminRewards from "@/pages/AdminRewards";
import Options from "@/pages/Options";
import Marketplace from "@/pages/Marketplace";
import Rewards from "@/pages/Rewards";
import Roadmap from "@/pages/Roadmap";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import GameProviders from "@/providers/GameProviders";

const GAME_ACCESS_KEY = 'nebula_cascade_game_access';
const queryClient = new QueryClient();

const GameShell = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <GameProviders>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {children}
      </TooltipProvider>
    </GameProviders>
  </QueryClientProvider>
);

const GameGuard = ({ children }: { children: React.ReactNode }) => {
  const [accessState, setAccessState] = useState<'pending' | 'authorized' | 'denied'>('pending');

  useEffect(() => {
    const unlocked = typeof window !== 'undefined' && sessionStorage.getItem(GAME_ACCESS_KEY) === 'true';
    setAccessState(unlocked ? 'authorized' : 'denied');
  }, []);

  if (accessState === 'pending') return null;
  if (accessState === 'denied') return <Navigate to="/film" replace />;
  return <>{children}</>;
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/game"
          element={
            <GameGuard>
              <GameShell>
                <Index />
              </GameShell>
            </GameGuard>
          }
        />
        <Route
          path="/auth"
          element={
            <GameGuard>
              <GameShell>
                <Auth />
              </GameShell>
            </GameGuard>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <GameGuard>
              <GameShell>
                <Leaderboard />
              </GameShell>
            </GameGuard>
          }
        />
        <Route
          path="/admin/rewards"
          element={
            <GameGuard>
              <GameShell>
                <ProtectedRoute requireAdmin>
                  <AdminRewards />
                </ProtectedRoute>
              </GameShell>
            </GameGuard>
          }
        />
        <Route
          path="/cards"
          element={
            <GameGuard>
              <GameShell>
                <Navigate to="/marketplace" replace />
              </GameShell>
            </GameGuard>
          }
        />
        <Route
          path="/wallet"
          element={
            <GameGuard>
              <GameShell>
                <Navigate to="/marketplace" replace />
              </GameShell>
            </GameGuard>
          }
        />
        <Route
          path="/options"
          element={
            <GameGuard>
              <GameShell>
                <Options />
              </GameShell>
            </GameGuard>
          }
        />
        <Route
          path="/marketplace"
          element={
            <GameGuard>
              <GameShell>
                <Marketplace />
              </GameShell>
            </GameGuard>
          }
        />
        <Route
          path="/rules"
          element={
            <GameGuard>
              <GameShell>
                <Navigate to="/rewards" replace />
              </GameShell>
            </GameGuard>
          }
        />
        <Route
          path="/rewards"
          element={
            <GameGuard>
              <GameShell>
                <Rewards />
              </GameShell>
            </GameGuard>
          }
        />
        <Route
          path="/roadmap"
          element={
            <GameGuard>
              <GameShell>
                <Roadmap />
              </GameShell>
            </GameGuard>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
