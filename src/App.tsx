import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Leaderboard from "./pages/Leaderboard.tsx";
import AdminRewards from "./pages/AdminRewards.tsx";
import Auth from "./pages/Auth.tsx";
import Options from "./pages/Options.tsx";
import Marketplace from "./pages/Marketplace.tsx";
import Rules from "./pages/Rules.tsx";
import Rewards from "./pages/Rewards.tsx";
import Roadmap from "./pages/Roadmap.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/admin/rewards" element={<AdminRewards />} />
          <Route path="/cards" element={<Navigate to="/marketplace" replace />} />
          <Route path="/wallet" element={<Navigate to="/marketplace" replace />} />
          <Route path="/options" element={<Options />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/rules" element={<Navigate to="/rewards" replace />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
