import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import Leaderboard from "@/pages/Leaderboard";
import AdminRewards from "@/pages/AdminRewards";
import Auth from "@/pages/Auth";
import Options from "@/pages/Options";
import Marketplace from "@/pages/Marketplace";
import Rewards from "@/pages/Rewards";
import Roadmap from "@/pages/Roadmap";

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
