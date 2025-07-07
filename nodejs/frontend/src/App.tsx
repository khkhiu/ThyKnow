import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Pet from "./pages/Pet";
import Streak from "./pages/Streak";
import Journal from "./pages/Journal";
import Care from "./pages/Care";
import Shop from "./pages/Shop";
import Achievements from "./pages/Achievements";
import Stats from "./pages/Stats";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Main ThyKnow app */}
          <Route path="/" element={<Index />} />
          
          {/* MiniApp specific routes */}
          <Route path="/pet" element={<Pet />} />
          <Route path="/streak" element={<Streak />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/care" element={<Care />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/stats" element={<Stats />} />
          
          {/* Catch-all route for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;